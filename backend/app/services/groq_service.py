import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

GROQ_MODELS = [
    {
        'id': 'llama-3.3-70b-versatile',
        'name': 'Llama 3.3 70B (GPT-OSS Class)',
        'displayName': '🌟 Llama 3.3 70B — Advanced AI Assistant (GPT Quality)',
        'description': 'High-power versatile reasoning model (Meta via Groq LPU)',
        'provider': 'groq',
        'free': True
    },
    {
        'id': 'deepseek-r1-distill-llama-70b',
        'name': 'DeepSeek R1 (70B Distill)',
        'displayName': '🧠 DeepSeek R1 — Logical Reasoning & Deep Math',
        'description': 'Advanced chain-of-thought logic & math model (DeepSeek via Groq)',
        'provider': 'groq',
        'free': True
    },
    {
        'id': 'qwen-2.5-32b',
        'name': 'Qwen 2.5 (32B)',
        'displayName': '💻 Qwen 2.5 — Programming & Multilingual General AI',
        'description': 'Elite programming, debugging & multilingual chatbot (Alibaba via Groq)',
        'provider': 'groq',
        'free': True
    },
    {
        'id': 'gemma2-9b-it',
        'name': 'Gemma 2 9B',
        'displayName': '⚡ Gemma 2 (9B) — General Chat & Analytical Reasoning',
        'description': 'High-speed open model from Google via Groq',
        'provider': 'groq',
        'free': True
    },
    {
        'id': 'llama-3.1-8b-instant',
        'name': 'Llama 3.1 8B Instant',
        'displayName': '💬 Llama 3.1 (8B) — General Conversations (Ultra-Fast)',
        'description': 'Lightweight high-speed conversational AI (Meta via Groq)',
        'provider': 'groq',
        'free': True
    }
]

class GroqService:
    @staticmethod
    def is_configured():
        api_key = current_app.config.get('GROQ_API_KEY', '').strip()
        return bool(api_key and not api_key.startswith('your_'))

    @staticmethod
    def get_api_key():
        return current_app.config.get('GROQ_API_KEY', '').strip()

    @staticmethod
    def get_api_url():
        return current_app.config.get('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions')

    @staticmethod
    def get_available_models():
        configured = GroqService.is_configured()
        return [{**m, 'available': configured} for m in GROQ_MODELS]

    @staticmethod
    def chat(messages, model=None, stream=False, temperature=0.7, max_tokens=2048):
        if not GroqService.is_configured():
            return {
                'success': False,
                'error': 'GROQ_NOT_CONFIGURED',
                'message': 'Groq API key not configured.'
            }

        effective_model = model or current_app.config.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        if effective_model.startswith('groq:'):
            effective_model = effective_model.replace('groq:', '')

        headers = {
            "Authorization": f"Bearer {GroqService.get_api_key()}",
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
            if not stream:
                resp = requests.post(GroqService.get_api_url(), headers=headers, json=payload, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get('choices', [])
                    if choices:
                        content = choices[0].get('message', {}).get('content', '')
                        return {
                            'success': True,
                            'response': content,
                            'model': effective_model,
                            'provider': 'Groq Cloud (Free Tier)'
                        }
                return {
                    'success': False,
                    'error': f"Groq Error: {resp.status_code}",
                    'message': resp.text
                }
            else:
                resp = requests.post(GroqService.get_api_url(), headers=headers, json=payload, stream=True, timeout=25)
                if resp.status_code != 200:
                    def err_gen():
                        yield {'error': True, 'message': f"Groq HTTP {resp.status_code}: {resp.text}"}
                    return err_gen()

                def sse_gen():
                    for line in resp.iter_lines():
                        if not line:
                            continue
                        line_str = line.decode('utf-8') if isinstance(line, bytes) else line
                        if line_str.startswith('data: '):
                            raw_data = line_str[6:].strip()
                            if raw_data == '[DONE]':
                                yield {'chunk': '', 'done': True, 'model': effective_model, 'provider': 'Groq Cloud'}
                                break
                            try:
                                parsed = json.loads(raw_data)
                                choices = parsed.get('choices', [])
                                if choices:
                                    delta = choices[0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        yield {'chunk': content, 'done': False, 'model': effective_model, 'provider': 'Groq Cloud'}
                            except Exception:
                                pass
                return sse_gen()
        except Exception as e:
            logger.error("Groq connection exception: %s", str(e))
            if stream:
                def exc_gen():
                    yield {'error': True, 'message': str(e)}
                return exc_gen()
            return {'success': False, 'error': str(e)}
