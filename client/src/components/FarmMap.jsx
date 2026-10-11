import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaMapMarkerAlt, FaTemperatureHigh, FaTint, FaCloudRain } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { API_BASE } from "../api";

// Indian city coordinates lookup (fallback for geocoding without a paid API)
const CITY_COORDS = {
  // Karnataka
  mysore: [12.2958, 76.6394], mysuru: [12.2958, 76.6394],
  bangalore: [12.9716, 77.5946], bengaluru: [12.9716, 77.5946],
  hubli: [15.3647, 75.1240], dharwad: [15.4589, 75.0078],
  gulbarga: [17.3297, 76.8343], kalaburagi: [17.3297, 76.8343],
  bellary: [15.1394, 76.9214], mangalore: [12.9141, 74.8560],
  // Maharashtra
  mumbai: [19.0760, 72.8777], pune: [18.5204, 73.8567],
  nagpur: [21.1458, 79.0882], nashik: [19.9975, 73.7898],
  akola: [20.7002, 77.0082], aurangabad: [19.8762, 75.3433],
  // Andhra Pradesh
  hyderabad: [17.3850, 78.4867], vijayawada: [16.5062, 80.6480],
  visakhapatnam: [17.6868, 83.2185], kurnool: [15.8281, 78.0373],
  // Tamil Nadu
  chennai: [13.0827, 80.2707], coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  // Punjab & Haryana
  ludhiana: [30.9010, 75.8573], amritsar: [31.6340, 74.8723],
  chandigarh: [30.7333, 76.7794],
  // UP
  lucknow: [26.8467, 80.9462], varanasi: [25.3176, 82.9739],
  agra: [27.1767, 78.0081], muzaffarnagar: [29.4727, 77.7085],
  // Rajasthan
  jaipur: [26.9124, 75.7873], jodhpur: [26.2389, 73.0243],
  sikar: [27.6094, 75.1399],
  // Madhya Pradesh
  bhopal: [23.2599, 77.4126], indore: [22.7196, 75.8577],
  // West Bengal
  kolkata: [22.5726, 88.3639],
  // Odisha
  bhubaneswar: [20.2961, 85.8245],
  // Bihar
  patna: [25.5941, 85.1376],
  // Himachal Pradesh
  shimla: [31.1048, 77.1734],
};

function getCoords(farmer) {
  const keys = [
    farmer.district, farmer.village, farmer.state
  ].filter(Boolean).map(s => s.toLowerCase().trim());

  for (const key of keys) {
    if (CITY_COORDS[key]) return CITY_COORDS[key];
    // Partial match
    const match = Object.keys(CITY_COORDS).find(k => key.includes(k) || k.includes(key));
    if (match) return CITY_COORDS[match];
  }
  return [20.5937, 78.9629]; // Centre of India
}

export default function FarmMap() {
  const farmer   = JSON.parse(localStorage.getItem("farmer")) || {};
  const position = getCoords(farmer);
  const city     = farmer.district || farmer.village || farmer.state || "India";
  const cityKey  = farmer.district || farmer.village || farmer.state || "Bangalore";

  const [weather, setWeather] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/weather/${encodeURIComponent(cityKey)}`)
      .then(r => setWeather(r.data))
      .catch(() => {});
  }, [cityKey]);

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="grid lg:grid-cols-2">

        {/* LEFT — info panel */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-500 p-5 lg:p-7 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Smart Farm Map</h1>
                <p className="text-green-100 text-xs mt-0.5">{city}, {farmer.state}</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-green-50 max-w-xs">
              Live map centred on your registered farm location — {city}.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaTemperatureHigh className="text-lg mb-2" />
                <p className="text-green-100 text-xs">Temp</p>
                <h1 className="text-lg font-bold mt-0.5">
                  {weather ? `${Math.round(weather.main?.temp)}°C` : "—"}
                </h1>
              </div>
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaTint className="text-lg mb-2" />
                <p className="text-green-100 text-xs">Humidity</p>
                <h1 className="text-lg font-bold mt-0.5">
                  {weather ? `${weather.main?.humidity}%` : "—"}
                </h1>
              </div>
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaCloudRain className="text-lg mb-2" />
                <p className="text-green-100 text-xs">Condition</p>
                <h1 className="text-base font-bold mt-0.5 leading-4">
                  {weather ? (weather.weather?.[0]?.main || "—") : "—"}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* MAP — farmer's actual coordinates */}
        <div className="h-[240px] sm:h-[300px] lg:h-[380px] relative">
          <MapContainer center={position} zoom={11} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                🌾 {farmer.name || "Farm"}<br />
                {city}, {farmer.state}
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating card */}
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-white/50 z-[1000]">
            <h2 className="text-xs sm:text-sm font-bold text-green-800">{city} Farm</h2>
            <p className="text-gray-400 text-xs mt-0.5">{farmer.state}, India</p>
            <div className="flex gap-2 mt-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-semibold">AI Active</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">Live</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
