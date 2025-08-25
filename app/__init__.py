import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager
from .models import db, User

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
)

from .api.abacus_routes import abacus_routes
from .api.spot_routes import spot_routes
from .api.spot_note_routes import spot_note_routes

app.register_blueprint(abacus_routes)
app.register_blueprint(spot_routes)
app.register_blueprint(spot_note_routes)

@app.after_request
def set_csrf_cookie(response):
    response.set_cookie("XSRF-TOKEN", "dev-token", httponly=False, samesite="Lax", secure=False, path="/")
    return response
