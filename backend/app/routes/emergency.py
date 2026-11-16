from flask import Blueprint, request, jsonify, session, current_app
from app.models import db, EmergencyReport

emergency_bp = Blueprint('emergency', __name__, url_prefix='/api/emergency')

# Four official registered emergency contacts as specified
REGISTERED_CONTACTS = [
    {
        'id': 1,
        'name': 'Primary Emergency Contact 1',
        'number': '6374926569',
        'formatted': '+91 6374926569',
        'role': 'Immediate SOS Responder 1',
        'category': 'Family / Nominated Contact'
    },
    {
        'id': 2,
        'name': 'Primary Emergency Contact 2',
        'number': '7305800510',
        'formatted': '+91 7305800510',
        'role': 'Immediate SOS Responder 2',
        'category': 'Family / Nominated Contact'
    },
    {
        'id': 3,
        'name': 'Primary Emergency Contact 3',
        'number': '8122603655',
        'formatted': '+91 8122603655',
        'role': 'Immediate SOS Responder 3',
        'category': 'Family / Nominated Contact'
    },
    {
        'id': 4,
        'name': 'Primary Emergency Contact 4',
        'number': '7395893275',
        'formatted': '+91 7395893275',
        'role': 'Immediate SOS Responder 4',
        'category': 'Family / Nominated Contact'
    }
]

NATIONAL_HOTLINES = [
    {'service': 'National Medical Ambulance', 'number': '108', 'desc': '24/7 Free Trauma Paramedic Response'},
    {'service': 'Police Emergency Control', 'number': '100', 'desc': 'Law Enforcement Rapid Dispatch'},
    {'service': 'Indian Coast Guard SAR', 'number': '1554', 'desc': 'Maritime Rescue for Fishermen in Distress'},
    {'service': 'National Highway Patrol', 'number': '1073', 'desc': 'Accident & Crane Highway Helpline'}
]

@emergency_bp.route('/contacts', methods=['GET'])
def get_contacts():
    contacts_list = []
    for c in REGISTERED_CONTACTS:
        item = dict(c)
        item['phone'] = c['number']
        contacts_list.append(item)
    return jsonify({
        'contacts': contacts_list,
        'registered_contacts': contacts_list,
        'all_contact_numbers': [c['number'] for c in REGISTERED_CONTACTS],
        'national_hotlines': NATIONAL_HOTLINES
    }), 200

@emergency_bp.route('/report', methods=['POST'])
@emergency_bp.route('/sos', methods=['POST'])
def create_emergency_report():
    data = request.get_json() or {}
    lat = data.get('latitude')
    lon = data.get('longitude')
    address = data.get('address') or f"GPS Coordinates ({lat:.5f}, {lon:.5f})" if lat and lon else "Unknown Location"
    accuracy = data.get('accuracy_meters', 10)
    user_id = session.get('user_id') or data.get('user_id')
    sender_name = data.get('sender_name') or 'Citizen in Distress'
    target_numbers = data.get('target_numbers') or [c['number'] for c in REGISTERED_CONTACTS]

    if lat is None or lon is None:
        return jsonify({'error': 'GPS coordinates are strictly required for SOS dispatch.'}), 400

    maps_link = f"https://maps.google.com/?q={lat},{lon}"
    distress_message = (
        f"🚨 EMERGENCY SOS! I need immediate help.\n"
        f"📍 Location: {address}\n"
        f"🌐 GPS: {lat:.5f}, {lon:.5f} (±{round(accuracy)}m)\n"
        f"🗺 Google Maps Link: {maps_link}\n"
        f"📞 Emergency Contacts Alerted: {', '.join(target_numbers)}"
    )

    try:
        report = EmergencyReport(
            user_id=user_id,
            sender_name=sender_name,
            latitude=float(lat),
            longitude=float(lon),
            accuracy_meters=float(accuracy),
            emergency_type='CRITICAL_SOS_DISPATCH',
            message=distress_message,
            status='LOGGED_LOCALLY_SMS_PREPARED'
        )
        db.session.add(report)
        db.session.commit()
    except Exception as e:
        db.session.rollback()

    # Generate device SMS URI for all 3 contacts
    joined_numbers = ",".join(target_numbers)
    # Note: On Android commas separate recipients, iOS accepts semicolons. We provide both in payload.
    sms_uri_comma = f"sms:{joined_numbers}?body={requests_quote(distress_message)}"
    sms_uri_semi = f"sms:{';'.join(target_numbers)}?body={requests_quote(distress_message)}"

    individual_dispatch = []
    for c in REGISTERED_CONTACTS:
        individual_dispatch.append({
            'name': c['name'],
            'number': c['number'],
            'formatted': c['formatted'],
            'sms_url': f"sms:{c['number']}?body={requests_quote(distress_message)}",
            'whatsapp_url': f"https://wa.me/91{c['number']}?text={requests_quote(distress_message)}",
            'call_url': f"tel:{c['number']}"
        })

    return jsonify({
        'success': True,
        'message': 'Emergency SOS logged. SMS payload prepared for registered contacts.',
        'latitude': lat,
        'longitude': lon,
        'address': address,
        'maps_link': maps_link,
        'distress_message': distress_message,
        'registered_contacts': REGISTERED_CONTACTS,
        'all_contacts_sms_uri': sms_uri_comma,
        'all_contacts_sms_uri_ios': sms_uri_semi,
        'individual_dispatch': individual_dispatch,
        'national_hotlines': NATIONAL_HOTLINES
    }), 201

def requests_quote(s):
    import urllib.parse
    return urllib.parse.quote(s)
