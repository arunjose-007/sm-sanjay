from datetime import datetime
import uuid
from app.models import db

class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(255), default='New Chat')
    provider = db.Column(db.String(50), default='auto')
    model = db.Column(db.String(100), default='auto')
    module_context = db.Column(db.String(50), default='general')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Messages in this conversation
    messages = db.relationship('ChatMessage', backref='conversation', lazy=True, cascade='all, delete-orphan', order_by='ChatMessage.created_at.asc()')

    def to_dict(self, include_messages=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'provider': self.provider,
            'model': self.model,
            'module_context': self.module_context,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'message_count': len(self.messages) if self.messages else 0
        }
        if include_messages:
            data['messages'] = [m.to_dict() for m in self.messages]
        return data

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(64), db.ForeignKey('conversations.id'), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)  # 'user' | 'assistant'
    content = db.Column(db.Text, nullable=False)
    model = db.Column(db.String(100), nullable=True)
    provider = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'content': self.content,
            'model': self.model,
            'provider': self.provider,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    module_context = db.Column(db.String(50), default='general') # livelihood, fisherman, driver, general
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'module_context': self.module_context,
            'user_message': self.user_message,
            'ai_response': self.ai_response,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
