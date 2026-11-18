import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

# List of popular free open-source models supported by Ollama & Local AI Master
CATALOG_MODELS = [
    {'name': 'qwen2.5:7b', 'displayName': 'Qwen 3.5 / 2.5 (9B/7B)', 'description': 'General AI chatbot with elite multilingual intelligence (Alibaba)', 'family': 'Alibaba', 'quality': 'Excellent'},
    {'name': 'deepseek-r1:8b', 'displayName': 'DeepSeek R1 (8B)', 'description': 'Advanced chain-of-thought logical reasoning & math (DeepSeek)', 'family': 'DeepSeek', 'quality': 'Excellent'},
    {'name': 'gpt-oss:20b', 'displayName': 'GPT-OSS (20B)', 'description': 'Advanced open-weight AI assistant for deep tasks', 'family': 'OpenSource', 'quality': 'Excellent'},
    {'name': 'gemma2:9b', 'displayName': 'Gemma 4 / 2 (12B/9B)', 'description': 'General chat + analytical reasoning (Google)', 'family': 'Google', 'quality': 'Excellent'},
    {'name': 'qwen2.5-coder:7b', 'displayName': 'Qwen 2.5 Coder (7B)', 'description': 'Programming, code generation & debugging (Alibaba)', 'family': 'Alibaba', 'quality': 'Excellent'},
    {'name': 'llama3.1:8b', 'displayName': 'Llama 3.1 (8B)', 'description': 'General conversations & dialogue (Meta)', 'family': 'Meta', 'quality': 'Very Good'},
    {'name': 'phi4:mini', 'displayName': 'Phi-4 Mini', 'description': 'Ultra-fast low-latency responses (Microsoft)', 'family': 'Microsoft', 'quality': 'Very Good'},
    {'name': 'llama3.2:3b', 'displayName': 'Llama 3.2 (3B)', 'description': 'High-speed lightweight edge model (Meta)', 'family': 'Meta', 'quality': 'Good'}
]

import socket
import time

class OllamaService:
    _cached_status = None
    _cached_time = 0

    @staticmethod
    def get_base_url():
        return current_app.config.get('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').rstrip('/')

    @staticmethod
    def check_status(force=False):
        """Check if local Ollama server is reachable and retrieve installed models."""
        now = time.time()
        if not force and OllamaService._cached_status and (now - OllamaService._cached_time < 5):
            return OllamaService._cached_status

        base_url = OllamaService.get_base_url()

        # Fast socket check for local connection (avoids multi-second DNS/connection hangs)
        if '127.0.0.1' in base_url or 'localhost' in base_url:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(0.25)
                res = s.connect_ex(('127.0.0.1', 11434))
                s.close()
                if res != 0:
                    status = {
                        'online': False,
                        'base_url': base_url,
                        'installed_models': [],
                        'installed_count': 0,
                        'installed_names': [],
                        'catalog_models': CATALOG_MODELS,
                        'message': f"Ollama is not running on {base_url}. Start via 'ollama run <model>' in terminal."
                    }
                    OllamaService._cached_status = status
                    OllamaService._cached_time = now
                    return status
            except Exception:
                pass

        try:
            resp = requests.get(f"{base_url}/api/tags", timeout=2)
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
                        display = f"Qwen 3.5 / 2.5 ({size_gb}GB) — General AI Chatbot"
                    elif 'deepseek' in name_lower:
                        display = f"DeepSeek R1 ({size_gb}GB) — Logical Reasoning & Math"
                    elif 'gpt-oss' in name_lower or 'gpt' in name_lower:
                        display = f"GPT-OSS ({size_gb}GB) — Advanced AI Assistant"
                    elif 'gemma' in name_lower:
                        display = f"Gemma 4 / 2 ({size_gb}GB) — General Chat & Reasoning"
                    elif 'llama3.1' in name_lower or 'llama-3.1' in name_lower:
                        display = f"Llama 3.1 ({size_gb}GB) — General Conversations"
                    elif 'llama' in name_lower:
                        display = f"Llama 3.2 / 3.1 ({size_gb}GB) — General Conversations"
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

                status = {
                    'online': True,
                    'base_url': base_url,
                    'installed_models': formatted_models,
                    'installed_count': len(formatted_models),
                    'installed_names': installed_names,
                    'catalog_models': CATALOG_MODELS,
                    'message': f"Ollama is running with {len(formatted_models)} installed model(s)."
                }
                OllamaService._cached_status = status
                OllamaService._cached_time = now
                return status
            status = {
                'online': False,
                'base_url': base_url,
                'installed_models': [],
                'installed_count': 0,
                'installed_names': [],
                'catalog_models': CATALOG_MODELS,
                'message': f"Ollama responded with status code {resp.status_code}."
            }
            OllamaService._cached_status = status
            OllamaService._cached_time = now
            return status
        except requests.exceptions.RequestException:
            status = {
                'online': False,
                'base_url': base_url,
                'installed_models': [],
                'installed_count': 0,
                'installed_names': [],
                'catalog_models': CATALOG_MODELS,
                'message': f"Ollama is not running on {base_url}. Start Ollama via 'ollama run <model>' in terminal."
            }
            OllamaService._cached_status = status
            OllamaService._cached_time = now
            return status

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
