import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from app.models import db
from app.services.seeder import seed_database

def create_app(config_class=Config):
    # Locate frontend/dist if available
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    static_folder = dist_dir if os.path.exists(dist_dir) else None

    app = Flask(__name__, instance_relative_config=True, static_folder=static_folder, static_url_path='')
    app.config.from_object(config_class)

    # Ensure the instance directory exists for SQLite database if not on Vercel read-only filesystem
    if not os.environ.get('VERCEL'):
        try:
            os.makedirs(app.instance_path, exist_ok=True)
        except Exception:
            pass

    # Enable CORS for React frontend (Supports Localhost, LAN IPs, Mobile devices)
    CORS(app, supports_credentials=True, origins=r".*")

    # Initialize Database
    db.init_app(app)

    # Register API Blueprints
    from app.routes.auth import auth_bp
    from app.routes.livelihood import livelihood_bp
    from app.routes.fisherman import fisherman_bp
    from app.routes.driver import driver_bp
    from app.routes.ai import ai_bp
    from app.routes.emergency import emergency_bp
    from app.routes.weather import weather_bp
    from app.routes.places import places_bp
    from app.routes.admin import admin_bp

    blueprints = [
        (auth_bp, 'auth'),
        (livelihood_bp, 'livelihood'),
        (fisherman_bp, 'fisherman'),
        (driver_bp, 'driver'),
        (ai_bp, 'ai'),
        (emergency_bp, 'emergency'),
        (weather_bp, 'weather'),
        (places_bp, 'places'),
        (admin_bp, 'admin')
    ]

    for bp, name in blueprints:
        app.register_blueprint(bp)
        app.register_blueprint(bp, name=f"{name}_alt", url_prefix=f"/{name}")

    @app.route('/api/health', methods=['GET'])
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'application': 'Intelligent Assistant for Livelihood and Road Safety',
            'database': 'SQLite Storage',
            'ai_engine': 'Ready'
        }), 200

    # Serve built React frontend if dist exists
    if static_folder and os.path.exists(os.path.join(static_folder, 'index.html')):
        @app.route('/')
        def serve_root():
            return send_from_directory(static_folder, 'index.html')

        @app.route('/<path:path>')
        def serve_static(path):
            file_path = os.path.join(static_folder, path)
            if os.path.exists(file_path):
                return send_from_directory(static_folder, path)
            return send_from_directory(static_folder, 'index.html')

    # Initialize tables and seed default data
    with app.app_context():
        db.create_all()
        seed_database()

    return app
