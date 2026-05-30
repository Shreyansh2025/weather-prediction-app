export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    conditionCode: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
    isDay: boolean;
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    conditionCode: number[];
    precipProb: number[];
    windSpeedMax: number[];
  };
  alerts: string[];
}

export interface CityResult {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

export interface SeasonalData {
  season: string;
  emoji: string;
  months: string;
  tempRange: string;
  rainChance: number;
  humidity: number;
  description: string;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&hourly=relative_humidity_2m,apparent_temperature,uv_index,winddirection_10m&current_weather=true&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const data = await res.json();

  const currentTemp = data.current_weather.temperature;
  const currentCondition = data.current_weather.weathercode;
  const windSpeed = data.current_weather.windspeed;
  const isDay = data.current_weather.is_day === 1;

  // Approximate current hourly values
  const currentHour = new Date().getHours();
  const currentHumidity = (data.hourly?.relative_humidity_2m?.[currentHour]) ?? 50;
  const feelsLike = (data.hourly?.apparent_temperature?.[currentHour]) ?? currentTemp;
  const uvIndex = (data.hourly?.uv_index?.[currentHour]) ?? 0;
  const windDirection = (data.hourly?.winddirection_10m?.[currentHour]) ?? 0;

  // Compute alerts
  const alerts: string[] = [];
  if (currentTemp > 40) {
    alerts.push("Heat Alert: Stay hydrated, avoid outdoor activities between 12–4 PM, use sunscreen");
  } else if (currentTemp < 5) {
    alerts.push("Cold Alert: Wear warm layers, protect extremities, limit outdoor exposure");
  }
  if (currentHumidity > 80) {
    alerts.push("High Humidity Alert: Limit strenuous activity, stay in air-conditioned spaces");
  }
  const todayPrecipProb = data.daily.precipitation_probability_max[0] || 0;
  if (todayPrecipProb > 70) {
    alerts.push("Rain Alert: Carry umbrella, avoid low-lying flood-prone areas");
  }
  const todayMaxWind = data.daily.windspeed_10m_max?.[0] || 0;
  if (todayMaxWind > 50) {
    alerts.push("Strong Wind Alert: Avoid outdoor travel, secure loose objects, stay away from trees");
  }

  return {
    current: {
      temp: currentTemp,
      feelsLike,
      conditionCode: currentCondition,
      humidity: currentHumidity,
      windSpeed,
      windDirection,
      uvIndex: Math.round(uvIndex),
      isDay,
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      conditionCode: data.daily.weathercode,
      precipProb: data.daily.precipitation_probability_max,
      windSpeedMax: data.daily.windspeed_10m_max || [],
    },
    alerts,
  };
}

export async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WeatherApp/1.0' }
  });
  if (!res.ok) return [];
  const data = await res.json();

  return data.map((item: any) => ({
    name: item.address.city || item.address.town || item.address.village || item.name,
    state: item.address.state || "",
    country: item.address.country || "",
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WeatherApp/1.0' }
  });
  if (!res.ok) return "Unknown Location";
  const data = await res.json();
  return data.address.city || data.address.town || data.address.village || data.address.state || "Unknown Location";
}

export function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function getUVLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-400' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400' };
  return { label: 'Extreme', color: 'text-purple-400' };
}

