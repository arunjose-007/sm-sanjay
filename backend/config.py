import os

basedir = os.path.abspath(os.path.dirname(__file__))
instance_dir = os.path.join(basedir, 'instance')
os.makedirs(instance_dir, exist_ok=True)

# Auto-load .env file if it exists
def load_dotenv_custom():
    for env_path in [
        os.path.join(basedir, '.env'),
        os.path.join(basedir, '..', '.env'),
    ]:
        if os.path.exists(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

load_dotenv_custom()

db_file_path = os.path.join(instance_dir, 'livelihood_safety.db').replace('\\', '/')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'intelligent-assistant-secret-key-2026')
    
    # Absolute path for SQLite to prevent relative path errors on Windows
    raw_db_url = os.environ.get('DATABASE_URL', '')
    if not raw_db_url or 'sqlite:///instance' in raw_db_url:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_file_path}"
    else:
        SQLALCHEMY_DATABASE_URI = raw_db_url
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # xAI Grok API Configuration
    XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
    XAI_MODEL = os.environ.get('XAI_MODEL', 'grok-2-latest')
    XAI_API_URL = os.environ.get('XAI_API_URL', 'https://api.x.ai/v1/chat/completions')
    
    # Weather API Key (Optional for Open-Meteo fallback)
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')
    
    # Offline Ollama Configuration (Fallback if xAI Grok is unavailable)
    OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
    OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"
    OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
    OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2:1b')
    
    # Open-Meteo Configuration (Free open API)
    OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
    
    # Registered Emergency Contacts as specified (4 official numbers)
    REGISTERED_EMERGENCY_CONTACTS = [
        {'number': '6374926569', 'name': 'Emergency Contact 1', 'formatted': '+91 6374926569'},
        {'number': '7305800510', 'name': 'Emergency Contact 2', 'formatted': '+91 7305800510'},
        {'number': '8122603655', 'name': 'Emergency Contact 3', 'formatted': '+91 8122603655'},
        {'number': '7395893275', 'name': 'Emergency Contact 4', 'formatted': '+91 7395893275'}
    ]
    
    # Default Coordinates (Tamil Nadu, India)
    DEFAULT_LATITUDE = 11.1271
    DEFAULT_LONGITUDE = 78.6569
    DEFAULT_LOCATION_NAME = "Tamil Nadu, India"
