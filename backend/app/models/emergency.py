from datetime import datetime
from app.models import db

class EmergencyReport(db.Model):
    __tablename__ = 'emergency_reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(255), nullable=True)
    message = db.Column(db.Text, nullable=False)
    contact_info = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='Logged Locally')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'message': self.message,
            'contact_info': self.contact_info,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
