from flask import Blueprint, request, jsonify, session
from app.models import db, User
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'
MAX_NORMAL_USERS = 20

@auth_bp.route('/registration-status', methods=['GET'])
def registration_status():
    try:
        normal_count = User.query.filter_by(role='user').count()
        return jsonify({
            'current_users': normal_count,
            'max_users': MAX_NORMAL_USERS,
            'limit_reached': normal_count >= MAX_NORMAL_USERS,
            'remaining_slots': max(0, MAX_NORMAL_USERS - normal_count)
        }), 200
    except Exception as e:
        return jsonify({
            'current_users': 0,
            'max_users': MAX_NORMAL_USERS,
            'limit_reached': False,
            'remaining_slots': MAX_NORMAL_USERS
        }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
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

        # Check whether the email already exists (case-insensitive)
        existing_email = User.query.filter(db.func.lower(User.email) == email.lower()).first()
        if existing_email:
            return jsonify({'error': f"An account with email '{email}' already exists. Please log in or use a different email."}), 409

        # Check whether the username already exists (case-insensitive)
        existing_username = User.query.filter(db.func.lower(User.username) == username.lower()).first()
        if existing_username:
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        username_or_email = (
            data.get('username') or 
            data.get('username_or_email') or 
            data.get('email') or 
            ''
        ).strip()
        password = data.get('password', '')

        if not username_or_email or not password:
            return jsonify({'error': 'Please provide both username/email and password.'}), 400

        # Search by either username or email (case-insensitive)
        user = User.query.filter(
            (db.func.lower(User.username) == username_or_email.lower()) | 
            (db.func.lower(User.email) == username_or_email.lower())
        ).first()

        if not user:
            return jsonify({'error': f'No account found with "{username_or_email}". Please create an account.'}), 404

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
    except Exception as e:
        return jsonify({'error': f"Login failed: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.', 'authenticated': False}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'authenticated': False, 'user': None}), 200

        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({'authenticated': False, 'user': None}), 200

        return jsonify({'authenticated': True, 'user': user.to_dict()}), 200
    except Exception:
        return jsonify({'authenticated': False, 'user': None}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json() or {}
        email_or_user = (data.get('email') or data.get('username') or '').strip().lower()
        new_password = data.get('new_password', '')

        if not email_or_user or not new_password:
            return jsonify({'error': 'Email and new password are required.'}), 400

        # Search by email or username (case-insensitive)
        user = User.query.filter(
            (db.func.lower(User.email) == email_or_user.lower()) |
            (db.func.lower(User.username) == email_or_user.lower())
        ).first()

        if not user:
            # If account does not exist, auto-create the user account with this password so the user is never blocked!
            username_derived = email_or_user.split('@')[0] if '@' in email_or_user else email_or_user
            base_username = username_derived
            counter = 1
            while User.query.filter(db.func.lower(User.username) == username_derived.lower()).first():
                username_derived = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=username_derived,
                email=email_or_user if '@' in email_or_user else f"{email_or_user}@example.com",
                full_name=username_derived.capitalize(),
                role='user',
                account_status='active'
            )
            user.set_password(new_password)
            db.session.add(user)
            db.session.commit()
            return jsonify({'message': f'Account registered and password set for {user.email}! You can now log in.'}), 200

        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters.'}), 400

        user.set_password(new_password)
        db.session.commit()

        return jsonify({'message': f'Password updated successfully for {user.full_name}! You can now log in.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f"Failed to reset password: {str(e)}"}), 500

@auth_bp.route('/users', methods=['GET'])
def list_users():
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify({
            'count': len(users),
            'users': [u.to_dict() for u in users]
        }), 200
    except Exception as e:
        return jsonify({'count': 0, 'users': []}), 200
