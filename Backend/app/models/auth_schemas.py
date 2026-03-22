from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "user"


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class SocialSignInRequest(BaseModel):
    token: str
    role: str = "user"


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    access_expires_in_minutes: int


class UserPublic(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    auth_provider: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    access_expires_in_minutes: int
    user: UserPublic


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
