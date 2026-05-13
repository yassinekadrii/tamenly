from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db import query_db, execute_db
import datetime

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'patient')

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    # Check if user exists
    user = query_db("SELECT id FROM users WHERE email = %s", (email,), one=True)
    if user:
        return jsonify({"success": False, "message": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    
    try:
        user_id = execute_db(
            "INSERT INTO users (firstName, lastName, email, password, role) VALUES (%s, %s, %s, %s, %s)",
            (first_name, last_name, email, hashed_pw, role)
        )
        
        access_token = create_access_token(identity={"id": user_id, "role": role}, expires_delta=datetime.timedelta(days=7))
        
        return jsonify({
            "success": True,
            "token": access_token,
            "user": {"id": user_id, "firstName": first_name, "lastName": last_name, "email": email, "role": role}
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    user = query_db("SELECT * FROM users WHERE email = %s", (email,), one=True)
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    access_token = create_access_token(identity={"id": user['id'], "role": user['role']}, expires_delta=datetime.timedelta(days=7))
    
    return jsonify({
        "success": True,
        "token": access_token,
        "user": {
            "id": user['id'],
            "firstName": user['firstName'],
            "lastName": user['lastName'],
            "email": user['email'],
            "role": user['role']
        }
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user = get_jwt_identity()
    user = query_db("SELECT id, firstName, lastName, email, role, phone, bio, avatar FROM users WHERE id = %s", (current_user['id'],), one=True)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({"success": True, "user": user})
