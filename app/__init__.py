import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager

from .models import db, User

app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)
Migrate(app, db)

login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Configure CORS for production and development
allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if os.environ.get("FLASK_ENV") == "production":
    production_url = os.environ.get("FRONTEND_URL", "https://easy-abacus-2.onrender.com")
    allowed_origins.append(production_url)

CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": allowed_origins}},
)

from .api.abacus_routes import abacus_routes
from .api.project_routes import project_routes
from .api.auth_routes import auth_routes
from .seeds import seed_commands

app.register_blueprint(abacus_routes)
app.register_blueprint(project_routes)
app.register_blueprint(auth_routes)
app.cli.add_command(seed_commands)

@app.after_request
def set_csrf_cookie(response):
    # Generate proper CSRF token for production
    csrf_token = os.environ.get("CSRF_TOKEN", "dev-token")
    response.set_cookie(
        "XSRF-TOKEN", 
        csrf_token, 
        httponly=False, 
        samesite="Lax", 
        secure=os.environ.get("FLASK_ENV") == "production",
        path="/"
    )
    return response

@app.get("/uploads/<path:filename>")
def uploads(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Serve static files from React build
    static_folder = os.path.join(BASE_DIR, "..", "react-vite", "dist")
    
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, "index.html")
