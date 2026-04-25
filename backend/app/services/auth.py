from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.db.database import get_db

bearer = HTTPBearer()

def register_user(db: Session, name: str, email: str, password: str) -> User:
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=name, email=email, password_hash=hash_password(password))
    db.add(user); db.commit(); db.refresh(user)
    return user

def login_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer", "user": user}

def get_current_user(credentials: HTTPAuthorizationCredentials=Depends(bearer), db: Session=Depends(get_db)) -> User:
    payload = decode_token(credentials.credentials)
    if not payload: raise HTTPException(401, "Invalid token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user: raise HTTPException(401, "User not found")
    return user
