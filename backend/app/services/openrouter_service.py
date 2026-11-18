import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

OPENROUTER_FREE_MODELS = [
    {
        'id': 'deepseek/deepseek-r1:free',
        'name': 'DeepSeek R1 (Free)',
        'displayName': '🧠 DeepSeek R1 — Deep Reasoning (Free)',
        'description': 'Free logical reasoning from DeepSeek on OpenRouter',
        'provider': 'openrouter',
        'free': True
    },
    {
        'id': 'meta-llama/llama-3.3-70b-instruct:free',
        'name': 'Llama 3.3 70B (Free)',
        'displayName': '🌟 Llama 3.3 70B — Flagship Assistant (Free)',
        'description': 'Free flagship general AI from Meta on OpenRouter',
        'provider': 'openrouter',
        'free': True
    },
    {
        'id': 'qwen/qwen-2.5-coder-32b-instruct:free',
        'name': 'Qwen 2.5 Coder 32B (Free)',
        'displayName': '💻 Qwen 2.5 Coder — Code & Debug (Free)',
        'description': 'Free expert programming LLM on OpenRouter',
        'provider': 'openrouter',
        'free': True
    }
]

class OpenRouterService:
    @staticmethod
    def is_configured():
        api_key = current_app.config.get('OPENROUTER_API_KEY', '').strip()
        return bool(api_key and not api_key.startswith('your_'))

    @staticmethod
    def get_api_key():
        return current_app.config.get('OPENROUTER_API_KEY', '').strip()

    @staticmethod
    def get_api_url():
        return current_app.config.get('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1/chat/completions')

    @staticmethod
    def get_available_models():
        configured = OpenRouterService.is_configured()
        return [{**m, 'available': configured} for m in OPENROUTER_FREE_MODELS]

    @staticmethod
    def chat(messages, model=None, stream=False, temperature=0.7, max_tokens=2048):
        if not OpenRouterService.is_configured():
            return {'success': False, 'error': 'OPENROUTER_NOT_CONFIGURED'}

        effective_model = model or current_app.config.get('OPENROUTER_MODEL', 'deepseek/deepseek-r1:free')
        if effective_model.startswith('openrouter:'):
            effective_model = effective_model.replace('openrouter:', '')

        headers = {
            "Authorization": f"Bearer {OpenRouterService.get_api_key()}",
            "HTTP-Referer": "https://intelligent-assistant.vercel.app",
            "X-Title": "Intelligent Assistant",
            "Content-Type": "application/json"
        }
        payload = {
            "model": effective_model,
            "messages": messages,
            "stream": stream,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        try:
            resp = requests.post(OpenRouterService.get_api_url(), headers=headers, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get('choices', [])
                if choices:
                    return {
                        'success': True,
                        'response': choices[0].get('message', {}).get('content', ''),
                        'model': effective_model,
                        'provider': 'OpenRouter (Free Tier)'
                    }
            return {'success': False, 'error': f"OpenRouter HTTP {resp.status_code}", 'message': resp.text}
        except Exception as e:
            return {'success': False, 'error': str(e)}
