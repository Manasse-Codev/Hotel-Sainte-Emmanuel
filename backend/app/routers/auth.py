import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.notification import Notification
from ..models.activity import Activity
from ..models.reservation import Reservation
from ..schemas.auth import RegisterRequest, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from ..schemas.user import UserOut, UserStats
from ..core.security import hash_password, verify_password, create_access_token
from ..core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cette adresse email",
        )

    user = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=data.email.lower().strip(),
        phone=data.phone.strip() if data.phone else None,
        password_hash=hash_password(data.password),
        role="client",
        loyalty_tier="standard",
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Bienvenue à l'Hôtel Sainte Emmanuelle",
        message=f"Ravis de vous compter parmi nos hôtes, {user.first_name}. Découvrez nos suites et préparez votre séjour à Soubré.",
        is_read=False,
    )
    # Registration activity
    reg_act = Activity(
        user_id=user.id,
        action="register",
        description=f"Création de compte réussie ({user.email})",
    )
    db.add_all([welcome_notif, reg_act])
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "loyalty_tier": user.loyalty_tier,
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Adresse email ou mot de passe incorrect",
        )

    # Log login activity
    act = Activity(
        user_id=user.id,
        action="login",
        description=f"Connexion réussie à l'Espace {('Administration' if user.role == 'admin' else 'Client')}",
    )
    db.add(act)
    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "loyalty_tier": user.loyalty_tier,
        }
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Déconnexion réussie"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate stats
    reservations = db.query(Reservation).filter(Reservation.user_id == current_user.id).all()
    total_stays = len(reservations)
    total_nights = 0
    for r in reservations:
        if r.check_in and r.check_out:
            total_nights += max(1, (r.check_out - r.check_in).days)

    points = total_nights * 100

    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "loyalty_tier": current_user.loyalty_tier,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
        "stats": {
            "total_stays": total_stays,
            "total_nights": total_nights,
            "loyalty_tier": current_user.loyalty_tier,
            "points": points,
        }
    }

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if user:
        reset_token = str(uuid.uuid4())[:8]
        user.reset_token = reset_token
        db.commit()
        return {
            "message": "Un code de réinitialisation a été généré.",
            "reset_token": reset_token  # For demo convenience
        }
    return {"message": "Si l'adresse existe, un lien a été envoyé."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Jeton de réinitialisation invalide ou expiré",
        )
    user.password_hash = hash_password(data.new_password)
    user.reset_token = None
    db.commit()
    return {"message": "Mot de passe réinitialisé avec succès"}
