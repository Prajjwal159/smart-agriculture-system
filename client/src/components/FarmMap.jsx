import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import {
  FaMapMarkerAlt,
  FaTemperatureHigh,
  FaTint,
  FaCloudRain,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";

function FarmMap() {

  const position = [
    12.2958,
    76.6394,
  ];

  return (

    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden">

      <div className="grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-500 p-12 text-white relative overflow-hidden flex flex-col justify-center">

          {/* GLOW */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-24 -mt-24"></div>

          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20"></div>

          <div className="relative z-10">

            {/* HEADER */}
            <div className="flex items-center gap-5 mb-8">

              <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl">

                <FaMapMarkerAlt />

              </div>

              <div>

                <h1 className="text-5xl font-bold leading-tight">

                  Smart Farm Map

                </h1>

                <p className="text-green-100 mt-2 text-lg">

                  Live AI agriculture tracking

                </p>

              </div>

            </div>

            {/* DESCRIPTION */}
            <p className="text-xl leading-10 text-green-50 max-w-xl">

              AI-powered smart farming monitoring
              with weather intelligence,
              climate analysis,
              and precision agriculture insights.

            </p>

            {/* WEATHER */}
            <div className="grid grid-cols-3 gap-5 mt-12">

              <div className="bg-white/15 backdrop-blur-lg p-6 rounded-3xl border border-white/10">

                <FaTemperatureHigh className="text-3xl mb-4" />

                <p className="text-green-100">
                  Temperature
                </p>

                <h1 className="text-4xl font-bold mt-2">
                  29°C
                </h1>

              </div>

              <div className="bg-white/15 backdrop-blur-lg p-6 rounded-3xl border border-white/10">

                <FaTint className="text-3xl mb-4" />

                <p className="text-green-100">
                  Humidity
                </p>

                <h1 className="text-4xl font-bold mt-2">
                  68%
                </h1>

              </div>

              <div className="bg-white/15 backdrop-blur-lg p-6 rounded-3xl border border-white/10">

                <FaCloudRain className="text-3xl mb-4" />

                <p className="text-green-100">
                  Rainfall
                </p>

                <h1 className="text-4xl font-bold mt-2">
                  42%
                </h1>

              </div>

            </div>

          </div>

        </div>

        {/* MAP */}
        <div className="h-[650px] relative">

          <MapContainer
            center={position}
            zoom={12}
            scrollWheelZoom={false}
            className="h-full w-full"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>

              <Popup>

                🌾 Smart Agriculture Farm <br />
                Mysore, Karnataka

              </Popup>

            </Marker>

          </MapContainer>

          {/* FLOATING CARD */}
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-xl p-6 rounded-[30px] shadow-2xl border border-white/50">

            <h2 className="text-2xl font-bold text-green-800">

              Mysore Smart Farm

            </h2>

            <p className="text-gray-500 mt-2">

              Karnataka, India

            </p>

            <div className="flex gap-3 mt-5">

              <span className="bg-green-100 text-green-700 px-5 py-3 rounded-2xl font-semibold">

                AI Active

              </span>

              <span className="bg-blue-100 text-blue-700 px-5 py-3 rounded-2xl font-semibold">

                Live Tracking

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default FarmMap;