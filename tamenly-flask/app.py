from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# JWT Setup
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret')
jwt = JWTManager(app)

# Import and register blueprints
from blueprints.auth import auth_bp
from blueprints.connections import connections_bp
from blueprints.prescriptions import prescriptions_bp
from blueprints.moods import moods_bp
from blueprints.assessments import assessments_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(connections_bp, url_prefix='/api/connections')
app.register_blueprint(prescriptions_bp, url_prefix='/api/prescriptions')
app.register_blueprint(moods_bp, url_prefix='/api/moods')
app.register_blueprint(assessments_bp, url_prefix='/api/assessments')

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback to index.html for SPA-like behavior if needed, 
        # but here we serve specific HTML files.
        if path.endswith('.html'):
             return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health')
def health_check():
    return jsonify({"success": True, "message": "Flask server is running", "status": "healthy"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=False)
