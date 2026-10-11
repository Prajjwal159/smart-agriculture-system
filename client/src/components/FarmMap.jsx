import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FaMapMarkerAlt, FaTemperatureHigh, FaTint, FaCloudRain } from "react-icons/fa";
import "leaflet/dist/leaflet.css";

function FarmMap() {

  const position = [12.2958, 76.6394];

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="grid lg:grid-cols-2">

        {/* LEFT */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-500 p-5 lg:p-7 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Smart Farm Map</h1>
                <p className="text-green-100 text-xs mt-0.5">Live AI agriculture tracking</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-green-50 max-w-xs">
              AI-powered smart farming monitoring with weather intelligence and precision agriculture insights.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaTemperatureHigh className="text-xl mb-2" />
                <p className="text-green-100 text-xs">Temperature</p>
                <h1 className="text-xl font-bold mt-1">29°C</h1>
              </div>
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaTint className="text-xl mb-2" />
                <p className="text-green-100 text-xs">Humidity</p>
                <h1 className="text-xl font-bold mt-1">68%</h1>
              </div>
              <div className="bg-white/15 p-3 rounded-2xl">
                <FaCloudRain className="text-xl mb-2" />
                <p className="text-green-100 text-xs">Rainfall</p>
                <h1 className="text-xl font-bold mt-1">42%</h1>
              </div>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="h-[240px] sm:h-[300px] lg:h-[380px] relative">
          <MapContainer center={position} zoom={12} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>🌾 Smart Agriculture Farm<br />Mysore, Karnataka</Popup>
            </Marker>
          </MapContainer>

          {/* FLOATING CARD */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 z-[1000]">
            <h2 className="text-sm font-bold text-green-800">Mysore Smart Farm</h2>
            <p className="text-gray-400 text-xs mt-0.5">Karnataka, India</p>
            <div className="flex gap-2 mt-2">
              <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-xl text-xs font-semibold">AI Active</span>
              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-xl text-xs font-semibold">Live</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FarmMap;
