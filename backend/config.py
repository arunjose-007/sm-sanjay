import os
import tempfile

basedir = os.path.abspath(os.path.dirname(__file__))

if os.environ.get('VERCEL'):
    instance_dir = tempfile.gettempdir()
else:
    instance_dir = os.path.join(basedir, 'instance')

try:
    os.makedirs(instance_dir, exist_ok=True)
except Exception:
    instance_dir = tempfile.gettempdir()

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

db_file_path = os.path.abspath(os.path.join(instance_dir, 'livelihood_safety.db')).replace('\\', '/')

if db_file_path.startswith('/'):
    default_db_uri = 'sqlite:////' + db_file_path.lstrip('/')
else:
    default_db_uri = f'sqlite:///{db_file_path}'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'intelligent-assistant-secret-key-2026')
    
    raw_db_url = os.environ.get('DATABASE_URL', '')
    if not raw_db_url or 'sqlite:///instance' in raw_db_url:
        SQLALCHEMY_DATABASE_URI = default_db_uri
    else:
        SQLALCHEMY_DATABASE_URI = raw_db_url
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # xAI Grok API Configuration
    XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
    XAI_MODEL = os.environ.get('XAI_MODEL', 'grok-2-latest')
    XAI_API_URL = os.environ.get('XAI_API_URL', 'https://api.x.ai/v1/chat/completions')
    
    # Weather API Key (Optional for Open-Meteo fallback)
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')
    
    # Ollama Configuration
    OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://127.0.0.1:11434')
    OLLAMA_DEFAULT_MODEL = os.environ.get('OLLAMA_DEFAULT_MODEL', 'qwen2.5:1.5b')
