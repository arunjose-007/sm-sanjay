from datetime import datetime
from app.models import db

class RoadAlert(db.Model):
    __tablename__ = 'road_alerts'

    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(80), nullable=False) # Traffic, Roadwork, Accident, Closure
    road_name = db.Column(db.String(150), nullable=False)
    severity = db.Column(db.String(20), nullable=False, default='moderate') # low, moderate, critical
    description = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'road_name': self.road_name,
            'severity': self.severity,
            'description': self.description,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Hospital(db.Model):
    __tablename__ = 'hospitals'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    emergency_services = db.Column(db.String(200), default='24/7 Trauma, ICU, Ambulance')
    distance = db.Column(db.Float, nullable=True) # Computed relative to user

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'phone': self.phone,
            'emergency_services': self.emergency_services,
            'distance': self.distance
        }
