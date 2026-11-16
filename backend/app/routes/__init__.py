# Routes package
from app.routes.auth import auth_bp
from app.routes.livelihood import livelihood_bp
from app.routes.fisherman import fisherman_bp
from app.routes.driver import driver_bp
from app.routes.ai import ai_bp
from app.routes.emergency import emergency_bp
from app.routes.weather import weather_bp
from app.routes.admin import admin_bp

__all__ = [
    'auth_bp',
    'livelihood_bp',
    'fisherman_bp',
    'driver_bp',
    'ai_bp',
    'emergency_bp',
    'weather_bp',
    'admin_bp',
]
