from flask import Blueprint, request, jsonify, session
from app.models import (
    db, User, Job, GovernmentScheme, FinancialAssistance,
    SkillDevelopment, FishingAlert, RoadAlert, EmergencyReport, ChatHistory
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def is_admin():
    # Allow if session indicates admin or header 'X-Admin-Role: admin'
    if session.get('role') == 'admin':
        return True
    if request.headers.get('X-Admin-Role') == 'admin':
        return True
    return False

@admin_bp.before_request
def check_admin_access():
    if not is_admin():
        return jsonify({'error': 'Unauthorized. Admin privileges required.'}), 403

@admin_bp.route('/stats', methods=['GET'])
def get_stats():
    return jsonify({
        'users_count': User.query.count(),
        'jobs_count': Job.query.count(),
        'schemes_count': GovernmentScheme.query.count(),
        'financial_assistance_count': FinancialAssistance.query.count(),
        'skill_programs_count': SkillDevelopment.query.count(),
        'fishing_alerts_count': FishingAlert.query.count(),
        'road_alerts_count': RoadAlert.query.count(),
        'emergency_reports_count': EmergencyReport.query.count(),
        'chat_records_count': ChatHistory.query.count(),
    }), 200

# ----------------- USERS -----------------
@admin_bp.route('/users', methods=['GET'])
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.username == 'admin':
        return jsonify({'error': 'Cannot delete root admin account.'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user.username} deleted.'}), 200

# ----------------- JOBS -----------------
@admin_bp.route('/jobs', methods=['POST'])
def add_job():
    data = request.get_json() or {}
    job = Job(
        title=data.get('title'),
        category=data.get('category'),
        company=data.get('company'),
        location=data.get('location'),
        salary=data.get('salary'),
        eligibility=data.get('eligibility'),
        description=data.get('description'),
        contact=data.get('contact')
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201

@admin_bp.route('/jobs/<int:job_id>', methods=['PUT', 'DELETE'])
def manage_job(job_id):
    job = Job.query.get_or_404(job_id)
    if request.method == 'DELETE':
        db.session.delete(job)
        db.session.commit()
        return jsonify({'message': 'Job deleted successfully.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(job, key):
            setattr(job, key, val)
    db.session.commit()
    return jsonify(job.to_dict()), 200

# ----------------- GOVERNMENT SCHEMES -----------------
@admin_bp.route('/schemes', methods=['POST'])
def add_scheme():
    data = request.get_json() or {}
    scheme = GovernmentScheme(
        title=data.get('title'),
        category=data.get('category'),
        eligibility=data.get('eligibility'),
        benefits=data.get('benefits'),
        application_procedure=data.get('application_procedure'),
        official_link=data.get('official_link')
    )
    db.session.add(scheme)
    db.session.commit()
    return jsonify(scheme.to_dict()), 201

@admin_bp.route('/schemes/<int:scheme_id>', methods=['PUT', 'DELETE'])
def manage_scheme(scheme_id):
    scheme = GovernmentScheme.query.get_or_404(scheme_id)
    if request.method == 'DELETE':
        db.session.delete(scheme)
        db.session.commit()
        return jsonify({'message': 'Scheme deleted.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(scheme, key):
            setattr(scheme, key, val)
    db.session.commit()
    return jsonify(scheme.to_dict()), 200

# ----------------- FINANCIAL ASSISTANCE -----------------
@admin_bp.route('/financial-assistance', methods=['POST'])
def add_financial_assistance():
    data = request.get_json() or {}
    fa = FinancialAssistance(
        program_name=data.get('program_name'),
        provider=data.get('provider'),
        assistance_amount=data.get('assistance_amount'),
        eligibility=data.get('eligibility'),
        application_info=data.get('application_info')
    )
    db.session.add(fa)
    db.session.commit()
    return jsonify(fa.to_dict()), 201

@admin_bp.route('/financial-assistance/<int:fa_id>', methods=['PUT', 'DELETE'])
def manage_financial_assistance(fa_id):
    fa = FinancialAssistance.query.get_or_404(fa_id)
    if request.method == 'DELETE':
        db.session.delete(fa)
        db.session.commit()
        return jsonify({'message': 'Financial assistance program deleted.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(fa, key):
            setattr(fa, key, val)
    db.session.commit()
    return jsonify(fa.to_dict()), 200

# ----------------- SKILL DEVELOPMENT -----------------
@admin_bp.route('/skill-development', methods=['POST'])
def add_skill():
    data = request.get_json() or {}
    skill = SkillDevelopment(
        course_title=data.get('course_title'),
        category=data.get('category'),
        duration=data.get('duration'),
        provider=data.get('provider'),
        mode=data.get('mode', 'Offline & Online'),
        learning_resources=data.get('learning_resources')
    )
    db.session.add(skill)
    db.session.commit()
    return jsonify(skill.to_dict()), 201

@admin_bp.route('/skill-development/<int:skill_id>', methods=['PUT', 'DELETE'])
def manage_skill(skill_id):
    skill = SkillDevelopment.query.get_or_404(skill_id)
    if request.method == 'DELETE':
        db.session.delete(skill)
        db.session.commit()
        return jsonify({'message': 'Skill program deleted.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(skill, key):
            setattr(skill, key, val)
    db.session.commit()
    return jsonify(skill.to_dict()), 200

# ----------------- FISHING ALERTS -----------------
@admin_bp.route('/fishing-alerts', methods=['POST'])
def add_fishing_alert():
    data = request.get_json() or {}
    alert = FishingAlert(
        alert_title=data.get('alert_title'),
        severity=data.get('severity', 'advisory'),
        sea_condition=data.get('sea_condition'),
        wind_speed=data.get('wind_speed'),
        wave_height=data.get('wave_height'),
        advisory=data.get('advisory'),
        valid_until=data.get('valid_until')
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201

@admin_bp.route('/fishing-alerts/<int:alert_id>', methods=['PUT', 'DELETE'])
def manage_fishing_alert(alert_id):
    alert = FishingAlert.query.get_or_404(alert_id)
    if request.method == 'DELETE':
        db.session.delete(alert)
        db.session.commit()
        return jsonify({'message': 'Fishing alert deleted.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(alert, key):
            setattr(alert, key, val)
    db.session.commit()
    return jsonify(alert.to_dict()), 200

# ----------------- ROAD ALERTS -----------------
@admin_bp.route('/road-alerts', methods=['POST'])
def add_road_alert():
    data = request.get_json() or {}
    alert = RoadAlert(
        alert_type=data.get('alert_type', 'Traffic Alert'),
        road_name=data.get('road_name'),
        severity=data.get('severity', 'moderate'),
        description=data.get('description'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        is_active=data.get('is_active', True)
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201

@admin_bp.route('/road-alerts/<int:alert_id>', methods=['PUT', 'DELETE'])
def manage_road_alert(alert_id):
    alert = RoadAlert.query.get_or_404(alert_id)
    if request.method == 'DELETE':
        db.session.delete(alert)
        db.session.commit()
        return jsonify({'message': 'Road alert deleted.'}), 200

    data = request.get_json() or {}
    for key, val in data.items():
        if hasattr(alert, key):
            setattr(alert, key, val)
    db.session.commit()
    return jsonify(alert.to_dict()), 200

# ----------------- EMERGENCY REPORTS -----------------
@admin_bp.route('/emergency-reports', methods=['GET'])
def get_admin_emergency_reports():
    reports = EmergencyReport.query.order_by(EmergencyReport.created_at.desc()).all()
    return jsonify({'reports': [r.to_dict() for r in reports]}), 200

@admin_bp.route('/emergency-reports/<int:report_id>/status', methods=['PUT'])
def update_emergency_status(report_id):
    report = EmergencyReport.query.get_or_404(report_id)
    data = request.get_json() or {}
    report.status = data.get('status', report.status)
    db.session.commit()
    return jsonify(report.to_dict()), 200
