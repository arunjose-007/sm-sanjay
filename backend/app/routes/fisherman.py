from flask import Blueprint, request, jsonify
from app.models import FishingAlert
from app.services.weather_service import WeatherService

fisherman_bp = Blueprint('fisherman', __name__, url_prefix='/api/fisherman')

@fisherman_bp.route('/overview', methods=['GET'])
def get_fisherman_overview():
    lat = request.args.get('lat', type=float, default=9.2876) # Coastal Rameswaram
    lon = request.args.get('lon', type=float, default=79.3129)

    weather_data = WeatherService.get_weather(lat, lon, location_name="Coastal Waters (Palk Bay / Gulf of Mannar)")
    alerts = FishingAlert.query.order_by(FishingAlert.created_at.desc()).all()

    # Determine overall marine safety status
    has_danger = any(a.severity == 'danger' for a in alerts)
    has_advisory = any(a.severity == 'advisory' for a in alerts)

    if has_danger:
        safety_status = {
            'level': 'danger',
            'badge': 'Severe Weather Warning',
            'message': 'Dangerous sea conditions. Venturing into deep water is strictly restricted.',
            'color': '#ef4444'
        }
    elif has_advisory:
        safety_status = {
            'level': 'advisory',
            'badge': 'Maritime Advisory',
            'message': 'Moderate swells observed. Small crafts should exercise caution.',
            'color': '#f59e0b'
        }
    else:
        safety_status = {
            'level': 'safe',
            'badge': 'Safe for Sailing',
            'message': 'Calm to moderate sea. Normal fishing activities permitted.',
            'color': '#10b981'
        }

    return jsonify({
        'weather': weather_data,
        'alerts': [a.to_dict() for a in alerts],
        'safety_status': safety_status,
        'wave_information': {
            'current_wave_height': '1.2 - 1.8 m',
            'wave_direction': 'South-Southeast (SSE)',
            'wave_period': '6.4 seconds',
            'sea_state': 'Moderate Churn'
        },
        'wind_information': {
            'wind_speed': f"{weather_data.get('wind_speed', 14)} km/h",
            'wind_direction': 'SSE',
            'gusts': f"{round(weather_data.get('wind_speed', 14) * 1.35, 1)} km/h",
            'beaufort_scale': 'Force 3 (Gentle Breeze)'
        }
    }), 200

@fisherman_bp.route('/alerts', methods=['GET'])
def get_alerts():
    severity = request.args.get('severity', '').strip()
    query = FishingAlert.query
    if severity and severity.lower() != 'all':
        query = query.filter_by(severity=severity.lower())

    alerts = query.order_by(FishingAlert.created_at.desc()).all()
    return jsonify({
        'count': len(alerts),
        'alerts': [a.to_dict() for a in alerts]
    }), 200
