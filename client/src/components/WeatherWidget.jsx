import { useEffect, useState } from "react";

import axios from "axios";

function WeatherWidget() {

  const [weather, setWeather] = useState(null);

  useEffect(() => {

    fetchWeather();

  }, []);

  const fetchWeather = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/weather/Mysore"
      );

      setWeather(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 rounded-[30px] shadow-2xl">

      <h1 className="text-3xl font-bold mb-6">
        Weather Forecast
      </h1>

      {weather && (

        <>

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-6xl font-bold">
                {Math.round(weather.main.temp)}°C
              </h2>

              <p className="text-xl mt-3">
                {weather.weather[0].main}
              </p>

            </div>

            <div className="text-right">

              <p className="text-lg">
                Humidity: {weather.main.humidity}%
              </p>

              <p className="text-lg mt-2">
                Wind: {weather.wind.speed} km/h
              </p>

            </div>

          </div>

          <div className="mt-8 bg-white/20 p-5 rounded-2xl">

            <h2 className="font-bold text-xl mb-3">
              Smart Farming Advice
            </h2>

            <p className="leading-7">

  {weather.main.temp > 35
    ? "High temperature detected. Increase irrigation frequency."

    : weather.main.humidity > 80
    ? "High humidity detected. Monitor crops for fungal diseases."

    : weather.weather[0].main === "Rain"
    ? "Rainfall expected. Reduce irrigation to avoid waterlogging."

    : "Current weather conditions are favorable for crop growth."
  }

</p>

          </div>

        </>

      )}

    </div>
  );
}

export default WeatherWidget;