import os
import re
import json
import logging
from datetime import datetime
from flask import current_app
from app.services.grok_service import GrokService
from app.services.groq_service import GroqService
from app.services.gemini_service import GeminiService
from app.services.openrouter_service import OpenRouterService
from app.services.ollama_service import OllamaService
from app.services.weather_service import WeatherService

logger = logging.getLogger(__name__)

OFFLINE_KNOWLEDGE = {
    'emergency': """### 🚨 Emergency Assistance & SOS Helplines

If you are in immediate danger or witness an accident:
- **Emergency Helpline Contacts**:
  1. 📞 `6374926569`
  2. 📞 `7305800510`
  3. 📞 `8122603655`
  4. 📞 `7395893275`
- **National Emergency Numbers**:
  - **108** : Ambulance & Medical Trauma
  - **100** : Police Assistance
  - **1073** : National Highway Patrol & Breakdown
  - **1554** : Indian Coast Guard Maritime Distress
  - **1091** : Women Helpline

*Click the red **EMERGENCY SOS** button in the header to instantly dispatch your live GPS location to all 4 contacts.*""",

    'fisherman': """### 🌊 Coastal Fisherman Safety & Advisory

- **Coast Guard Maritime Helpline**: Call **1554** (toll-free distress frequency VHF Ch-16).
- **Safety Checklist Before Sailing**:
  1. Check INCOIS high wave & wind speed advisories (avoid sea if winds > 45 km/h).
  2. Carry life jackets for every crew member, GPS receiver, DAT (Distress Alert Transmitter), and extra VHF battery.
  3. Keep the 4 emergency helpline numbers handy: **6374926569, 7305800510, 8122603655, 7395893275**.
- **Government Welfare (PMMSY)**:
  - Subsidy up to 40%-60% for motorized boats, deep-sea fishing craft, and cold storage chains.
  - Monsoon fishing ban relief allowance for registered coastal fishermen.""",

    'driver': """### 🛣️ Driver Highway Safety & Navigation Guidelines

- **Highway Patrol Emergency**: Call **1073** or **1033** for immediate toll-road towing/breakdown assistance.
- **Top Safe Driving Protocols**:
  1. **Maintain the 3-Second Rule**: Increase to 5 seconds during rain or heavy fog.
  2. **Accident Blackspots**: Slow down at blind intersections, median cuts, and flyover approaches.
  3. **Fatigue Management**: Take a 15-minute break every 2 hours of continuous driving.
  4. **Emergency Breakdown**: Pull completely onto the shoulder, engage hazard flashers, and place the retro-reflective warning triangle 50m behind the vehicle.
- **SOS Contacts**: **6374926569, 7305800510, 8122603655, 7395893275**.""",

    'farming': """### 🌾 Agricultural Advisory & Crop Health

- **Soil & Nutrient Management**: Test soil electrical conductivity and NPK levels before sowing. Balance chemical fertilizers with bio-fertilizers like *Azospirillum* and *Phosphobacteria*.
- **Pest & Weed Control**: Use neem-based organic repellents (Azadirachtin 10,000 ppm) at first sign of infestation.
- **Key Government Schemes**:
  - **PM-KISAN**: Direct income support of ₹6,000/year in three 4-monthly installments.
  - **PM Krishi Sinchayee Yojana (PMKSY)**: Up to 55%-70% subsidy on drip and sprinkler micro-irrigation systems.
  - **Kisan Credit Card (KCC)**: Low-interest agricultural loans at 4% effective interest rate.""",

    'jobs': """### 💼 Employment & Career Opportunities

- **Top Job Portals in India**:
  - **National Career Service (NCS)**: [ncs.gov.in](https://www.ncs.gov.in) (Free government portal for verified formal and semi-formal jobs).
  - **LinkedIn Jobs**: Ideal for tech, managerial, and corporate roles.
  - **Naukri.com & Indeed India**: Wide coverage across freshers and experienced positions.
  - **Apna**: Great for delivery, driver, technician, sales, and retail positions.
- **Skill Development**: Check **PMKVY (Pradhan Mantri Kaushal Vikas Yojana)** for free vocational certifications in mechanics, electrical, tailoring, and digital literacy.""",

    'schemes': """### 🏛️ Key Government Livelihood Schemes

1. **PM-KISAN**: ₹6,000 annual income support for landholding farming families.
2. **PMMSY (Fisheries Scheme)**: Modern fishing gear, safety equipment, fish farming ponds, and cage culture subsidies.
3. **PM SVANidhi**: Micro-credit loans up to ₹10,000 to ₹50,000 with 7% interest subsidy for street vendors and small traders.
4. **PM Mudra Yojana**: Collateral-free business loans up to ₹10 Lakhs (Shishu, Kishore, Tarun categories).
5. **PMSBY (Suraksha Bima Yojana)**: ₹2 Lakh accidental insurance for just ₹20 per year."""
}

