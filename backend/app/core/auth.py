from dataclasses import dataclass

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    access_token: str


async def require_authenticated_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthenticatedUser:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured.")
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Sign in to continue.")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={
                    "apikey": settings.supabase_publishable_key,
                    "Authorization": f"Bearer {credentials.credentials}",
                },
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not verify your sign-in.") from exc

    if response.status_code in (401, 403):
        raise HTTPException(status_code=401, detail="Your sign-in has expired. Please sign in again.")
    if response.is_error:
        raise HTTPException(status_code=503, detail="Could not verify your sign-in.")
    try:
        user_id = response.json()["id"]
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Supabase returned an invalid user response.") from exc
    return AuthenticatedUser(user_id=str(user_id), access_token=credentials.credentials)
