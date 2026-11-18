import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

GEMINI_MODELS = [
    {
        'id': 'gemini-2.0-flash',
        'name': 'Google Gemini 2.0 Flash',
        'displayName': '✨ Gemini 2.0 Flash — High-Speed Multimodal & Reasoning',
        'description': 'Google high-speed flagship reasoning & chat model (Free tier)',
        'provider': 'gemini',
        'free': True
    },
    {
        'id': 'gemini-1.5-flash',
        'name': 'Google Gemini 1.5 Flash',
        'displayName': '⚡ Gemini 1.5 Flash — Fast General Chatbot & Coding',
        'description': 'High-performance lightweight general assistant (Free tier)',
        'provider': 'gemini',
        'free': True
    }
]

class GeminiService:
    @staticmethod
    def is_configured():
        api_key = current_app.config.get('GEMINI_API_KEY', '').strip()
        return bool(api_key and not api_key.startswith('your_'))

    @staticmethod
    def get_api_key():
        return current_app.config.get('GEMINI_API_KEY', '').strip()

    @staticmethod
    def get_available_models():
        configured = GeminiService.is_configured()
        return [{**m, 'available': configured} for m in GEMINI_MODELS]

    @staticmethod
    def chat(messages, model=None, stream=False):
        if not GeminiService.is_configured():
            return {
                'success': False,
                'error': 'GEMINI_NOT_CONFIGURED',
                'message': 'Google Gemini API key not configured.'
            }

        effective_model = model or current_app.config.get('GEMINI_MODEL', 'gemini-2.0-flash')
        if effective_model.startswith('gemini:'):
            effective_model = effective_model.replace('gemini:', '')

        api_key = GeminiService.get_api_key()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{effective_model}:generateContent?key={api_key}"

        # Convert OpenAI-style messages to Gemini contents format
        contents = []
        system_instruction = None

        for m in messages:
            role = m.get('role')
            content = m.get('content', '')
            if role == 'system':
                system_instruction = {"parts": [{"text": content}]}
            elif role == 'user':
                contents.append({"role": "user", "parts": [{"text": content}]})
            elif role == 'assistant':
                contents.append({"role": "model", "parts": [{"text": content}]})

        payload = {"contents": contents}
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        try:
            resp = requests.post(url, json=payload, timeout=25)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    text = "".join([p.get('text', '') for p in parts])
                    return {
                        'success': True,
                        'response': text,
                        'model': effective_model,
                        'provider': 'Google Gemini (Free Tier)'
                    }
            return {
                'success': False,
                'error': f"Gemini HTTP {resp.status_code}",
                'message': resp.text
            }
        except Exception as e:
            logger.error("Gemini exception: %s", str(e))
            return {'success': False, 'error': str(e)}
