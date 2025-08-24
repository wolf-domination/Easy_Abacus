# app/models/__init__.py
from .db import db, environment, SCHEMA

# Import models so SQLAlchemy registers tables
from .user import User
from .spot import Spot

__all__ = ["db", "environment", "SCHEMA", "User", "Spot"]
