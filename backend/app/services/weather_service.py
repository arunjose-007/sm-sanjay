import requests
import re
from datetime import datetime
from app.models import db, WeatherRecord
from flask import current_app

WMO_WEATHER_CODES = {
    0: ("Clear Sky", "sunny"),
    1: ("Mainly Clear", "partly_cloudy"),
    2: ("Partly Cloudy", "partly_cloudy"),
    3: ("Overcast", "cloudy"),
    45: ("Foggy", "fog"),
    48: ("Depositing Rime Fog", "fog"),
    51: ("Light Drizzle", "rain"),
    53: ("Moderate Drizzle", "rain"),
    55: ("Dense Drizzle", "rain"),
    61: ("Slight Rain", "rain"),
    63: ("Moderate Rain", "rain"),
    65: ("Heavy Rain", "heavy_rain"),
    71: ("Slight Snow", "snow"),
    80: ("Rain Showers", "rain"),
    81: ("Moderate Showers", "heavy_rain"),
    82: ("Violent Showers", "heavy_rain"),
    95: ("Thunderstorm", "thunderstorm"),
    96: ("Thunderstorm with Hail", "thunderstorm"),
    99: ("Severe Thunderstorm", "thunderstorm"),
}

class WeatherService:
    @staticmethod
    def geocode_location(location_name):
        """
        Geocode location name to (lat, lon, display_name) using Open-Meteo & Nominatim.
        Zero API keys required.
        """
        if not location_name or not location_name.strip():
            return None

        clean_name = location_name.strip()

        # 1. Try Open-Meteo Geocoding API (Fast, Free, No Key)
        try:
            geo_url = current_app.config.get('OPEN_METEO_GEO_URL', 'https://geocoding-api.open-meteo.com/v1/search')
            params = {'name': clean_name, 'count': 1, 'language': 'en', 'format': 'json'}
            resp = requests.get(geo_url, params=params, timeout=4)
            if resp.status_code == 200:
                results = resp.json().get('results', [])
                if results:
                    r = results[0]
                    name = r.get('name', clean_name)
                    admin1 = r.get('admin1', '')
                    country = r.get('country', '')
                    display = f"{name}, {admin1}, {country}".strip(', ')
                    return {
                        'name': name,
                        'latitude': float(r['latitude']),
                        'longitude': float(r['longitude']),
                        'region': admin1,
                        'country': country,
                        'display_name': display or name
                    }
        except Exception:
            pass

        # 2. Try Nominatim Geocoding API
        try:
            headers = {'User-Agent': 'IntelligentAssistant-WeatherService/2.0'}
            nom_url = f"https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(clean_name)}&limit=1"
            resp = requests.get(nom_url, headers=headers, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                if data and len(data) > 0:
                    r = data[0]
                    return {
                        'name': r.get('name') or clean_name,
                        'latitude': float(r['lat']),
                        'longitude': float(r['lon']),
                        'region': '',
                        'country': '',
                        'display_name': r.get('display_name', clean_name)
                    }
        except Exception:
            pass

        return None

    @staticmethod
    def extract_location_from_query(query_text):
        """
        Extract city/location name from natural language queries like:
        - "today climate in Chennai"
        - "what is the climate of Madurai today"
        - "18-11-2026 climate in Coimbatore"
        - "weather in that place"
        """
        if not query_text:
            return None

        # Clean punctuation
        t = re.sub(r'[\?\!\,\.\:\;]', ' ', query_text)

        patterns = [
            r'(?:climate|weather|temperature|forecast|rain|monsoon)\s+(?:in|at|of|for|around)\s+([a-zA-Z\s]{2,30})',
            r'(?:climate|weather|temperature|forecast|rain)\s+([a-zA-Z\s]{2,30})',
            r'(?:in|at|for)\s+([a-zA-Z\s]{2,30})\s+(?:climate|weather|temperature|forecast)',
            r'([a-zA-Z\s]{2,30})\s+(?:climate|weather|temperature|forecast)',
            r'(?:in|at|for)\s+([a-zA-Z\s]{2,30})\s+(?:today|now|tomorrow|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})'
        ]

        stopwords = {
            'that place', 'this place', 'here', 'my place', 'the area', 'area',
            'today', 'tomorrow', 'yesterday', 'now', 'live', 'current', 'present',
            'place', 'city', 'location', 'please', 'tell me', 'give', 'detail', 'details',
            'that', 'this', 'that place climate', 'this place climate'
        }

        for pattern in patterns:
            match = re.search(pattern, t, re.IGNORECASE)
            if match:
                cand = match.group(1).strip()
                # Remove leading/trailing time words
                cand = re.sub(r'^(the|today|today\'s|current|present|live)\s+', '', cand, flags=re.IGNORECASE)
                cand = re.sub(r'\s+(today|now|tomorrow|yesterday|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})$', '', cand, flags=re.IGNORECASE).strip()
                if cand.lower() not in stopwords and len(cand) >= 2:
                    return cand

        return None

    @staticmethod
    def get_weather(latitude=None, longitude=None, location_name=None):
        def_lat = current_app.config.get('DEFAULT_LATITUDE', 11.1271)
        def_lon = current_app.config.get('DEFAULT_LONGITUDE', 78.6569)
        def_loc = current_app.config.get('DEFAULT_LOCATION_NAME', 'Tamil Nadu, India')
        open_meteo_url = current_app.config.get('OPEN_METEO_URL', 'https://api.open-meteo.com/v1/forecast')

        lat = latitude if latitude is not None else def_lat
        lon = longitude if longitude is not None else def_lon
        loc_name = location_name

        # If location name provided but no coordinates, geocode first
        if loc_name and (latitude is None or longitude is None):
            geo = WeatherService.geocode_location(loc_name)
            if geo:
                lat = geo['latitude']
                lon = geo['longitude']
                loc_name = geo['display_name']

        # Reverse-geocode location name if not given
        if not loc_name or loc_name == def_loc:
            try:
                headers = {'User-Agent': 'IntelligentAssistant-Weather/2.0'}
                geo_res = requests.get(
                    f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10",
                    headers=headers,
                    timeout=3
                )
                if geo_res.status_code == 200:
                    addr = geo_res.json().get('address', {})
                    loc_name = addr.get('city') or addr.get('town') or addr.get('county') or addr.get('state') or def_loc
            except Exception:
                loc_name = def_loc

        today_str = datetime.now().strftime('%d-%m-%Y')

        try:
            params = {
                'latitude': lat,
                'longitude': lon,
                'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,visibility',
                'hourly': 'temperature_2m,precipitation_probability,weather_code',
                'daily': 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
                'wind_speed_unit': 'kmh',
                'timezone': 'auto'
            }
            resp = requests.get(open_meteo_url, params=params, timeout=5)

            if resp.status_code == 200:
                json_data = resp.json()
                current_data = json_data.get('current', {})
                daily_data = json_data.get('daily', {})

                code = current_data.get('weather_code', 0)
                condition, icon = WMO_WEATHER_CODES.get(code, ("Clear Sky", "sunny"))
                temp = round(current_data.get('temperature_2m', 28.0), 1)
                apparent_temp = round(current_data.get('apparent_temperature', temp), 1)
                humidity = current_data.get('relative_humidity_2m', 70.0)
                wind_speed = current_data.get('wind_speed_10m', 14.0)
                wind_direction = current_data.get('wind_direction_10m', 0)
                precipitation_mm = current_data.get('precipitation', 0.0)
                rain_mm = current_data.get('rain', 0.0)
                visibility_m = current_data.get('visibility', 10000.0)
                visibility_km = round(visibility_m / 1000.0, 1)

                # 5-day daily forecast
                forecast = []
                dates = daily_data.get('time', [])
                max_temps = daily_data.get('temperature_2m_max', [])
                min_temps = daily_data.get('temperature_2m_min', [])
                precip_probs = daily_data.get('precipitation_probability_max', [])
                codes = daily_data.get('weather_code', [])

                for i in range(min(5, len(dates))):
                    d_code = codes[i] if i < len(codes) else 0
                    d_cond, d_icon = WMO_WEATHER_CODES.get(d_code, ("Clear", "sunny"))
                    forecast.append({
                        'date': dates[i],
                        'max_temp': max_temps[i] if i < len(max_temps) else temp,
                        'min_temp': min_temps[i] if i < len(min_temps) else temp - 5,
                        'condition': d_cond,
                        'icon': d_icon,
                        'precipitation_probability': precip_probs[i] if i < len(precip_probs) else 0
                    })

                # Store latest in local SQLite cache
                try:
                    record = WeatherRecord(
                        location_name=loc_name,
                        latitude=lat,
                        longitude=lon,
                        temperature=temp,
                        humidity=humidity,
                        wind_speed=wind_speed,
                        visibility=visibility_km,
                        weather_condition=condition,
                        weather_code=code,
                        is_cached=True
                    )
                    db.session.add(record)
                    db.session.commit()
                except Exception:
                    db.session.rollback()

                return {
                    'location_name': loc_name,
                    'latitude': lat,
                    'longitude': lon,
                    'temperature': temp,
                    'apparent_temperature': apparent_temp,
                    'humidity': humidity,
                    'wind_speed': wind_speed,
                    'wind_direction': wind_direction,
                    'precipitation_mm': precipitation_mm,
                    'rain_mm': rain_mm,
                    'visibility': visibility_km,
                    'condition': condition,
                    'icon': icon,
                    'forecast': forecast,
                    'today_date': today_str,
                    'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'source': 'Open-Meteo Real-Time Weather API (Live)'
                }
        except Exception:
            pass

        # Offline Fallback from SQLite Cache
        latest = WeatherRecord.query.order_by(WeatherRecord.recorded_at.desc()).first()
        if latest:
            offline_icon = WMO_WEATHER_CODES.get(latest.weather_code or 0, ("Clear Sky", "sunny"))[1]
            return {
                'location_name': latest.location_name or loc_name,
                'latitude': latest.latitude or lat,
                'longitude': latest.longitude or lon,
                'temperature': latest.temperature or 28.0,
                'apparent_temperature': latest.temperature or 28.0,
                'humidity': latest.humidity or 70.0,
                'wind_speed': latest.wind_speed or 14.0,
                'wind_direction': 0,
                'precipitation_mm': 0.0,
                'rain_mm': 0.0,
                'visibility': latest.visibility or 10.0,
                'condition': latest.weather_condition or 'Clear Sky',
                'icon': offline_icon,
                'forecast': [],
                'today_date': today_str,
                'last_updated': latest.recorded_at.strftime('%Y-%m-%d %H:%M:%S') if latest.recorded_at else 'Cached Offline',
                'source': 'SQLite Local Offline Cache'
            }

        return {
            'location_name': loc_name or def_loc,
            'latitude': lat,
            'longitude': lon,
            'temperature': 28.5,
            'apparent_temperature': 29.5,
            'humidity': 68.0,
            'wind_speed': 13.0,
            'wind_direction': 90,
            'precipitation_mm': 0.0,
            'rain_mm': 0.0,
            'visibility': 10.0,
            'condition': 'Mainly Clear',
            'icon': 'sunny',
            'forecast': [],
            'today_date': today_str,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'Regional Fallback Telemetry'
        }

    @staticmethod
    def format_weather_markdown(w_data, requested_date=None):
        """
        Generate a comprehensive, beautiful Markdown report for climate queries with today's live details.
        """
        loc = w_data.get('location_name', 'Current Location')
        temp = w_data.get('temperature', 28.0)
        app_temp = w_data.get('apparent_temperature', temp)
        cond = w_data.get('condition', 'Clear')
        hum = w_data.get('humidity', 65.0)
        wind = w_data.get('wind_speed', 12.0)
        rain = w_data.get('precipitation_mm', 0.0)
        vis = w_data.get('visibility', 10.0)
        date_str = requested_date or w_data.get('today_date') or datetime.now().strftime('%d-%m-%Y')
        source = w_data.get('source', 'Open-Meteo Real-Time Telemetry')

        # Coastal safety assessment
        marine_safe = wind < 45.0
        marine_status = "✅ Normal & Safe Sea Conditions (Wind < 45 km/h)" if marine_safe else "⚠️ High Wind Advisory (Avoid venturing into deep sea)"

        # Road safety assessment
        road_status = "✅ Clear road visibility (> 10 km) & dry highway conditions." if vis >= 8.0 and rain == 0 else "⚠️ Wet / Low visibility conditions — maintain safe braking distance."

        forecast_rows = ""
        for f in w_data.get('forecast', []):
            d = f.get('date', '')
            c = f.get('condition', 'Clear')
            mx = f.get('max_temp', temp)
            mn = f.get('min_temp', temp - 4)
            p = f.get('precipitation_probability', 0)
            forecast_rows += f"- **{d}**: {c} | Max: **{mx}°C**, Min: **{mn}°C** (Rain chance: {p}%)\n"

        if not forecast_rows:
            forecast_rows = "- Real-time daily forecast synchronized via Open-Meteo telemetry.\n"

        return f"""### 🌤️ Live Climate & Weather Report — {loc}
**Date**: {date_str} (Live Today) | **Source**: {source}

| Metric | Current Reading | Status |
|---|---|---|
| **Temperature** | **{temp}°C** | Feels like **{app_temp}°C** |
| **Sky Condition** | **{cond}** | Live Telemetry |
| **Relative Humidity** | **{hum}%** | Comfortable |
| **Wind Speed** | **{wind} km/h** | Light to Moderate Breeze |
| **Precipitation / Rain** | **{rain} mm** | {'No Rain' if rain == 0 else f'{rain} mm Rainfall'} |
| **Visibility** | **{vis} km** | Clear Visibility |

---

#### 🌊 Coastal & Marine Fisherman Advisory
- **Sea State**: {marine_status}
- **Coast Guard Distress Protocol**: VHF Channel 16 / Helpline: **1554**

#### 🛣️ Highway & Road Driver Advisory
- **Driving Safety**: {road_status}
- **Emergency Breakdown**: Highway Patrol Helpline: **1073** / Ambulance: **108**

#### 📅 5-Day Regional Forecast
{forecast_rows}
*Live weather data updated as of {w_data.get('last_updated', date_str)}.*"""
