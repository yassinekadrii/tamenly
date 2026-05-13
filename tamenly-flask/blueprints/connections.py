from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import query_db, execute_db

connections_bp = Blueprint('connections', __name__)

@connections_bp.route('', methods=['GET'])
@jwt_required()
def get_connections():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    role = current_user['role']

    if role == 'doctor':
        # Get patients connected to this doctor
        connections = query_db("""
            SELECT c.*, u.id as patient_id, u.firstName, u.lastName, u.email, u.phone, u.avatar, u.bio
            FROM connections c
            JOIN users u ON c.patientId = u.id
            WHERE c.doctorId = %s
        """, (user_id,))
        
        # Format the output to match frontend expectations
        results = []
        for conn in connections:
            results.append({
                "_id": conn['id'],
                "status": conn['status'],
                "patient": {
                    "_id": conn['patient_id'],
                    "firstName": conn['firstName'],
                    "lastName": conn['lastName'],
                    "email": conn['email'],
                    "phone": conn['phone'],
                    "avatar": conn['avatar'],
                    "bio": conn['bio']
                }
            })
        return jsonify({"success": True, "connections": results})
    else:
        # Get doctors connected to this patient
        connections = query_db("""
            SELECT c.*, u.id as doctor_id, u.firstName, u.lastName, u.email, u.phone, u.avatar, u.bio
            FROM connections c
            JOIN users u ON c.doctorId = u.id
            WHERE c.patientId = %s
        """, (user_id,))
        
        results = []
        for conn in connections:
            results.append({
                "_id": conn['id'],
                "status": conn['status'],
                "doctor": {
                    "_id": conn['doctor_id'],
                    "firstName": conn['firstName'],
                    "lastName": conn['lastName'],
                    "email": conn['email'],
                    "phone": conn['phone'],
                    "avatar": conn['avatar'],
                    "bio": conn['bio']
                }
            })
        return jsonify({"success": True, "connections": results})

@connections_bp.route('/status/<patient_id>', methods=['GET'])
@jwt_required()
def get_connection_status(patient_id):
    current_user = get_jwt_identity()
    doctor_id = current_user['id']
    
    conn = query_db("SELECT * FROM connections WHERE doctorId = %s AND patientId = %s", (doctor_id, patient_id), one=True)
    if not conn:
        return jsonify({"success": True, "status": "none"})
    
    return jsonify({"success": True, "status": conn['status']})
