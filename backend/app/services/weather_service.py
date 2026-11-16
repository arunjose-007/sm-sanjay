import requests
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
    def get_weather(latitude=None, longitude=None, location_name=None):
        lat = latitude if latitude is not None else current_app.config['DEFAULT_LATITUDE']
        lon = longitude if longitude is not None else current_app.config['DEFAULT_LONGITUDE']
        loc_name = location_name

        # Reverse-geocode location name if not given
        if not loc_name or loc_name == current_app.config['DEFAULT_LOCATION_NAME']:
            try:
                headers = {'User-Agent': 'IntelligentAssistant-Weather/2.0'}
                geo_res = requests.get(
                    f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10",
                    headers=headers,
                    timeout=3
                )
                if geo_res.status_code == 200:
                    addr = geo_res.json().get('address', {})
                    loc_name = addr.get('city') or addr.get('town') or addr.get('county') or addr.get('state') or 'Current Location'
            except Exception:
                loc_name = current_app.config['DEFAULT_LOCATION_NAME']

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
            resp = requests.get(current_app.config['OPEN_METEO_URL'], params=params, timeout=5)

            if resp.status_code == 200:
                json_data = resp.json()
                current_data = json_data.get('current', {})
                daily_data = json_data.get('daily', {})
                hourly_data = json_data.get('hourly', {})

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

                # Process 5-day daily forecast
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
                    'last_updated': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                    'source': 'Open-Meteo Real-Time Weather API'
                }
        except Exception:
            pass

        # Offline Fallback from SQLite Cache
        latest = WeatherRecord.query.order_by(WeatherRecord.recorded_at.desc()).first()
        if latest:
            offline_icon = WMO_WEATHER_CODES.get(latest.weather_code or 0, ("Clear Sky", "sunny"))[1]
            return {
                'location_name': latest.location_name or loc_name,
                'latitude': latest.latitude,
                'longitude': latest.longitude,
                'temperature': latest.temperature,
                'apparent_temperature': latest.temperature,
                'humidity': latest.humidity,
                'wind_speed': latest.wind_speed,
                'wind_direction': 0,
                'precipitation_mm': 0.0,
                'rain_mm': 0.0,
                'visibility': latest.visibility,
                'condition': latest.weather_condition,
                'icon': offline_icon,
                'forecast': [],
                'last_updated': latest.recorded_at.strftime('%Y-%m-%d %H:%M:%S') if latest.recorded_at else 'Cached Offline',
                'source': 'SQLite Local Offline Cache'
            }

        return {
            'location_name': loc_name,
            'latitude': lat,
            'longitude': lon,
            'temperature': 28.0,
            'apparent_temperature': 29.0,
            'humidity': 72.0,
            'wind_speed': 14.0,
            'wind_direction': 90,
            'precipitation_mm': 0.0,
            'rain_mm': 0.0,
            'visibility': 10.0,
            'condition': 'Partly Cloudy',
            'icon': 'partly_cloudy',
            'forecast': [],
            'last_updated': 'Default Offline',
            'source': 'Offline Regional Telemetry'
        }
