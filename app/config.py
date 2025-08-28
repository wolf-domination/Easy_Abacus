import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")

    
    _db_url = os.environ.get("DATABASE_URL")
    if _db_url:
      
        if _db_url.startswith("postgres://"):
            _db_url = _db_url.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = _db_url
    else:
      
        os.makedirs(os.path.join(os.path.dirname(__file__), "..", "instance"), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = "sqlite:///../instance/dev.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
