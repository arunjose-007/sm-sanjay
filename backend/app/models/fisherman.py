from datetime import datetime
from app.models import db

class FishingAlert(db.Model):
    __tablename__ = 'fishing_alerts'

    id = db.Column(db.Integer, primary_key=True)
    alert_title = db.Column(db.String(200), nullable=False)
    severity = db.Column(db.String(20), nullable=False, default='advisory') # safe, advisory, danger
    sea_condition = db.Column(db.String(100), nullable=False)
    wind_speed = db.Column(db.String(50), nullable=False)
    wave_height = db.Column(db.String(50), nullable=False)
    advisory = db.Column(db.Text, nullable=False)
    valid_until = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'alert_title': self.alert_title,
            'severity': self.severity,
            'sea_condition': self.sea_condition,
            'wind_speed': self.wind_speed,
            'wave_height': self.wave_height,
            'advisory': self.advisory,
            'valid_until': self.valid_until,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
