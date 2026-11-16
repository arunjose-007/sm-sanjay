from flask import Blueprint, request, jsonify, session
from app.models import db, User
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'
MAX_NORMAL_USERS = 20

@auth_bp.route('/registration-status', methods=['GET'])
def registration_status():
    normal_count = User.query.filter_by(role='user').count()
    return jsonify({
        'current_users': normal_count,
        'max_users': MAX_NORMAL_USERS,
        'limit_reached': normal_count >= MAX_NORMAL_USERS,
        'remaining_slots': max(0, MAX_NORMAL_USERS - normal_count)
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    # 1. Enforce maximum 20 normal user accounts limit on the backend
    normal_count = User.query.filter_by(role='user').count()
    if normal_count >= MAX_NORMAL_USERS:
        return jsonify({
            'error': 'Maximum user registration limit (20) reached.',
            'limit_reached': True
        }), 403

    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not full_name:
        return jsonify({'error': 'Full Name is required.'}), 400

    if not email:
        return jsonify({'error': 'Email Address is required.'}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Please provide a valid email address (e.g. name@example.com).'}), 400

    if not username:
        return jsonify({'error': 'Username is required.'}), 400

    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters.'}), 400

    if not password:
        return jsonify({'error': 'Password is required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    # Check whether the email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': f"An account with email '{email}' already exists. Please log in or use a different email."}), 409

    # Check whether the username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': f"Username '{username}' is already taken. Please choose another username."}), 409

    # Create new user
    user = User(
        username=username,
        email=email,
        full_name=full_name,
        role='user',
        account_status='active'
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Automatically log in the newly registered user
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role

    return jsonify({
        'message': f"Account created successfully! Welcome, {user.full_name}!",
        'user': user.to_dict(),
        'authenticated': True
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username_or_email = data.get('username', '').strip()
    password = data.get('password', '')

    if not username_or_email or not password:
        return jsonify({'error': 'Please provide username/email and password.'}), 400

    # Search by either username or email
    user = User.query.filter(
        (User.username == username_or_email) | (User.email == username_or_email.lower())
    ).first()

    if not user:
        return jsonify({'error': 'No account found with this username or email. Please register.'}), 404

    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password. Please verify your password and try again.'}), 401

    if getattr(user, 'account_status', 'active') == 'suspended':
        return jsonify({'error': 'Your account is suspended. Please contact administrator.'}), 403

    # Create session
    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role

    return jsonify({
        'message': f"Welcome back, {user.full_name}!",
        'user': user.to_dict(),
        'authenticated': True
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.', 'authenticated': False}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False, 'user': None}), 200

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'authenticated': False, 'user': None}), 200

    return jsonify({'authenticated': True, 'user': user.to_dict()}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('new_password', '')

    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'No account found with this email address.'}), 404

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters.'}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password has been updated successfully. You can now log in.'}), 200

@auth_bp.route('/users', methods=['GET'])
def list_users():
    # Admin endpoint to view registered users
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'count': len(users),
        'users': [u.to_dict() for u in users]
    }), 200
