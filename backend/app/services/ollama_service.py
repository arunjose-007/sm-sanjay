import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

# List of popular open-source models supported by Ollama for user reference
CATALOG_MODELS = [
    {'name': 'llama3.2:3b', 'displayName': 'Llama 3.2 (3B)', 'description': 'Fast & powerful general AI (Meta)', 'family': 'Meta'},
    {'name': 'qwen2.5:1.5b', 'displayName': 'Qwen 2.5 (1.5B)', 'description': 'Ultra-fast coding & multilingual reasoning (Alibaba)', 'family': 'Alibaba'},
    {'name': 'deepseek-r1:1.5b', 'displayName': 'DeepSeek R1 (1.5B)', 'description': 'Advanced math, coding & deep reasoning (DeepSeek)', 'family': 'DeepSeek'},
    {'name': 'gemma2:2b', 'displayName': 'Gemma 2 (2B)', 'description': 'High-speed lightweight open model (Google)', 'family': 'Google'},
    {'name': 'llama3.2:1b', 'displayName': 'Llama 3.2 (1B)', 'description': 'Ultra-fast lightweight edge model (Meta)', 'family': 'Meta'},
    {'name': 'qwen2.5:7b', 'displayName': 'Qwen 2.5 (7B)', 'description': 'Heavyweight multilingual reasoning (Alibaba)', 'family': 'Alibaba'},
    {'name': 'deepseek-r1:7b', 'displayName': 'DeepSeek R1 (7B)', 'description': 'Heavyweight deep reasoning model (DeepSeek)', 'family': 'DeepSeek'},
    {'name': 'mistral:7b', 'displayName': 'Mistral (7B)', 'description': 'Balanced speed and analytical intelligence (Mistral)', 'family': 'Mistral'}
]

