"""
FastAPI Backend Server Entry Point
This is the main entry point for the AFO Platform backend service
"""
from main import app

# Export the app instance for uvicorn
__all__ = ['app']