export function getSeasonalData(cityName: string, lat: number): SeasonalData[] {
  const isNorth = lat >= 24;
  const isSouth = lat < 18;
  const isCoastal = /mumbai|kochi|chennai|visakhapatnam|surat|goa|mangalore/i.test(cityName);
  const isNE = /guwahati|assam|manipur|meghalaya|mizoram|nagaland|tripura|arunachal/i.test(cityName);

  let summerTemp = "32–38°C";
  let monsoonTemp = "27–32°C";
  let winterTemp = "15–22°C";
  let autumnTemp = "24–30°C";
  let monsoonRain = 60;
  let summerRain = 10;
  let winterRain = 5;
  let autumnRain = 20;
  let summerHumidity = 40;
  let monsoonHumidity = 88;
  let winterHumidity = 55;
  let autumnHumidity = 62;

  let summerDesc = "Hot and predominantly dry. Afternoon temperatures can be intense.";
  let monsoonDesc = "Moderate rainfall with high humidity. Greenery revives across the region.";
  let winterDesc = "Cool and pleasant temperatures with clear skies.";
  let autumnDesc = "Comfortable transitional weather. Ideal for outdoor activities.";

  if (isNorth) {
    summerTemp = "38–44°C"; monsoonTemp = "30–35°C"; winterTemp = "5–15°C"; autumnTemp = "20–28°C";
    monsoonRain = 75; summerRain = 8; winterRain = 4; autumnRain = 18;
    summerHumidity = 28; monsoonHumidity = 85; winterHumidity = 65; autumnHumidity = 58;
    summerDesc = "Extremely hot — peak temperatures can touch 45°C. Stay indoors 12–4 PM, carry water.";
    monsoonDesc = "Heavy rainfall with relief from summer heat. Flash flooding possible in low areas.";
    winterDesc = "Foggy cold mornings, chilly evenings. North plains see dense winter fog in Dec–Jan.";
    autumnDesc = "Golden pleasant weather — best time to visit. Clear skies and comfortable days.";
  } else if (isCoastal) {
    summerTemp = "30–35°C"; monsoonTemp = "26–30°C"; winterTemp = "20–26°C"; autumnTemp = "26–31°C";
    monsoonRain = 95; summerRain = 12; winterRain = 8; autumnRain = 30;
    summerHumidity = 72; monsoonHumidity = 92; winterHumidity = 68; autumnHumidity = 74;
    summerDesc = "Hot and humid with sea breeze providing partial relief. Avoid peak noon hours.";
    monsoonDesc = "Very heavy rainfall — among the wettest regions in India. Waterlogging common.";
    winterDesc = "Warm and pleasant with gentle sea winds. Popular tourist season.";
    autumnDesc = "Post-monsoon with warm sunny days and moderate humidity. Comfortable outdoors.";
  } else if (isNE) {
    summerTemp = "28–34°C"; monsoonTemp = "25–30°C"; winterTemp = "8–16°C"; autumnTemp = "18–24°C";
    monsoonRain = 90; summerRain = 35; winterRain = 12; autumnRain = 40;
    summerHumidity = 75; monsoonHumidity = 92; winterHumidity = 72; autumnHumidity = 78;
    summerDesc = "Warm and pre-monsoon showers begin. Lush greenery with high humidity.";
    monsoonDesc = "One of the highest rainfall regions in the world. Expect continuous heavy rain.";
    winterDesc = "Cold and misty. Hill stations are frosty. Valley areas remain mild.";
    autumnDesc = "Lush landscapes post-monsoon with comfortable temperatures and mild rain.";
  } else if (isSouth) {
    summerTemp = "32–38°C"; monsoonTemp = "27–32°C"; winterTemp = "18–24°C"; autumnTemp = "24–28°C";
    monsoonRain = 70; summerRain = 15; winterRain = 25; autumnRain = 45;
    summerHumidity = 60; monsoonHumidity = 86; winterHumidity = 70; autumnHumidity = 76;
    summerDesc = "Hot and sunny. Inland areas are drier; humidity rises near coasts.";
    monsoonDesc = "Southwest monsoon brings good rainfall Jun–Sep; northeast monsoon continues Oct–Nov.";
    winterDesc = "Mild and comfortable — the most pleasant season. North-east monsoon may bring rain.";
    autumnDesc = "Transitioning out of monsoon — still green, occasionally rainy, mostly pleasant.";
  }

  return [
    {
      season: "Summer",
      emoji: "☀️",
      months: "March – May",
      tempRange: summerTemp,
      rainChance: summerRain,
      humidity: summerHumidity,
      description: summerDesc,
    },
    {
      season: "Monsoon",
      emoji: "🌧️",
      months: "June – September",
      tempRange: monsoonTemp,
      rainChance: monsoonRain,
      humidity: monsoonHumidity,
      description: monsoonDesc,
    },
    {
      season: "Autumn / Spring",
      emoji: "🍂",
      months: "October – November",
      tempRange: autumnTemp,
      rainChance: autumnRain,
      humidity: autumnHumidity,
      description: autumnDesc,
    },
    {
      season: "Winter",
      emoji: "❄️",
      months: "December – February",
      tempRange: winterTemp,
      rainChance: winterRain,
      humidity: winterHumidity,
      description: winterDesc,
    }
  ];
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code === 51 || code === 53 || code === 55) return "🌦️";
  if (code === 61 || code === 63 || code === 65) return "🌧️";
  if (code === 71 || code === 73 || code === 75) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code === 85 || code === 86) return "🌨️";
  if (code === 95) return "⛈️";
  if (code === 96 || code === 99) return "⛈️";
  return "🌤️";
}

export function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code === 85 || code === 86) return "Snow Showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Hail";
  return "Unknown";
}
