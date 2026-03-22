import html

import httpx
from fastapi import HTTPException

from app.config import settings


async def send_password_reset_email(to_email: str, reset_token: str) -> None:
    if not settings.RESEND_API_KEY:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY is not configured")

    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
    safe_link = html.escape(reset_link)
    safe_email = html.escape(to_email)

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": "Reset your password",
        "html": (
            "<p>We received a request to reset your password.</p>"
            f"<p><a href='{safe_link}'>Click here to reset password</a></p>"
            "<p>This link expires soon. If you did not request it, you can ignore this email.</p>"
            f"<p>Account: {safe_email}</p>"
        ),
    }
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            json=payload,
            headers=headers,
        )

    if response.status_code >= 300:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to send reset email: {response.text}",
        )
