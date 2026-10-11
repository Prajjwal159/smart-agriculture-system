import { motion } from "framer-motion";

function AIFarmSummary() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  const hour = new Date().getHours();
  let greeting = "Good Evening 🌙";
  if (hour < 12) greeting = "Good Morning ☀️";
  else if (hour < 18) greeting = "Good Afternoon 🌤️";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow border border-green-50 p-5 mt-5 relative overflow-hidden"
    >
      {/* BG GLOW */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-green-100 rounded-full blur-3xl opacity-30 -mr-16 -mt-16"></div>

      {/* TOP ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">

        {/* LEFT */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-green-900">{greeting}</h1>
            <span className="text-xs text-gray-400 bg-green-50 px-2 py-0.5 rounded-lg">AI Daily Summary</span>
          </div>
          <p className="text-base font-semibold text-gray-800 mt-1">{farmer?.name} 🌾</p>
          <p className="text-gray-500 text-sm mt-1 leading-6 max-w-2xl">
            Soil moisture optimal at <b>61%</b>. Nitrogen slightly high — monitor closely.
            Rain probability <b>68%</b> tomorrow. Yield improvement: <b>+12%</b>.
          </p>
        </div>

        {/* AI SCORE */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl p-4 min-w-[140px] shadow-lg shrink-0">
          <p className="text-white/80 text-xs">AI Confidence</p>
          <h1 className="text-4xl font-bold mt-1">92%</h1>
          <p className="text-xs text-green-100 mt-1">Prediction accuracy</p>
        </div>

      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 relative z-10">

        <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100">
          <p className="text-gray-400 text-xs">Soil Health</p>
          <h1 className="text-2xl font-bold text-green-700 mt-1">84</h1>
        </div>

        <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
          <p className="text-gray-400 text-xs">Moisture</p>
          <h1 className="text-2xl font-bold text-blue-700 mt-1">61%</h1>
        </div>

        <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
          <p className="text-gray-400 text-xs">Rain Risk</p>
          <h1 className="text-2xl font-bold text-orange-600 mt-1">68%</h1>
        </div>

        <div className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-100">
          <p className="text-gray-400 text-xs">Yield Growth</p>
          <h1 className="text-2xl font-bold text-purple-700 mt-1">+12%</h1>
        </div>

      </div>

      {/* ALERTS */}
      <div className="mt-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-green-900">Smart AI Alerts</h2>
          <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-semibold">3 Active</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

          <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl flex items-center gap-3">
            <span className="text-lg">🌧️</span>
            <div>
              <p className="font-semibold text-gray-800 text-xs">Rain Expected Tomorrow</p>
              <p className="text-gray-400 text-xs mt-0.5">Avoid fertilizer during rainfall.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
            <span className="text-lg">💧</span>
            <div>
              <p className="font-semibold text-gray-800 text-xs">Irrigation Stable</p>
              <p className="text-gray-400 text-xs mt-0.5">Moisture is healthy for crops.</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3">
            <span className="text-lg">🌱</span>
            <div>
              <p className="font-semibold text-gray-800 text-xs">Nitrogen Monitoring</p>
              <p className="text-gray-400 text-xs mt-0.5">Slightly high. Reduce urea.</p>
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}

export default AIFarmSummary;
