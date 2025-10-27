from cryptography.fernet import Fernet
from passlib.context import CryptContext
import base64
import os
import json
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_encryption_key() -> bytes:
    """Get or generate encryption key for sensitive data"""
    key = settings.ENCRYPTION_KEY
    if not key:
        # Generate a new key if not provided
        key = Fernet.generate_key().decode()
    return key.encode() if isinstance(key, str) else key

cipher_suite = Fernet(get_encryption_key())

def encrypt_data(data: dict) -> str:
    """Encrypt dictionary data to string"""
    json_data = json.dumps(data)
    encrypted = cipher_suite.encrypt(json_data.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_data(encrypted_str: str) -> dict:
    """Decrypt string back to dictionary"""
    try:
        encrypted_bytes = base64.b64decode(encrypted_str.encode())
        decrypted = cipher_suite.decrypt(encrypted_bytes)
        return json.loads(decrypted.decode())
    except Exception as e:
        print(f"Decryption error: {e}")
        return {}

def hash_password(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)