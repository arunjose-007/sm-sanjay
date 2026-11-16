from flask import Blueprint, request, jsonify
from app.services.weather_service import WeatherService
from app.models import WeatherRecord

weather_bp = Blueprint('weather', __name__, url_prefix='/api/weather')

@weather_bp.route('/current', methods=['GET'])
def get_current_weather():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    location_name = request.args.get('name')

    weather = WeatherService.get_weather(lat, lon, location_name)
    return jsonify(weather), 200

@weather_bp.route('/cached', methods=['GET'])
def get_cached_weather():
    records = WeatherRecord.query.order_by(WeatherRecord.recorded_at.desc()).limit(20).all()
    return jsonify({
        'count': len(records),
        'records': [r.to_dict() for r in records]
    }), 200
