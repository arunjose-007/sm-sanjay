from datetime import datetime
from app.models import db

class WeatherRecord(db.Model):
    __tablename__ = 'weather_records'

    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(150), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    wind_speed = db.Column(db.Float, nullable=False)
    visibility = db.Column(db.Float, nullable=True)
    weather_condition = db.Column(db.String(100), nullable=False)
    weather_code = db.Column(db.Integer, default=0)
    is_cached = db.Column(db.Boolean, default=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'location_name': self.location_name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'wind_speed': self.wind_speed,
            'visibility': self.visibility,
            'weather_condition': self.weather_condition,
            'weather_code': self.weather_code,
            'is_cached': self.is_cached,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }
