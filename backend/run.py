import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"==================================================")
    print(f" Intelligent Assistant for Livelihood & Road Safety")
    print(f" Backend REST API running at: http://localhost:{port}")
    print(f" Database: SQLite instance/livelihood_safety.db")
    print(f" Offline AI: Ollama (http://localhost:11434/api/chat)")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
