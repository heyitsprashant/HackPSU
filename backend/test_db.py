#!/usr/bin/env python3
"""
Test script to verify database functionality
"""

from database import create_tables, SessionLocal, User
from services.user_service import UserService

def test_database():
    print("Creating database tables...")
    create_tables()
    print("[SUCCESS] Database tables created successfully!")
    
    print("\nTesting user operations...")
    db = SessionLocal()
    user_service = UserService(db)
    
    # Test user data
    test_user_data = {
        "google_id": "test-google-id-123",
        "email": "test@example.com",
        "name": "Test User",
        "picture": "https://example.com/picture.jpg",
        "verified_email": True
    }
    
    # Create user
    user = user_service.get_or_create_user(test_user_data)
    print(f"[SUCCESS] User created: {user.name} ({user.email})")
    
    # Test getting user
    found_user = user_service.get_user_by_google_id("test-google-id-123")
    print(f"[SUCCESS] User found: {found_user.name if found_user else 'Not found'}")
    
    # Test getting user by email
    found_user_by_email = user_service.get_user_by_email("test@example.com")
    print(f"[SUCCESS] User found by email: {found_user_by_email.name if found_user_by_email else 'Not found'}")
    
    db.close()
    print("\n[SUCCESS] Database test completed successfully!")

if __name__ == "__main__":
    test_database()
