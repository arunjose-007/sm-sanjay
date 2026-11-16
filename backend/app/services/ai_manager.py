import os
import re
import json
import logging
from flask import current_app
from app.services.grok_service import GrokService
from app.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are "Intelligent Assistant", a powerful, friendly, and versatile AI assistant. You possess ChatGPT-level conversational intelligence, deep coding skills, mathematical reasoning, and regional livelihood knowledge.

Key Capabilities:
1. GENERAL INTELLIGENCE: You can solve any programming problem (Python, JavaScript, React, SQL, C++, Java, etc.), explain complex scientific and mathematical concepts, write professional essays, reports, emails, translate languages, and answer any general question with thorough, clear, high-quality explanations.
2. MULTILINGUAL & REGIONAL: You fluently understand and respond in English, Tamil (தமிழ்), Tanglish (Tamil in English letters), Hindi, and other Indian languages.
3. LIVELIHOOD & WELFARE: Expert on Indian schemes (PM-KISAN, PMMSY Fisheries, PM SVANidhi, MGNREGA, Mudra loans, PMSBY), job portals (Naukri, NCS, LinkedIn, Indeed, Apna), and rural vocational skills.
4. COASTAL FISHERMAN SAFETY: Marine weather forecasts, Beaufort wind scales, high wave alerts, cyclone warnings, GPS coordinates, monsoon fishing ban relief, and Coast Guard distress protocol (1554).
5. DRIVER & ROAD SAFETY: Defensive highway driving, night/fog navigation, accident blackspots, vehicle maintenance, fatigue management, and Highway Patrol assistance (1073).
6. 24/7 EMERGENCY SOS PROTOCOLS:
   - Official App Helpline Numbers: 6374926569, 7305800510, 8122603655, 7395893275.
   - National Emergency Services: Ambulance (108), Police (100), Highway (1073), Coast Guard (1554).

