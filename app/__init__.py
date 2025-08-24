# app/__init__.py
import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager

from .models import db, User  # User must be exported in app/models/__init__.py

# -------------------------
# Create and configure app
# -------------------------
app = Flask(__name__)

# Basic config (adjust as needed)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Extensions
db.init_app(app)
Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = "auth.login"  # adjust/remove if you don’t use auth
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# CORS so the Vite dev server can call the API with cookies
CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
)

# -------------------------
# Blueprints
# -------------------------
# IMPORTANT: these blueprints *already* declare their own url_prefix.
# Do NOT pass a url_prefix here, or you’ll double-prefix the routes.
from .api.abacus_routes import abacus_routes     # url_prefix='/api/abacus' inside file
from .api.spot_routes import spot_routes         # url_prefix='/api/spots' inside file

app.register_blueprint(abacus_routes)
app.register_blueprint(spot_routes)

# -------------------------
# Dev CSRF helper (matches your frontend Cookies.get("XSRF-TOKEN"))
# -------------------------
@app.after_request
def set_csrf_cookie(response):
    # In production, set secure=True and SameSite/Domain appropriately
    response.set_cookie(
        "XSRF-TOKEN",
        "dev-token",
        httponly=False,   # must be readable by JS
        samesite="Lax",
        secure=False,
        path="/",
    )
    return response
