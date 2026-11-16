from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from app.models.user import User
from app.models.livelihood import Job, GovernmentScheme, FinancialAssistance, SkillDevelopment
from app.models.fisherman import FishingAlert
from app.models.driver import RoadAlert, Hospital
from app.models.emergency import EmergencyReport
from app.models.weather import WeatherRecord
from app.models.chat import ChatHistory, Conversation, ChatMessage
from app.models.saved_location import SavedLocation

__all__ = [
    'db',
    'User',
    'Job',
    'GovernmentScheme',
    'FinancialAssistance',
    'SkillDevelopment',
    'FishingAlert',
    'RoadAlert',
    'Hospital',
    'EmergencyReport',
    'WeatherRecord',
    'ChatHistory',
    'Conversation',
    'ChatMessage',
    'SavedLocation',
]
