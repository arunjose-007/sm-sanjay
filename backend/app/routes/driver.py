import math
from flask import Blueprint, request, jsonify
from app.models import RoadAlert, Hospital

driver_bp = Blueprint('driver', __name__, url_prefix='/api/driver')

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two GPS coordinates."""
    R = 6371.0 # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

@driver_bp.route('/overview', methods=['GET'])
def get_driver_overview():
    user_lat = request.args.get('lat', type=float, default=11.1271)
    user_lon = request.args.get('lon', type=float, default=78.6569)

    road_alerts = RoadAlert.query.filter_by(is_active=True).order_by(RoadAlert.created_at.desc()).all()
    hospitals = Hospital.query.all()

    # Calculate distance for each hospital
    hospital_list = []
    for h in hospitals:
        h_dict = h.to_dict()
        h_dict['calculated_distance'] = haversine(user_lat, user_lon, h.latitude, h.longitude)
        hospital_list.append(h_dict)
    hospital_list.sort(key=lambda x: x['calculated_distance'])

    # Segment road alerts
    traffic_alerts = [a.to_dict() for a in road_alerts if 'traffic' in a.alert_type.lower()]
    road_conditions = [a.to_dict() for a in road_alerts if 'traffic' not in a.alert_type.lower() and 'accident' not in a.alert_type.lower()]
    accident_alerts = [a.to_dict() for a in road_alerts if 'accident' in a.alert_type.lower()]

    return jsonify({
        'all_alerts': [a.to_dict() for a in road_alerts],
        'traffic_alerts': traffic_alerts,
        'road_conditions': road_conditions,
        'accident_alerts': accident_alerts,
        'nearby_hospitals': hospital_list[:5],
        'user_location': {
            'latitude': user_lat,
            'longitude': user_lon,
            'label': 'Tamil Nadu, India'
        }
    }), 200

@driver_bp.route('/hospitals', methods=['GET'])
def get_hospitals():
    user_lat = request.args.get('lat', type=float, default=11.1271)
    user_lon = request.args.get('lon', type=float, default=78.6569)

    hospitals = Hospital.query.all()
    results = []
    for h in hospitals:
        d = h.to_dict()
        d['calculated_distance'] = haversine(user_lat, user_lon, h.latitude, h.longitude)
        results.append(d)

    results.sort(key=lambda x: x['calculated_distance'])
    return jsonify({
        'count': len(results),
        'hospitals': results
    }), 200

@driver_bp.route('/road-alerts', methods=['GET'])
def get_road_alerts():
    alert_type = request.args.get('type', '').strip()
    query = RoadAlert.query.filter_by(is_active=True)
    if alert_type and alert_type.lower() != 'all':
        query = query.filter(RoadAlert.alert_type.ilike(f'%{alert_type}%'))

    alerts = query.order_by(RoadAlert.created_at.desc()).all()
    return jsonify({
        'count': len(alerts),
        'alerts': [a.to_dict() for a in alerts]
    }), 200