Formatting Guidelines:
- Use clean Markdown with bold headings, bullet points, and numbered steps.
- When writing code, use triple backtick code blocks with language identifiers (e.g. ```python, ```javascript).
- Provide complete, runnable code and direct, accurate solutions without cutting corners.
"""

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
        Returns full list of available models:
        - Auto Mode
        - Installed Ollama local models (Qwen 2.5, DeepSeek R1, Llama 3.2, Gemma 2, etc.)
        - Grok Cloud models
        """
        ollama_status = OllamaService.check_status()
        grok_configured = GrokService.is_configured()

        models = [
            {
                'id': 'auto',
                'name': 'Auto (Best Engine)',
                'displayName': '✨ Auto Mode (Fastest Available Engine)',
                'provider': 'auto',
                'description': 'Automatically uses local high-speed AI (Qwen, DeepSeek, Llama) or cloud Grok',
                'available': True,
                'isDefault': True
            }
        ]

        # Add installed Ollama models first (free, offline, ultra-fast)
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

        # Add Grok cloud models
        for gm in GrokService.get_available_models():
            models.append({
                'id': f"xai:{gm['id']}",
                'name': gm['displayName'],
                'displayName': gm['displayName'],
                'provider': 'xai',
                'raw_model': gm['id'],
                'description': gm['description'],
                'available': grok_configured,
                'status': 'Configured' if grok_configured else 'Requires XAI_API_KEY with credits'
            })

        return {
            'models': models,
            'grok_configured': grok_configured,
            'ollama_online': ollama_status.get('online', False),
            'ollama_base_url': ollama_status.get('base_url'),
            'installed_count': ollama_status.get('installed_count', 0),
            'catalog_models': ollama_status.get('catalog_models', [])
        }

    @staticmethod
    def format_messages(user_message, history=None, module_context='general'):
        """Construct the prompt messages array including system instruction and context."""
        context_hint = ""
        if module_context and module_context != 'general':
            context_hint = f"\nCurrent Active Focus Area: {module_context.upper()}."

        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT}{context_hint}"}
        ]

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
        Synchronous chat response with resilient multi-tier fallback.
        """
        messages = AIManager.format_messages(user_message, history, module_context)
        provider, target_model = AIManager._resolve_route(model_id)

        # 1. Grok Execution if explicitly requested or auto
        if provider == 'xai':
            res = GrokService.chat(messages, model=target_model, stream=False)
            if res.get('success'):
                return res
            # If explicit Grok failed or auto, continue to Ollama!
            logger.info("Grok API unavailable or out of credits, switching to local Ollama.")

        # 2. Ollama Execution (High-Speed Local AI)
        ollama_status = OllamaService.check_status()
        if ollama_status.get('online') and ollama_status.get('installed_count', 0) > 0:
            ollama_model = target_model if (provider == 'ollama' and target_model != 'auto') else None
            res = OllamaService.chat_sync(messages, model_name=ollama_model)
            if res.get('success'):
                return res

        # 3. Try Grok if provider was ollama and ollama was offline
        if provider != 'xai' and GrokService.is_configured():
            res = GrokService.chat(messages, model=None, stream=False)
            if res.get('success'):
                return res

        # 4. Fallback to offline intelligent responder
        fallback_text = AIManager._get_smart_fallback(user_message, module_context)
        return {
            'success': True,
            'response': fallback_text,
            'model': 'Local Intelligent Engine',
            'provider': 'Built-in Engine (Offline)',
            'fallback': True
        }

    @staticmethod
    def chat_stream(user_message, model_id='auto', history=None, module_context='general'):
        """
        Streaming generator yielding token dicts with bulletproof fallback.
        """
        messages = AIManager.format_messages(user_message, history, module_context)
        provider, target_model = AIManager._resolve_route(model_id)

        has_streamed_real_tokens = False

        # Attempt Grok if requested or auto
        if provider == 'xai' and GrokService.is_configured():
            gen = GrokService.chat(messages, model=target_model, stream=True)
            for item in gen:
                # If error on first token, break to Ollama!
                if item.get('error') and not has_streamed_real_tokens:
                    logger.warning("Grok stream error: %s, falling back to Ollama.", item.get('message'))
                    break
                has_streamed_real_tokens = True
                yield item

            if has_streamed_real_tokens:
                return

        # Attempt Ollama (Local AI Engine)
        ollama_status = OllamaService.check_status()
        if ollama_status.get('online') and ollama_status.get('installed_count', 0) > 0:
            ollama_model = target_model if (provider == 'ollama' and target_model != 'auto') else None
            gen = OllamaService.chat_stream(messages, model_name=ollama_model)
            for item in gen:
                if item.get('error') and not has_streamed_real_tokens:
                    break
                has_streamed_real_tokens = True
                yield item

            if has_streamed_real_tokens:
                return

        # Attempt Grok if provider was ollama but ollama failed
        if not has_streamed_real_tokens and GrokService.is_configured():
            gen = GrokService.chat(messages, model='grok-2-latest', stream=True)
            for item in gen:
                if item.get('error') and not has_streamed_real_tokens:
                    break
                has_streamed_real_tokens = True
                yield item

            if has_streamed_real_tokens:
                return

        # Fallback simulation
        fallback_text = AIManager._get_smart_fallback(user_message, module_context)
        words = fallback_text.split(' ')
        for idx, word in enumerate(words):
            chunk = word + (' ' if idx < len(words) - 1 else '')
            yield {
                'chunk': chunk,
                'done': False,
                'model': 'Local Intelligent Engine',
                'provider': 'Built-in Engine'
            }
        yield {
            'chunk': '',
            'done': True,
            'model': 'Local Intelligent Engine',
            'provider': 'Built-in Engine'
        }

    @staticmethod
    def _resolve_route(model_id):
        mid = (model_id or '').lower().strip()

        if mid.startswith('xai:'):
            return 'xai', mid.replace('xai:', '')
        elif mid.startswith('ollama:'):
            return 'ollama', mid.replace('ollama:', '')

        # Model name keywords
        if 'grok' in mid:
            return 'xai', mid
        if any(k in mid for k in ['llama', 'qwen', 'deepseek', 'gemma', 'mistral', 'phi', 'coder']):
            return 'ollama', mid

        # Auto Mode: If Ollama is running with models, prefer local Ollama (100% free, fast, no credit limits)
        status = OllamaService.check_status()
        if status.get('online') and status.get('installed_count', 0) > 0:
            return 'ollama', status['installed_names'][0]

        # Else if Grok is configured, try Grok
        if GrokService.is_configured():
            return 'xai', 'grok-2-latest'

        return 'auto', 'auto'

    @staticmethod
    def _get_smart_fallback(user_message, module_context):
        msg = user_message.lower()

        # Strict regex matching with word boundaries to avoid false positives (e.g. "prime numbers", "need help with python")
        if re.search(r'\b(emergency|sos\b|accident|ambulance|trauma|108|distress call|save me)\b', msg):
            return OFFLINE_KNOWLEDGE['emergency']
        elif re.search(r'\b(fisherman|fishing|boat|sea state|ocean waves|coast guard|1554|tide|cyclone)\b', msg):
            return OFFLINE_KNOWLEDGE['fisherman']
        elif re.search(r'\b(driver|highway|defensive driving|brake|traffic|speed limit|1073|breakdown)\b', msg):
            return OFFLINE_KNOWLEDGE['driver']
        elif re.search(r'\b(farming|crop|fertilizer|pesticide|soil|kisan|agriculture|seed)\b', msg):
            return OFFLINE_KNOWLEDGE['farming']
        elif re.search(r'\b(job|career|vacancy|resume|employment|hiring|ncs portal)\b', msg):
            return OFFLINE_KNOWLEDGE['jobs']
        elif re.search(r'\b(pm-kisan|pmmsy|svanidhi|mudra|welfare scheme|subsidy)\b', msg):
            return OFFLINE_KNOWLEDGE['schemes']

        # Context-based fallback
        if module_context == 'fisherman':
            return OFFLINE_KNOWLEDGE['fisherman']
        elif module_context == 'driver':
            return OFFLINE_KNOWLEDGE['driver']
        elif module_context == 'livelihood':
            return OFFLINE_KNOWLEDGE['farming']

        return f"""### 🤖 Intelligent Assistant

I received your query:
> *"{user_message}"*

I can assist you with:
- **Programming & Math**: Python, JavaScript, SQL, algorithms, calculations, and debugging.
- **Livelihood & Careers**: PM-KISAN, PMMSY, Mudra loans, jobs on NCS and Naukri.
- **Road Safety & Fisherman Guidance**: Real-time highway alerts, marine weather, wave forecasts, and emergency protocols.

*(💡 Tip: Start Ollama in your terminal using `ollama run qwen2.5:1.5b` or `ollama run deepseek-r1:1.5b` for full offline AI reasoning).*"""
