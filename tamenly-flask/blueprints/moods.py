from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import query_db, execute_db
import datetime

moods_bp = Blueprint('moods', __name__)

@moods_bp.route('', methods=['GET'])
@jwt_required()
def get_moods():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    
    # Optional patient_id query param for doctors
    patient_id = request.args.get('patientId')
    if current_user['role'] == 'doctor' and patient_id:
        target_id = patient_id
    else:
        target_id = user_id

    moods = query_db("SELECT * FROM moods WHERE userId = %s ORDER BY createdAt DESC", (target_id,))
    return jsonify({"success": True, "moods": moods})

@moods_bp.route('', methods=['POST'])
@jwt_required()
def add_mood():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    data = request.json
    
    score = data.get('score')
    note = data.get('note', '')

    try:
        mood_id = execute_db(
            "INSERT INTO moods (userId, score, note, createdAt) VALUES (%s, %s, %s, %s)",
            (user_id, score, note, datetime.datetime.now())
        )
        return jsonify({"success": True, "moodId": mood_id}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
