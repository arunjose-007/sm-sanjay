from datetime import datetime
from app.models import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    company = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=False, index=True)
    salary = db.Column(db.String(80), nullable=False)
    eligibility = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'company': self.company,
            'location': self.location,
            'salary': self.salary,
            'eligibility': self.eligibility,
            'description': self.description,
            'contact': self.contact,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class GovernmentScheme(db.Model):
    __tablename__ = 'government_schemes'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    eligibility = db.Column(db.Text, nullable=False)
    benefits = db.Column(db.Text, nullable=False)
    application_procedure = db.Column(db.Text, nullable=False)
    official_link = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'eligibility': self.eligibility,
            'benefits': self.benefits,
            'application_procedure': self.application_procedure,
            'official_link': self.official_link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FinancialAssistance(db.Model):
    __tablename__ = 'financial_assistance'

    id = db.Column(db.Integer, primary_key=True)
    program_name = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(150), nullable=False)
    assistance_amount = db.Column(db.String(100), nullable=False)
    eligibility = db.Column(db.Text, nullable=False)
    application_info = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'program_name': self.program_name,
            'provider': self.provider,
            'assistance_amount': self.assistance_amount,
            'eligibility': self.eligibility,
            'application_info': self.application_info,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SkillDevelopment(db.Model):
    __tablename__ = 'skill_development'

    id = db.Column(db.Integer, primary_key=True)
    course_title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    duration = db.Column(db.String(80), nullable=False)
    provider = db.Column(db.String(150), nullable=False)
    mode = db.Column(db.String(50), default='Offline & Online')
    learning_resources = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'course_title': self.course_title,
            'category': self.category,
            'duration': self.duration,
            'provider': self.provider,
            'mode': self.mode,
            'learning_resources': self.learning_resources,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
