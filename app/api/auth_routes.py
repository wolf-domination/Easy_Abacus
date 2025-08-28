from flask import Blueprint, request
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': {'message': 'Unauthorized'}}, 401


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {'errors': {'message': 'Email and password are required'}}, 400
    
    user = User.query.filter(User.email == email).first()
    
    if not user:
        return {'errors': {'email': 'Email provided not found.'}}, 401
    
    if not user.check_password(password):
        return {'errors': {'password': 'Password was incorrect.'}}, 401
    
    login_user(user)
    return user.to_dict()


@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    
    if not email or not username or not password:
        return {'errors': {'message': 'Email, username, and password are required'}}, 400
    
    # Check if user already exists
    existing_user = User.query.filter(User.email == email).first()
    if existing_user:
        return {'errors': {'email': 'Email address is already in use.'}}, 400
    
    existing_username = User.query.filter(User.username == username).first()
    if existing_username:
        return {'errors': {'username': 'Username is already in use.'}}, 400
    
    user = User(
        username=username,
        email=email,
        password=password
    )
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return user.to_dict()


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {'errors': {'message': 'Unauthorized'}}, 401


@auth_routes.route('/create-demo-user', methods=['POST'])
def create_demo_user():
    """
    Creates the demo user if it doesn't exist
    """
    demo_email = "demo@aa.io"
    existing_user = User.query.filter_by(email=demo_email).first()
    
    if existing_user:
        return {'message': 'Demo user already exists', 'user': existing_user.to_dict()}
    
    demo_user = User(
        username="Demo",
        email=demo_email,
        password="password"
    )
    
    db.session.add(demo_user)
    db.session.commit()
    
    return {'message': 'Demo user created successfully', 'user': demo_user.to_dict()}, 201


@auth_routes.route('/check-user/<email>')
def check_user(email):
    """
    Check if a user exists (for debugging)
    """
    user = User.query.filter_by(email=email).first()
    if user:
        return {'exists': True, 'user': user.to_dict()}
    else:
        return {'exists': False, 'message': 'User not found'}