class AIManager:
    @staticmethod
    def get_models_catalog():
        """
        Returns unified catalog across:
        1. Auto Mode
        2. Free AI Cloud Models (Groq, Gemini, OpenRouter)
        3. Local Ollama Models (Qwen, DeepSeek, Llama, Gemma, Phi)
        4. xAI Grok (Cloud)
        """
        ollama_status = OllamaService.check_status()
        groq_configured = GroqService.is_configured()
        gemini_configured = GeminiService.is_configured()
        openrouter_configured = OpenRouterService.is_configured()
        grok_configured = GrokService.is_configured()

        models = [
            {
                'id': 'auto',
                'name': 'Auto (Best Working Engine)',
                'displayName': '✨ Auto Mode (Best Available Free Engine)',
                'provider': 'auto',
                'description': 'Automatically uses the fastest working engine: Groq, Gemini, Ollama, or Real-Time Engine',
                'available': True,
                'isDefault': True
            }
        ]

        # 1. Groq Cloud Models (100% Free, ultra-fast LPUs, supports DeepSeek R1, Llama 3.3/3.1, Qwen 2.5, Gemma 2)
        groq_models = GroqService.get_available_models()
        for gm in groq_models:
            models.append({
                'id': f"groq:{gm['id']}",
                'name': gm['name'],
                'displayName': gm['displayName'],
                'provider': 'groq',
                'raw_model': gm['id'],
                'description': gm['description'],
                'available': groq_configured,
                'status': 'Free & Ready' if groq_configured else 'Add GROQ_API_KEY in .env (100% Free at console.groq.com)'
            })

        # 2. Google Gemini Models (Free tier)
        gemini_models = GeminiService.get_available_models()
        for gem in gemini_models:
            models.append({
                'id': f"gemini:{gem['id']}",
                'name': gem['name'],
                'displayName': gem['displayName'],
                'provider': 'gemini',
                'raw_model': gem['id'],
                'description': gem['description'],
                'available': gemini_configured,
                'status': 'Configured' if gemini_configured else 'Add GEMINI_API_KEY (Free at aistudio.google.com)'
            })

        # 3. Installed Local Ollama Models (100% Free, offline, local)
        for om in ollama_status.get('installed_models', []):
            models.append({
                'id': f"ollama:{om['name']}",
                'name': om['name'],
                'displayName': f"🦙 {om['displayName']}",
                'provider': 'ollama',
                'raw_model': om['name'],
                'description': f"Local offline Ollama model ({om['size']})",
                'available': True,
                'status': 'Installed & Ready'
            })

        # 4. OpenRouter Free Tier
        if openrouter_configured:
            for orm in OpenRouterService.get_available_models():
                models.append({
                    'id': f"openrouter:{orm['id']}",
                    'name': orm['name'],
                    'displayName': f"🌐 {orm['displayName']}",
                    'provider': 'openrouter',
                    'raw_model': orm['id'],
                    'description': orm['description'],
                    'available': True,
                    'status': 'Free Cloud Model'
                })

        # 5. Grok Cloud Models
        for xgm in GrokService.get_available_models():
            models.append({
                'id': f"xai:{xgm['id']}",
                'name': xgm['displayName'],
                'displayName': f"☁️ {xgm['displayName']}",
                'provider': 'xai',
                'raw_model': xgm['id'],
                'description': xgm['description'],
                'available': grok_configured,
                'status': 'Configured' if grok_configured else 'Requires paid XAI_API_KEY credits'
            })

        active_primary = 'Local Ollama' if ollama_status.get('online') and ollama_status.get('installed_count', 0) > 0 else (
            'Groq Free Cloud' if groq_configured else (
                'Google Gemini' if gemini_configured else (
                    'xAI Grok' if grok_configured else 'Real-Time Intelligence Engine (Zero-Key)'
                )
            )
        )

        return {
            'models': models,
            'groq_configured': groq_configured,
            'gemini_configured': gemini_configured,
            'openrouter_configured': openrouter_configured,
            'grok_configured': grok_configured,
            'ollama_online': ollama_status.get('online', False),
            'ollama_base_url': ollama_status.get('base_url'),
            'installed_count': ollama_status.get('installed_count', 0),
            'catalog_models': ollama_status.get('catalog_models', []),
            'active_primary_engine': active_primary
        }

    @staticmethod
    def is_weather_query(message):
        """Detect if the user query is asking about climate, weather, or temperature."""
        msg = message.lower()
        return bool(re.search(r'\b(climate|weather|temperature|temp\b|rain|rainfall|precipitation|cyclone|monsoon|sea state|high waves|wind speed)\b', msg))

    @staticmethod
    def is_date_query(message):
        """Detect if the user query is asking about today's date, current day or time."""
        msg = message.lower()
        return bool(re.search(r'\b(today date|today\'s date|what is today|what date is today|current date|present date|today day|what time is it)\b', msg))

    @staticmethod
    def get_realtime_weather_context(user_message):
        """
        Fetch real-time live Open-Meteo weather telemetry for the query location.
        Returns: (weather_data_dict, formatted_markdown_str)
        """
        loc = WeatherService.extract_location_from_query(user_message)
        weather_data = WeatherService.get_weather(location_name=loc)
        formatted_md = WeatherService.format_weather_markdown(weather_data)
        return weather_data, formatted_md

    @staticmethod
    def build_system_prompt(module_context='general', weather_telemetry=None):
        """Construct the prompt including real-world current date/time grounding."""
        now = datetime.now()
        date_str = now.strftime('%d-%m-%Y')
        full_date_str = now.strftime('%A, %d %B %Y')
        time_str = now.strftime('%I:%M %p')

        prompt = f"""You are "Intelligent Assistant", a powerful, friendly, and versatile AI assistant.
Current Date: {full_date_str} ({date_str}).
Current Local Time: {time_str} IST.
You are fully aware that today is {date_str} in the year {now.year}. When answering any question regarding present details, today's events, or today's climate, ALWAYS base your response on today's date ({date_str}).

Key Capabilities:
1. GENERAL INTELLIGENCE: You can solve any programming problem (Python, JavaScript, React, SQL, C++, Java, etc.), explain complex scientific and mathematical concepts, write professional essays, reports, emails, translate languages, and answer any general question with thorough, clear, high-quality explanations.
2. MULTILINGUAL & REGIONAL: You fluently understand and respond in English, Tamil (தமிழ்), Tanglish (Tamil in English letters), Hindi, and other Indian languages.
3. LIVELIHOOD & WELFARE: Expert on Indian schemes (PM-KISAN, PMMSY Fisheries, PM SVANidhi, MGNREGA, Mudra loans, PMSBY), job portals (Naukri, NCS, LinkedIn, Indeed, Apna), and rural vocational skills.
4. COASTAL FISHERMAN SAFETY: Marine weather forecasts, Beaufort wind scales, high wave alerts, cyclone warnings, GPS coordinates, monsoon fishing ban relief, and Coast Guard distress protocol (1554).
5. DRIVER & ROAD SAFETY: Defensive highway driving, night/fog navigation, accident blackspots, vehicle maintenance, fatigue management, and Highway Patrol assistance (1073).
6. 24/7 EMERGENCY SOS PROTOCOLS:
   - Official App Helpline Numbers: 6374926569, 7305800510, 8122603655, 7395893275.
   - National Emergency Services: Ambulance (108), Police (100), Highway (1073), Coast Guard (1554).
"""
        if module_context and module_context != 'general':
            prompt += f"\nCurrent Active Focus Area: {module_context.upper()}."

        if weather_telemetry:
            prompt += f"""
\n[VERIFIED REAL-TIME LIVE WEATHER TELEMETRY AS OF {date_str}]:
Location: {weather_telemetry.get('location_name')}
Date: {date_str} (Today)
Temperature: {weather_telemetry.get('temperature')}°C (Apparent: {weather_telemetry.get('apparent_temperature')}°C)
Condition: {weather_telemetry.get('condition')}
Humidity: {weather_telemetry.get('humidity')}%
Wind Speed: {weather_telemetry.get('wind_speed')} km/h
Precipitation: {weather_telemetry.get('precipitation_mm')} mm
Visibility: {weather_telemetry.get('visibility')} km
INSTRUCTION: The user is asking about the climate/weather. Use the verified live telemetry above to provide an accurate, up-to-date answer for today ({date_str}).
"""

        return prompt

    @staticmethod
    def format_messages(user_message, history=None, module_context='general', weather_telemetry=None):
        """Construct prompt messages array including system instruction and context."""
        sys_prompt = AIManager.build_system_prompt(module_context, weather_telemetry)
        messages = [{"role": "system", "content": sys_prompt}]

        if history and isinstance(history, list):
            for turn in history[-8:]:
                role = "user" if turn.get('role') == 'user' or turn.get('sender') == 'user' else "assistant"
                content = turn.get('content') or turn.get('text') or ''
                if content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})
        return messages

    @staticmethod
    def chat_sync(user_message, model_id='auto', history=None, module_context='general'):
        """
        Synchronous chat response with real-time weather grounding and multi-engine fallback.
        """
        weather_data = None
        weather_md = None

        # 1. If it's a climate/weather question, fetch live Open-Meteo telemetry first!
        if AIManager.is_weather_query(user_message):
            weather_data, weather_md = AIManager.get_realtime_weather_context(user_message)

        messages = AIManager.format_messages(user_message, history, module_context, weather_telemetry=weather_data)
        provider, target_model = AIManager._resolve_route(model_id)

        # 2. Try Groq (Free Cloud AI: Llama 3.3, DeepSeek R1, Qwen 2.5, Gemma 2, Llama 3.1)
        if provider == 'groq' or (provider == 'auto' and GroqService.is_configured()):
            res = GroqService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                return res

        # 3. Try Local Ollama if running
        ollama_status = OllamaService.check_status()
        if (provider == 'ollama' or provider == 'auto') and ollama_status.get('online') and ollama_status.get('installed_count', 0) > 0:
            ollama_model = target_model if (provider == 'ollama' and target_model != 'auto') else None
            res = OllamaService.chat_sync(messages, model_name=ollama_model)
            if res.get('success'):
                return res

        # 4. Try Google Gemini (Free Tier)
        if provider == 'gemini' or (provider == 'auto' and GeminiService.is_configured()):
            res = GeminiService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                return res

        # 5. Try OpenRouter (Free Tier)
        if provider == 'openrouter' or (provider == 'auto' and OpenRouterService.is_configured()):
            res = OpenRouterService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                return res

        # 6. Try Grok Cloud
        if (provider == 'xai' or provider == 'auto') and GrokService.is_configured():
            res = GrokService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                return res

        # 7. Real-Time Smart Engine Fallback
        # If climate query, return the live verified weather report for today!
        if weather_md:
            return {
                'success': True,
                'response': weather_md,
                'model': 'Open-Meteo Live Climate Telemetry',
                'provider': 'Real-Time Earth Data',
                'fallback': False
            }

        fallback_text = AIManager._get_smart_fallback(user_message, module_context)
        return {
            'success': True,
            'response': fallback_text,
            'model': 'Real-Time Intelligence Engine',
            'provider': 'Built-in Engine (Live & Verified)',
            'fallback': True
        }

    @staticmethod
    def chat_stream(user_message, model_id='auto', history=None, module_context='general'):
        """
        Streaming chat response yielding tokens with live weather integration.
        """
        weather_data = None
        weather_md = None

        if AIManager.is_weather_query(user_message):
            weather_data, weather_md = AIManager.get_realtime_weather_context(user_message)

        messages = AIManager.format_messages(user_message, history, module_context, weather_telemetry=weather_data)
        provider, target_model = AIManager._resolve_route(model_id)

        has_streamed = False

        # 1. Try Groq Cloud (Free Tier)
        if provider == 'groq' or (provider == 'auto' and GroqService.is_configured()):
            gen = GroqService.chat(messages, model=target_model, stream=True)
            for item in gen:
                if item.get('error') and not has_streamed:
                    logger.warning("Groq stream error, falling back.")
                    break
                has_streamed = True
                yield item

            if has_streamed:
                return

        # 2. Try Ollama (Local)
        ollama_status = OllamaService.check_status()
        if (provider == 'ollama' or provider == 'auto') and ollama_status.get('online') and ollama_status.get('installed_count', 0) > 0:
            ollama_model = target_model if (provider == 'ollama' and target_model != 'auto') else None
            gen = OllamaService.chat_stream(messages, model_name=ollama_model)
            for item in gen:
                if item.get('error') and not has_streamed:
                    break
                has_streamed = True
                yield item

            if has_streamed:
                return

        # 3. Try Gemini Cloud
        if (provider == 'gemini' or provider == 'auto') and GeminiService.is_configured():
            res = GeminiService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                text = res.get('response', '')
                for chunk in AIManager._chunk_text(text):
                    yield {
                        'chunk': chunk,
                        'done': False,
                        'model': res.get('model'),
                        'provider': 'Google Gemini'
                    }
                yield {'chunk': '', 'done': True, 'model': res.get('model'), 'provider': 'Google Gemini'}
                return

        # 4. Try OpenRouter
        if (provider == 'openrouter' or provider == 'auto') and OpenRouterService.is_configured():
            res = OpenRouterService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                text = res.get('response', '')
                for chunk in AIManager._chunk_text(text):
                    yield {
                        'chunk': chunk,
                        'done': False,
                        'model': res.get('model'),
                        'provider': 'OpenRouter'
                    }
                yield {'chunk': '', 'done': True, 'model': res.get('model'), 'provider': 'OpenRouter'}
                return

        # 5. Try Grok Cloud
        if (provider == 'xai' or provider == 'auto') and GrokService.is_configured():
            gen = GrokService.chat(messages, model=target_model, stream=True)
            for item in gen:
                if item.get('error') and not has_streamed:
                    break
                has_streamed = True
                yield item

            if has_streamed:
                return

        # 6. Fallback Stream: Weather or Real-Time Engine
        fallback_text = weather_md if weather_md else AIManager._get_smart_fallback(user_message, module_context)
        model_name = 'Open-Meteo Live Climate' if weather_md else 'Real-Time Intelligence Engine'
        prov_name = 'Live Earth Telemetry' if weather_md else 'Built-in Engine'

        for chunk in AIManager._chunk_text(fallback_text):
            yield {
                'chunk': chunk,
                'done': False,
                'model': model_name,
                'provider': prov_name
            }
        yield {
            'chunk': '',
            'done': True,
            'model': model_name,
            'provider': prov_name
        }

    @staticmethod
    def _chunk_text(text, chunk_size=4):
        """Helper to stream pre-computed responses with typing cadence."""
        words = text.split(' ')
        for i in range(0, len(words), chunk_size):
            slice_words = words[i:i + chunk_size]
            yield ' '.join(slice_words) + (' ' if i + chunk_size < len(words) else '')

    @staticmethod
    def _resolve_route(model_id):
        mid = (model_id or '').lower().strip()

        if mid.startswith('groq:'):
            return 'groq', mid.replace('groq:', '')
        elif mid.startswith('gemini:'):
            return 'gemini', mid.replace('gemini:', '')
        elif mid.startswith('openrouter:'):
            return 'openrouter', mid.replace('openrouter:', '')
        elif mid.startswith('ollama:'):
            return 'ollama', mid.replace('ollama:', '')
        elif mid.startswith('xai:'):
            return 'xai', mid.replace('xai:', '')

        # Specific model keywords
        if 'deepseek' in mid:
            return ('groq', 'deepseek-r1-distill-llama-70b') if GroqService.is_configured() else ('ollama', 'deepseek-r1:8b')
        if 'qwen' in mid:
            return ('groq', 'qwen-2.5-32b') if GroqService.is_configured() else ('ollama', 'qwen2.5:7b')
        if 'gemma' in mid:
            return ('groq', 'gemma2-9b-it') if GroqService.is_configured() else ('ollama', 'gemma2:9b')
        if 'llama' in mid or 'gpt-oss' in mid:
            return ('groq', 'llama-3.3-70b-versatile') if GroqService.is_configured() else ('ollama', 'llama3.1:8b')
        if 'phi' in mid:
            return 'ollama', 'phi4:mini'
        if 'grok' in mid:
            return 'xai', mid

        # Auto Mode Priority:
        # 1. Local Ollama if actively running with installed models
        status = OllamaService.check_status()
        if status.get('online') and status.get('installed_count', 0) > 0:
            return 'ollama', status['installed_names'][0]

        # 2. Groq Free Cloud API
        if GroqService.is_configured():
            return 'groq', 'llama-3.3-70b-versatile'

        # 3. Gemini Free API
        if GeminiService.is_configured():
            return 'gemini', 'gemini-2.0-flash'

        # 4. OpenRouter Free API
        if OpenRouterService.is_configured():
            return 'openrouter', 'deepseek/deepseek-r1:free'

        # 5. Grok API
        if GrokService.is_configured():
            return 'xai', 'grok-2-latest'

        return 'auto', 'auto'

    @staticmethod
    def _get_smart_fallback(user_message, module_context):
        msg = user_message.lower()
        now = datetime.now()
        date_str = now.strftime('%d-%m-%Y')
        full_date_str = now.strftime('%A, %d %B %Y')

        # Current Date & Time
        if AIManager.is_date_query(user_message):
            return f"""### 📅 Current Date & Time
- **Today's Date**: **{full_date_str}** (`{date_str}`)
- **Current Time**: **{now.strftime('%I:%M:%S %p')} IST**
- **Year**: {now.year}
- **Status**: Synchronized with live regional clock."""

        # Emergency & SOS
        if re.search(r'\b(emergency|sos\b|accident|ambulance|trauma|108|distress call|save me)\b', msg):
            return OFFLINE_KNOWLEDGE['emergency']

        # Coastal Fisherman
        elif re.search(r'\b(fisherman|fishing|boat|sea state|ocean waves|coast guard|1554|tide|cyclone)\b', msg):
            return OFFLINE_KNOWLEDGE['fisherman']

        # Driver Highway Safety
        elif re.search(r'\b(driver|highway|defensive driving|brake|traffic|speed limit|1073|breakdown)\b', msg):
            return OFFLINE_KNOWLEDGE['driver']

        # Agriculture & Farming
        elif re.search(r'\b(farming|crop|fertilizer|pesticide|soil|kisan|agriculture|seed)\b', msg):
            return OFFLINE_KNOWLEDGE['farming']

        # Jobs & Career
        elif re.search(r'\b(job|career|vacancy|resume|employment|hiring|ncs portal)\b', msg):
            return OFFLINE_KNOWLEDGE['jobs']

        # Welfare Schemes
        elif re.search(r'\b(pm-kisan|pmmsy|svanidhi|mudra|welfare scheme|subsidy)\b', msg):
            return OFFLINE_KNOWLEDGE['schemes']

        # Context-based routing
        if module_context == 'fisherman':
            return OFFLINE_KNOWLEDGE['fisherman']
        elif module_context == 'driver':
            return OFFLINE_KNOWLEDGE['driver']
        elif module_context == 'livelihood':
            return OFFLINE_KNOWLEDGE['farming']

        return f"""### 🤖 Intelligent Assistant
**Current Date**: {date_str} (Live Synchronized)

I received your query:
> *"{user_message}"*

I can assist you with:
- **🌤️ Live Climate & Weather**: Ask *"today climate in Chennai"* or *"18-11-2026 climate in Madurai"* for real-time live temperatures, humidity, wind, and rain!
- **💻 Programming & Debugging**: Python, JavaScript, React, SQL, and algorithms.
- **🏛️ Livelihood & Welfare**: PM-KISAN, PMMSY fisheries subsidies, Mudra loans, and verified job openings.
- **🛡️ Driver & Marine Safety**: Live road alerts, highway breakdown assistance (1073), and Coast Guard distress protocol (1554).

*(💡 **Quick Setup for Full Generative AI in Deployment**)*:
1. **Groq Cloud (100% Free)**: Add `GROQ_API_KEY` in your `.env` or Vercel Environment Variables (get a free key at [console.groq.com](https://console.groq.com)). It supports **DeepSeek R1**, **Llama 3.3 70B**, **Qwen 2.5**, and **Gemma 2** at 300+ tokens/sec!
2. **Local Ollama**: Run `ollama run qwen2.5:7b` or `ollama run deepseek-r1:8b` in your terminal for completely offline local AI."""
