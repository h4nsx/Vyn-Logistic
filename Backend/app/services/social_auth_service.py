from typing import Any

import httpx
from fastapi import HTTPException

from app.config import settings


async def verify_google_id_token(id_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    data = response.json()
    if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")
    if str(data.get("email_verified", "")).lower() != "true":
        raise HTTPException(status_code=401, detail="Google email not verified")

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    return {
        "email": email.lower(),
        "name": data.get("name") or "",
        "provider_user_id": data.get("sub"),
        "avatar_url": data.get("picture"),
    }


async def verify_github_access_token(access_token: str) -> dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        user_res = await client.get("https://api.github.com/user", headers=headers)
        if user_res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid GitHub token")
        user_data = user_res.json()

        email = user_data.get("email")
        if not email:
            emails_res = await client.get("https://api.github.com/user/emails", headers=headers)
            if emails_res.status_code != 200:
                raise HTTPException(status_code=400, detail="Cannot fetch GitHub email")
            emails = emails_res.json()
            primary_verified = next(
                (e for e in emails if e.get("primary") and e.get("verified")),
                None,
            )
            if not primary_verified:
                raise HTTPException(
                    status_code=400,
                    detail="GitHub account must have a primary verified email",
                )
            email = primary_verified.get("email")

    return {
        "email": email.lower(),
        "name": user_data.get("name") or user_data.get("login") or "",
        "provider_user_id": str(user_data.get("id")),
        "avatar_url": user_data.get("avatar_url"),
    }
