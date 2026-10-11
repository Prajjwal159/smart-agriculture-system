import { useEffect, useState } from "react";
import axios from "axios";

function WeatherWidget() {

  const [weather, setWeather] = useState(null);

  useEffect(() => { fetchWeather(); }, []);

  const fetchWeather = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/weather/Mysore");
      setWeather(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 rounded-2xl shadow-lg">
      <h1 className="text-base font-bold mb-4">Weather Forecast</h1>

      {weather && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</h2>
              <p className="text-sm mt-1 text-blue-100">{weather.weather[0].main}</p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind: {weather.wind.speed} km/h</p>
            </div>
          </div>

          <div className="mt-4 bg-white/20 p-3 rounded-xl">
            <p className="text-xs font-semibold mb-1">Smart Farming Advice</p>
            <p className="text-xs leading-5">
              {weather.main.temp > 35
                ? "High temperature. Increase irrigation frequency."
                : weather.main.humidity > 80
                ? "High humidity. Monitor crops for fungal diseases."
                : weather.weather[0].main === "Rain"
                ? "Rainfall expected. Reduce irrigation."
                : "Weather conditions are favorable for crop growth."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default WeatherWidget;
