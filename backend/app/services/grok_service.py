import os
import requests
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

GROK_AVAILABLE_MODELS = [
    {
        'id': 'grok-2-latest',
        'name': 'xAI Grok 2',
        'displayName': 'xAI Grok 2 (Latest - High Reasoning)',
        'description': 'Flagship xAI model for complex problem solving',
        'provider': 'xai',
        'cloud': True
    },
    {
        'id': 'grok-3-mini',
        'name': 'xAI Grok 3 Mini',
        'displayName': 'xAI Grok 3 Mini (Fast & Smart)',
        'description': 'Latest fast cloud reasoning model from xAI',
        'provider': 'xai',
        'cloud': True
    },
    {
        'id': 'grok-beta',
        'name': 'xAI Grok Beta',
        'displayName': 'xAI Grok Beta (Ultra-Fast)',
        'description': 'Optimized for high-speed conversational responses',
        'provider': 'xai',
        'cloud': True
    }
]

class GrokService:
    @staticmethod
    def is_configured():
        api_key = current_app.config.get('XAI_API_KEY', '').strip()
        return bool(api_key and api_key != 'your_grok_api_key' and not api_key.startswith('your_'))

    @staticmethod
    def get_api_key():
        return current_app.config.get('XAI_API_KEY', '').strip()

    @staticmethod
    def get_default_model():
        return current_app.config.get('XAI_MODEL', 'grok-2-latest')

    @staticmethod
    def get_api_url():
        return current_app.config.get('XAI_API_URL', 'https://api.x.ai/v1/chat/completions')

    @staticmethod
    def get_available_models():
        configured = GrokService.is_configured()
        return [
            {**m, 'configured': configured} for m in GROK_AVAILABLE_MODELS
        ]

    @staticmethod
    def chat(messages, model=None, stream=False, temperature=0.7, max_tokens=2048):
        """
        Execute chat completion using xAI Grok API.
        If stream=True, returns a generator emitting chunks.
        If stream=False, returns dict with {success, response, model, provider}.
        """
        api_key = GrokService.get_api_key()
        if not GrokService.is_configured():
            err_msg = 'xAI Grok API key not configured in .env. Falling back to local Ollama engine.'
            if stream:
                def err_gen():
                    yield {'error': True, 'use_fallback': True, 'message': err_msg, 'provider': 'xAI Grok'}
                return err_gen()
            return {
                'success': False,
                'use_fallback': True,
                'error': 'API_KEY_NOT_CONFIGURED',
                'message': err_msg
            }

        effective_model = model or GrokService.get_default_model()
        # Clean model name if passed with prefix
        if effective_model.startswith('xai:'):
            effective_model = effective_model.replace('xai:', '')
        if effective_model.startswith('xai/'):
            effective_model = effective_model.replace('xai/', '')

        api_url = GrokService.get_api_url()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": effective_model,
            "messages": messages,
            "stream": stream,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        if stream:
            return GrokService._stream_chat(api_url, headers, payload, effective_model)
        else:
            return GrokService._sync_chat(api_url, headers, payload, effective_model)

    @staticmethod
    def _sync_chat(api_url, headers, payload, model):
        try:
            resp = requests.post(api_url, headers=headers, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                content = data['choices'][0]['message']['content'].strip()
                return {
                    'success': True,
                    'response': content,
                    'model': f"xAI {model}",
                    'provider': 'xAI Grok (Cloud)'
                }
            elif resp.status_code == 403:
                return {
                    'success': False,
                    'use_fallback': True,
                    'error': 'NO_CREDITS',
                    'message': 'xAI Grok API team has 0 credits. Automatically routed to local Ollama engine.'
                }
            elif resp.status_code == 401:
                return {
                    'success': False,
                    'use_fallback': True,
                    'error': 'INVALID_API_KEY',
                    'message': 'xAI Grok API key is invalid or unauthorized. Automatically routed to local Ollama engine.'
                }
            elif resp.status_code == 404:
                # Try fallback to grok-2-latest if model wasn't found
                if payload['model'] != 'grok-2-latest':
                    payload['model'] = 'grok-2-latest'
                    retry = requests.post(api_url, headers=headers, json=payload, timeout=20)
                    if retry.status_code == 200:
                        data = retry.json()
                        return {
                            'success': True,
                            'response': data['choices'][0]['message']['content'].strip(),
                            'model': 'xAI grok-2-latest',
                            'provider': 'xAI Grok (Cloud)'
                        }
                return {
                    'success': False,
                    'use_fallback': True,
                    'error': f"xAI API Error HTTP {resp.status_code}: {resp.text}"
                }
            else:
                return {
                    'success': False,
                    'use_fallback': True,
                    'error': f"xAI API HTTP {resp.status_code}: {resp.text}"
                }
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'use_fallback': True,
                'error': 'xAI Grok API request timed out. Falling back to local Ollama AI.'
            }
        except Exception as e:
            return {
                'success': False,
                'use_fallback': True,
                'error': str(e)
            }

    @staticmethod
    def _stream_chat(api_url, headers, payload, model):
        try:
            resp = requests.post(api_url, headers=headers, json=payload, stream=True, timeout=25)
            if resp.status_code != 200:
                err_msg = f"xAI Grok HTTP {resp.status_code}"
                if resp.status_code == 403:
                    err_msg = "xAI team has no credits. Falling back to local Ollama AI."
                elif resp.status_code == 401:
                    err_msg = "xAI key unauthorized. Falling back to local Ollama AI."

                yield {
                    'error': True,
                    'use_fallback': True,
                    'status_code': resp.status_code,
                    'message': err_msg,
                    'model': f"xAI {model}",
                    'provider': 'xAI Grok'
                }
                return

            for line in resp.iter_lines():
                if not line:
                    continue
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    raw_data = line_str[6:].strip()
                    if raw_data == '[DONE]':
                        yield {
                            'chunk': '',
                            'done': True,
                            'model': f"xAI {model}",
                            'provider': 'xAI Grok (Cloud)'
                        }
                        break
                    try:
                        chunk_json = json.loads(raw_data)
                        delta = chunk_json.get('choices', [{}])[0].get('delta', {})
                        content_piece = delta.get('content', '')
                        if content_piece:
                            yield {
                                'chunk': content_piece,
                                'done': False,
                                'model': f"xAI {model}",
                                'provider': 'xAI Grok (Cloud)'
                            }
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            yield {
                'error': True,
                'use_fallback': True,
                'message': f"Grok connection error: {str(e)}",
                'model': f"xAI {model}",
                'provider': 'xAI Grok'
            }
