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

    # Groq Cloud API (100% Free Tier - https://console.groq.com)
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
    GROQ_API_URL = os.environ.get('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions')

    # Google Gemini API (100% Free Tier - https://aistudio.google.com)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')

    # OpenRouter API (Free Models: deepseek-r1:free, llama-3.3-70b:free)
    OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
    OPENROUTER_MODEL = os.environ.get('OPENROUTER_MODEL', 'deepseek/deepseek-r1:free')
    OPENROUTER_API_URL = os.environ.get('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions')

    # Open-Meteo Real-Time Weather API (100% Free, No Key Required)
    OPEN_METEO_URL = os.environ.get('OPEN_METEO_URL', 'https://api.open-meteo.com/v1/forecast')
    OPEN_METEO_GEO_URL = os.environ.get('OPEN_METEO_GEO_URL', 'https://geocoding-api.open-meteo.com/v1/search')
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')

    # Default Region Telemetry (Tamil Nadu, India)
    DEFAULT_LATITUDE = float(os.environ.get('DEFAULT_LATITUDE', 11.1271))
    DEFAULT_LONGITUDE = float(os.environ.get('DEFAULT_LONGITUDE', 78.6569))
    DEFAULT_LOCATION_NAME = os.environ.get('DEFAULT_LOCATION_NAME', 'Tamil Nadu, India')

    # Ollama Local Configuration (Free Local LLMs: Qwen, DeepSeek, Llama, Gemma, Phi)
    OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://127.0.0.1:11434')
    OLLAMA_DEFAULT_MODEL = os.environ.get('OLLAMA_DEFAULT_MODEL', 'qwen2.5:1.5b')
