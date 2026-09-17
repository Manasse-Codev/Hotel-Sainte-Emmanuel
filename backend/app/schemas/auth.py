from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr = Field(..., max_length=100)
    password: str = Field(..., min_length=6, max_length=128)
    phone: Optional[str] = Field(None, max_length=25)

    class Config:
        extra = "ignore"

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=100)
    password: str = Field(..., min_length=1, max_length=128)

    class Config:
        extra = "ignore"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., max_length=100)

    class Config:
        extra = "ignore"

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=4, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)

    class Config:
        extra = "ignore"
