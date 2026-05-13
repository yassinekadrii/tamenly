from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import query_db, execute_db
import datetime
import json

assessments_bp = Blueprint('assessments', __name__)

@assessments_bp.route('', methods=['GET'])
@jwt_required()
def get_assessments():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    
    # Optional patient_id query param for doctors
    patient_id = request.args.get('patientId')
    if current_user['role'] == 'doctor' and patient_id:
        target_id = patient_id
    else:
        target_id = user_id

    assessments = query_db("SELECT * FROM assessments WHERE userId = %s ORDER BY createdAt DESC", (target_id,))
    
    # Parse JSON responses
    for a in assessments:
        if a['responses']:
            a['responses'] = json.loads(a['responses'])
        else:
            a['responses'] = []

    return jsonify({"success": True, "assessments": assessments})

@assessments_bp.route('', methods=['POST'])
@jwt_required()
def submit_assessment():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    data = request.json
    
    total_score = data.get('totalScore')
    status = data.get('status')
    responses = json.dumps(data.get('responses', []))

    try:
        ass_id = execute_db(
            "INSERT INTO assessments (userId, totalScore, status, responses, createdAt) VALUES (%s, %s, %s, %s, %s)",
            (user_id, total_score, status, responses, datetime.datetime.now())
        )
        return jsonify({"success": True, "assessmentId": ass_id}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
