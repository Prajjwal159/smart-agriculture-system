import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

function WeatherWidget() {
  const farmer = JSON.parse(localStorage.getItem("farmer")) || {};
  // Use district → village → state → fallback
  const city   = farmer.district || farmer.village || farmer.state || "Bangalore";

  const [weather, setWeather] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/weather/${encodeURIComponent(city)}`)
      .then(r => setWeather(r.data))
      .catch(() => {});
  }, [city]);

  const advice = () => {
    if (!weather) return "Fetching weather data...";
    const t = Math.round(weather.main?.temp   || 0);
    const h = weather.main?.humidity           || 0;
    const w = weather.weather?.[0]?.main      || "";
    if (t > 35)        return "High temperature. Increase irrigation frequency.";
    if (h > 80)        return "High humidity. Monitor crops for fungal diseases.";
    if (w === "Rain")  return "Rainfall expected. Reduce irrigation to avoid waterlogging.";
    return "Weather conditions are favourable for crop growth.";
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 rounded-2xl shadow-lg">
      <h1 className="text-sm font-bold mb-1">Weather Forecast</h1>
      <p className="text-xs text-blue-200 mb-4">{city}</p>

      {weather ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-4xl font-bold">{Math.round(weather.main?.temp)}°C</h2>
              <p className="text-sm mt-1 text-blue-100">{weather.weather?.[0]?.main}</p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>Humidity: {weather.main?.humidity}%</p>
              <p>Wind: {weather.wind?.speed} km/h</p>
              <p>Feels: {Math.round(weather.main?.feels_like)}°C</p>
            </div>
          </div>

          <div className="bg-white/20 p-3 rounded-xl">
            <p className="text-xs font-semibold mb-1">Smart Farming Advice</p>
            <p className="text-xs leading-5">{advice()}</p>
          </div>
        </>
      ) : (
        <p className="text-xs text-blue-200">Loading weather for {city}...</p>
      )}
    </div>
  );
}

export default WeatherWidget;
