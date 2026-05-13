from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import query_db, execute_db
import json
import datetime

prescriptions_bp = Blueprint('prescriptions', __name__)

@prescriptions_bp.route('', methods=['GET'])
@jwt_required()
def get_prescriptions():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    role = current_user['role']

    if role == 'doctor':
        prescriptions = query_db("""
            SELECT p.*, u.firstName as patientFirstName, u.lastName as patientLastName
            FROM prescriptions p
            JOIN users u ON p.patientId = u.id
            WHERE p.doctorId = %s
            ORDER BY p.createdAt DESC
        """, (user_id,))
    else:
        prescriptions = query_db("""
            SELECT p.*, u.firstName as doctorFirstName, u.lastName as doctorLastName
            FROM prescriptions p
            JOIN users u ON p.doctorId = u.id
            WHERE p.patientId = %s
            ORDER BY p.createdAt DESC
        """, (user_id,))

    # Parse JSON strings back to lists
    for p in prescriptions:
        if p['medicines']:
            p['medicines'] = json.loads(p['medicines'])
        else:
            p['medicines'] = []
            
        if p['exercises']:
            p['exercises'] = json.loads(p['exercises'])
        else:
            p['exercises'] = []

    return jsonify({"success": True, "prescriptions": prescriptions})

@prescriptions_bp.route('', methods=['POST'])
@jwt_required()
def create_prescription():
    current_user = get_jwt_identity()
    doctor_id = current_user['id']
    
    if current_user['role'] != 'doctor':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    data = request.json
    patient_id = data.get('patientId')
    medicines = json.dumps(data.get('medicines', []))
    exercises = json.dumps(data.get('exercises', []))
    instructions = data.get('instructions', '')
    pdf_base64 = data.get('pdfBase64', None)

    try:
        presc_id = execute_db("""
            INSERT INTO prescriptions (doctorId, patientId, medicines, exercises, instructions, pdfBase64, createdAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (doctor_id, patient_id, medicines, exercises, instructions, pdf_base64, datetime.datetime.now()))
        
        return jsonify({"success": True, "prescriptionId": presc_id}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
