from datetime import datetime, timezone
from uuid import uuid4

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.database import get_db
from app.models.auth_schemas import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    RefreshResponse,
    ResetPasswordRequest,
    SignInRequest,
    SignUpRequest,
    SocialSignInRequest,
    UserPublic,
)
from app.services.auth_service import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.services.email_service import send_password_reset_email
from app.services.social_auth_service import (
    verify_github_access_token,
    verify_google_id_token,
)

router = APIRouter()
security = HTTPBearer(auto_error=False)

ALLOWED_ROLES = {"admin", "user"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


def _user_public(doc: dict) -> UserPublic:
    return UserPublic(
        user_id=doc["user_id"],
        email=doc["email"],
        role=doc["role"],
        auth_provider=doc.get("auth_provider", "local"),
    )


async def _issue_tokens(response: Response, user: dict, request: Request) -> AuthResponse:
    db = get_db()
    access_token = create_access_token(user["user_id"], user["email"], user["role"])
    refresh_token, token_hash, expires_at, jti = create_refresh_token(user["user_id"])

    await db.refresh_tokens.insert_one(
        {
            "user_id": user["user_id"],
            "jti": jti,
            "token_hash": token_hash,
            "created_at": _now(),
            "expires_at": expires_at,
            "revoked": False,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }
    )

    _set_refresh_cookie(response, refresh_token)
    return AuthResponse(
        access_token=access_token,
        access_expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=_user_public(user),
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization bearer token",
        )
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token expired") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid access token") from None

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid access token payload")

    db = get_db()
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


@router.post("/auth/signup", response_model=AuthResponse, summary="Sign up with email/password")
async def signup(body: SignUpRequest, response: Response, request: Request):
    db = get_db()
    email = str(body.email).lower()

    existing = await db.users.find_one({"email": email}, {"_id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Security decision: self-signup always uses `user` role.
    selected_role = body.role.lower()
    if selected_role not in ALLOWED_ROLES:
        selected_role = "user"
    role = "user"

    now = _now()
    user = {
        "user_id": str(uuid4()),
        "email": email,
        "password_hash": hash_password(body.password),
        "role": role,
        "is_active": True,
        "auth_provider": "local",
        "created_at": now,
        "updated_at": now,
        "requested_role_at_signup": selected_role,
    }
    await db.users.insert_one(user)

    return await _issue_tokens(response=response, user=user, request=request)


@router.post("/auth/signin", response_model=AuthResponse, summary="Sign in with email/password")
async def signin(body: SignInRequest, response: Response, request: Request):
    db = get_db()
    email = str(body.email).lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_hash = user.get("password_hash")
    if not password_hash:
        raise HTTPException(
            status_code=400,
            detail="This account does not use local password login",
        )
    if not verify_password(body.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login_at": _now()}},
    )
    user["last_login_at"] = _now()
    return await _issue_tokens(response=response, user=user, request=request)


@router.post("/auth/social/google", response_model=AuthResponse, summary="Sign in with Google token")
async def signin_google(body: SocialSignInRequest, response: Response, request: Request):
    db = get_db()
    profile = await verify_google_id_token(body.token)
    email = profile["email"]

    user = await db.users.find_one({"email": email}, {"_id": 0})
    now = _now()
    if not user:
        user = {
            "user_id": str(uuid4()),
            "email": email,
            "password_hash": None,
            "role": "user",
            "is_active": True,
            "auth_provider": "google",
            "provider_user_id": profile.get("provider_user_id"),
            "display_name": profile.get("name"),
            "avatar_url": profile.get("avatar_url"),
            "created_at": now,
            "updated_at": now,
            "last_login_at": now,
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "auth_provider": user.get("auth_provider", "google"),
                    "display_name": profile.get("name") or user.get("display_name"),
                    "avatar_url": profile.get("avatar_url") or user.get("avatar_url"),
                    "last_login_at": now,
                    "updated_at": now,
                }
            },
        )

    return await _issue_tokens(response=response, user=user, request=request)


@router.post("/auth/social/github", response_model=AuthResponse, summary="Sign in with GitHub token")
async def signin_github(body: SocialSignInRequest, response: Response, request: Request):
    db = get_db()
    profile = await verify_github_access_token(body.token)
    email = profile["email"]

    user = await db.users.find_one({"email": email}, {"_id": 0})
    now = _now()
    if not user:
        user = {
            "user_id": str(uuid4()),
            "email": email,
            "password_hash": None,
            "role": "user",
            "is_active": True,
            "auth_provider": "github",
            "provider_user_id": profile.get("provider_user_id"),
            "display_name": profile.get("name"),
            "avatar_url": profile.get("avatar_url"),
            "created_at": now,
            "updated_at": now,
            "last_login_at": now,
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "auth_provider": user.get("auth_provider", "github"),
                    "display_name": profile.get("name") or user.get("display_name"),
                    "avatar_url": profile.get("avatar_url") or user.get("avatar_url"),
                    "last_login_at": now,
                    "updated_at": now,
                }
            },
        )

    return await _issue_tokens(response=response, user=user, request=request)


