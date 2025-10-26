import os
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from google.auth.transport import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from database import get_db
from services.user_service import UserService

load_dotenv()

class AuthService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID", "138254630293-hlb5lkltq1tpal54p1p5fo02f8c8bffe.apps.googleusercontent.com")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "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")
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # OAuth flow configuration
        self.client_config = {
            "web": {
                "client_id": self.client_id,
                "project_id": "hackpsu-476222",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_secret": self.client_secret,
                "redirect_uris": ["http://localhost:3000", "http://localhost:3001"]
            }
        }
    
    def get_authorization_url(self) -> str:
        """Generate Google OAuth authorization URL"""
        flow = Flow.from_client_config(
            self.client_config,
            scopes=[
                "openid",
                "email",
                "profile"
            ]
        )
        flow.redirect_uri = "http://localhost:3000"
        
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        return authorization_url
    
    async def verify_google_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Google ID token and extract user information"""
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.client_id
            )
            
            # Extract user information
            user_info = {
                "google_id": idinfo.get("sub"),
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "picture": idinfo.get("picture"),
                "verified_email": idinfo.get("email_verified", False)
            }
            
            return user_info
            
        except ValueError as e:
            print(f"Token verification failed: {e}")
            return None
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def create_user_session(self, user_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create user session with JWT token and save to database"""
        # Get database session
        db = next(get_db())
        user_service = UserService(db)
        
        # Get or create user in database
        user = user_service.get_or_create_user(user_info)
        
        # Create access token
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.create_access_token(
            data={"sub": str(user.id), "email": user.email, "google_id": user.google_id},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60,
            "user": {
                "id": user.id,
                "google_id": user.google_id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
                "verified_email": user.verified_email
            }
        }
