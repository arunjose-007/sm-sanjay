from datetime import datetime
from app.models import db

class SavedLocation(db.Model):
    __tablename__ = 'saved_locations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), default='place') # home, work, harbor, hospital, checkpoint
    address = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'category': self.category,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