@router.post("/auth/refresh", response_model=RefreshResponse, summary="Refresh access token")
async def refresh_token(request: Request, response: Response):
    db = get_db()
    token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token cookie")

    try:
        payload = decode_token(token, expected_type="refresh")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from None

    user_id = payload.get("sub")
    jti = payload.get("jti")
    token_hash = hash_token(token)
    if not user_id or not jti:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    record = await db.refresh_tokens.find_one(
        {
            "user_id": user_id,
            "jti": jti,
            "token_hash": token_hash,
            "revoked": False,
        }
    )
    if not record:
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

    if record.get("expires_at") and record["expires_at"] < _now():
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate refresh token on every refresh.
    await db.refresh_tokens.update_one(
        {"token_hash": token_hash},
        {"$set": {"revoked": True, "revoked_at": _now()}},
    )

    access_token = create_access_token(user["user_id"], user["email"], user["role"])
    new_refresh_token, new_hash, expires_at, new_jti = create_refresh_token(user["user_id"])
    await db.refresh_tokens.insert_one(
        {
            "user_id": user["user_id"],
            "jti": new_jti,
            "token_hash": new_hash,
            "created_at": _now(),
            "expires_at": expires_at,
            "revoked": False,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }
    )
    _set_refresh_cookie(response, new_refresh_token)

    return RefreshResponse(
        access_token=access_token,
        access_expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )


@router.post("/auth/logout", summary="Logout current session")
async def logout(request: Request, response: Response):
    db = get_db()
    token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if token:
        await db.refresh_tokens.update_one(
            {"token_hash": hash_token(token)},
            {"$set": {"revoked": True, "revoked_at": _now()}},
        )
    _clear_refresh_cookie(response)
    return {"status": "success", "message": "Logged out"}


@router.get("/auth/me", response_model=UserPublic, summary="Get current user profile")
async def me(current_user: dict = Depends(get_current_user)):
    return _user_public(current_user)


@router.post("/auth/change-password", summary="Change account password")
async def change_password(
    body: ChangePasswordRequest,
    response: Response,
    current_user: dict = Depends(get_current_user),
):
    password_hash = current_user.get("password_hash")
    if not password_hash:
        raise HTTPException(
            status_code=400,
            detail="This account has no local password. Use social login.",
        )
    if not verify_password(body.current_password, password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if body.current_password == body.new_password:
        raise HTTPException(status_code=400, detail="New password must be different")

    db = get_db()
    now = _now()
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"password_hash": hash_password(body.new_password), "updated_at": now}},
    )
    # Revoke all refresh tokens for safety.
    await db.refresh_tokens.update_many(
        {"user_id": current_user["user_id"], "revoked": False},
        {"$set": {"revoked": True, "revoked_at": now}},
    )
    _clear_refresh_cookie(response)
    return {"status": "success", "message": "Password changed. Please sign in again."}


@router.post("/auth/forgot-password", summary="Send password reset link")
async def forgot_password(body: ForgotPasswordRequest):
    db = get_db()
    email = str(body.email).lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})

    # Keep response generic to avoid account enumeration.
    if not user or not user.get("password_hash"):
        return {"status": "success", "message": "If email exists, reset link was sent."}

    raw_token, token_hash, exp_at = create_password_reset_token()
    now = _now()
    await db.password_reset_tokens.update_many(
        {"user_id": user["user_id"], "used": False},
        {"$set": {"used": True, "used_at": now}},
    )
    await db.password_reset_tokens.insert_one(
        {
            "user_id": user["user_id"],
            "token_hash": token_hash,
            "created_at": now,
            "expires_at": exp_at,
            "used": False,
        }
    )

    await send_password_reset_email(to_email=email, reset_token=raw_token)
    return {"status": "success", "message": "If email exists, reset link was sent."}


@router.post("/auth/reset-password", summary="Reset password with token from email")
async def reset_password(body: ResetPasswordRequest, response: Response):
    db = get_db()
    token_hash = hash_token(body.token)
    record = await db.password_reset_tokens.find_one({"token_hash": token_hash, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if record.get("expires_at") and record["expires_at"] < _now():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_id = record["user_id"]
    now = _now()
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"password_hash": hash_password(body.new_password), "updated_at": now}},
    )
    await db.password_reset_tokens.update_one(
        {"token_hash": token_hash},
        {"$set": {"used": True, "used_at": now}},
    )
    await db.refresh_tokens.update_many(
        {"user_id": user_id, "revoked": False},
        {"$set": {"revoked": True, "revoked_at": now}},
    )
    _clear_refresh_cookie(response)

    return {"status": "success", "message": "Password reset successful. Please sign in."}