class OllamaService:
    @staticmethod
    def get_base_url():
        return current_app.config.get('OLLAMA_BASE_URL', 'http://localhost:11434').rstrip('/')

    @staticmethod
    def check_status():
        """Check if local Ollama server is reachable and retrieve installed models."""
        base_url = OllamaService.get_base_url()
        try:
            resp = requests.get(f"{base_url}/api/tags", timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                raw_models = data.get('models', [])
                installed_names = [m.get('name') for m in raw_models]
                
                # Format models with size and display name
                formatted_models = []
                for m in raw_models:
                    name = m.get('name')
                    size_gb = round(m.get('size', 0) / (1024 ** 3), 2)
                    name_lower = name.lower()
                    if 'qwen' in name_lower and 'coder' in name_lower:
                        display = f"Qwen 2.5 Coder ({size_gb}GB) — Programming & Debugging"
                    elif 'qwen' in name_lower:
                        display = f"Qwen 2.5 ({size_gb}GB) — General AI Chatbot"
                    elif 'deepseek' in name_lower:
                        display = f"DeepSeek R1 ({size_gb}GB) — Logical Reasoning & Math"
                    elif 'gemma' in name_lower:
                        display = f"Gemma 2 ({size_gb}GB) — General Chat & Reasoning"
                    elif 'llama' in name_lower:
                        display = f"Llama 3.2 ({size_gb}GB) — General Conversations"
                    elif 'phi' in name_lower:
                        display = f"Phi-4 Mini ({size_gb}GB) — Fast Responses"
                    else:
                        display = name.replace(':latest', '').title() + f" ({size_gb}GB)"

                    formatted_models.append({
                        'id': name,
                        'name': name,
                        'displayName': display,
                        'size': f"{size_gb} GB" if size_gb > 0 else 'Local',
                        'modified_at': m.get('modified_at'),
                        'installed': True
                    })

                return {
                    'online': True,
                    'base_url': base_url,
                    'installed_models': formatted_models,
                    'installed_count': len(formatted_models),
                    'installed_names': installed_names,
                    'catalog_models': CATALOG_MODELS,
                    'message': f"Ollama is running with {len(formatted_models)} installed model(s)."
                }
            return {
                'online': False,
                'base_url': base_url,
                'installed_models': [],
                'installed_count': 0,
                'installed_names': [],
                'catalog_models': CATALOG_MODELS,
                'message': f"Ollama responded with status code {resp.status_code}."
            }
        except requests.exceptions.RequestException:
            return {
                'online': False,
                'base_url': base_url,
                'installed_models': [],
                'installed_count': 0,
                'installed_names': [],
                'catalog_models': CATALOG_MODELS,
                'message': f"Ollama is not running on {base_url}. Start Ollama via 'ollama run <model>' in terminal."
            }

    @staticmethod
    def get_installed_models():
        status = OllamaService.check_status()
        return status.get('installed_models', [])

    @staticmethod
    def pull_model(model_name):
        """Trigger Ollama model download/pull."""
        base_url = OllamaService.get_base_url()
        try:
            resp = requests.post(f"{base_url}/api/pull", json={"name": model_name, "stream": False}, timeout=900)
            return {'success': resp.status_code == 200, 'response': resp.json() if resp.status_code == 200 else resp.text}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @staticmethod
    def resolve_installed_model(requested_name, installed_names):
        """Match requested model (e.g. qwen2.5, deepseek-r1, llama3.2, gemma3) to actual installed name."""
        if not installed_names:
            return requested_name or 'llama3.2:3b'

        req = (requested_name or '').lower().strip()
        
        # 1. Exact match
        if req in installed_names:
            return req

        # 2. Aliases (e.g. gemma3 -> gemma2:2b)
        if 'gemma' in req:
            match = next((m for m in installed_names if 'gemma' in m), None)
            if match: return match

        if 'deepseek' in req:
            match = next((m for m in installed_names if 'deepseek' in m), None)
            if match: return match

        if 'qwen' in req:
            match = next((m for m in installed_names if 'qwen' in m), None)
            if match: return match

        if 'llama' in req:
            match = next((m for m in installed_names if 'llama' in m), None)
            if match: return match

        # 3. Prefix match
        prefix = req.split(':')[0]
        match = next((m for m in installed_names if prefix in m or m.startswith(prefix)), None)
        if match:
            return match

        # Default to first installed
        return installed_names[0]

    @staticmethod
    def _build_payload(messages, model_name=None, stream=False, options=None):
        base_url = OllamaService.get_base_url()
        effective_model = model_name or current_app.config.get('OLLAMA_MODEL', 'llama3.2:3b')
        status = OllamaService.check_status()
        if status.get('online'):
            installed = status.get('installed_names', [])
            effective_model = OllamaService.resolve_installed_model(effective_model, installed)

        fast_options = {
            "temperature": 0.6,
            "top_p": 0.9,
            "num_ctx": 2048,
            "num_predict": 512,
            "num_thread": 4
        }
        if options:
            fast_options.update(options)

        payload = {
            "model": effective_model,
            "messages": messages,
            "stream": stream,
            "keep_alive": "20m",  # Keep model in RAM for 20 minutes (zero reload latency!)
            "options": fast_options
        }
        return f"{base_url}/api/chat", payload, effective_model

    @staticmethod
    def chat_sync(messages, model_name=None, options=None):
        """Pure synchronous function returning dict."""
        try:
            chat_url, payload, effective_model = OllamaService._build_payload(messages, model_name, stream=False, options=options)
            resp = requests.post(chat_url, json=payload, timeout=60)
            if resp.status_code == 200:
                result = resp.json()
                content = result.get('message', {}).get('content', '').strip()
                return {
                    'success': True,
                    'response': content,
                    'model': effective_model,
                    'provider': 'Ollama Local AI'
                }
            else:
                return {
                    'success': False,
                    'error': f"Ollama returned HTTP {resp.status_code}: {resp.text}",
                    'model': effective_model,
                    'provider': 'Ollama'
                }
        except requests.exceptions.ConnectionError:
            base_url = OllamaService.get_base_url()
            return {
                'success': False,
                'error': f"Ollama is not running on {base_url}. Please start Ollama.",
                'model': model_name or 'llama3.2:3b',
                'provider': 'Ollama'
            }
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': f"Inference timed out on model '{model_name}'.",
                'model': model_name,
                'provider': 'Ollama'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'model': model_name,
                'provider': 'Ollama'
            }

    @staticmethod
    def chat_stream(messages, model_name=None, options=None):
        """Pure streaming generator yielding token dicts."""
        try:
            chat_url, payload, effective_model = OllamaService._build_payload(messages, model_name, stream=True, options=options)
            resp = requests.post(chat_url, json=payload, stream=True, timeout=90)
            if resp.status_code != 200:
                yield {
                    'error': True,
                    'message': f"Ollama HTTP {resp.status_code}: {resp.text}",
                    'model': effective_model,
                    'provider': 'Ollama Local AI'
                }
                return

            for line in resp.iter_lines():
                if line:
                    chunk_data = json.loads(line.decode('utf-8'))
                    chunk_content = chunk_data.get('message', {}).get('content', '')
                    done = chunk_data.get('done', False)
                    yield {
                        'chunk': chunk_content,
                        'done': done,
                        'model': effective_model,
                        'provider': 'Ollama Local AI'
                    }
        except Exception as e:
            yield {
                'error': True,
                'message': str(e),
                'model': model_name or 'Ollama',
                'provider': 'Ollama Local AI'
            }

    @staticmethod
    def chat(messages, model_name=None, stream=False, options=None):
        """Dispatcher function."""
        if stream:
            return OllamaService.chat_stream(messages, model_name=model_name, options=options)
        else:
            return OllamaService.chat_sync(messages, model_name=model_name, options=options)
