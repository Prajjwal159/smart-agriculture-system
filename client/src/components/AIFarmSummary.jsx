import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function AIFarmSummary() {
  const farmer = JSON.parse(localStorage.getItem("farmer")) || {};

  const [data,    setData]    = useState(null);
  const [weather, setWeather] = useState(null);

  const city = farmer.district || farmer.village || farmer.state || "Bangalore";

  useEffect(() => {
    // Fetch user's own analytics
    if (farmer._id) {
      axios.get(`${API_BASE}/api/reports/analytics/${farmer._id}`)
        .then(r => setData(r.data)).catch(() => {});
    }
    // Fetch live weather
    axios.get(`${API_BASE}/api/weather/${encodeURIComponent(city)}`)
      .then(r => setWeather(r.data)).catch(() => {});
  }, [farmer._id, city]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning ☀️" : hour < 18 ? "Good Afternoon 🌤️" : "Good Evening 🌙";

  const hasData = data?.hasData === true;

  // Rain risk from humidity
  const humidity  = weather?.main?.humidity || 0;
  const temp      = weather ? Math.round(weather.main?.temp || 0) : null;
  const rainRisk  = humidity > 80 ? humidity : humidity > 60 ? Math.round(humidity * 0.85) : Math.round(humidity * 0.5);

  // Soil health from user's reports — null when no data
  const soilHealth = hasData ? data.averageHealth  : null;
  const moisture   = hasData ? data.averageMoisture : null;
  const dose       = hasData ? data.averageDose     : null;

  // Yield growth estimate
  const yieldGrowth = hasData && data.yieldTrend?.length > 1
    ? (() => {
        const first = data.yieldTrend[0]?.forecast || 0;
        const last  = data.yieldTrend[data.yieldTrend.length - 1]?.forecast || 0;
        if (!first) return null;
        return Math.round(((last - first) / first) * 100);
      })()
    : null;

  // Smart summary text
  const summaryText = () => {
    if (!hasData) {
      const wxPart = temp !== null
        ? `Current temperature near ${city} is ${temp}°C with ${humidity}% humidity. `
        : "";
      return `${wxPart}Upload your first soil report to get personalised soil health scores, nitrogen analysis, and yield predictions.`;
    }
    const wxPart = temp !== null ? `Temperature near ${city}: ${temp}°C. ` : "";
    const nPart  = data.averageNitrogen < 20
      ? `⚠️ Average nitrogen (${data.averageNitrogen} kg/ha) is low — apply ${dose} kg/ha recommended dose. `
      : `Nitrogen (${data.averageNitrogen} kg/ha) is in the healthy range. `;
    const mPart  = moisture > 75 ? "High moisture — delay fertilizer. " : moisture < 25 ? "Low moisture — irrigate before applying fertilizer. " : `Moisture at ${moisture}% is optimal. `;
    return `${wxPart}${nPart}${mPart}${yieldGrowth !== null ? `Yield trend: ${yieldGrowth >= 0 ? "+" : ""}${yieldGrowth}%.` : ""}`;
  };

  // Smart alerts
  const alerts = [];
  if (temp !== null && temp > 35)    alerts.push({ icon: "🌡️", title: "Heat Alert",          desc: `${temp}°C near ${city}. Irrigate during evening hours.`, color: "bg-orange-50 border-orange-100" });
  if (humidity > 80)                 alerts.push({ icon: "🌧️", title: "Rain Risk",           desc: "High humidity. Disease risk elevated — monitor crops.", color: "bg-yellow-50 border-yellow-100" });
  if (hasData && data.averageNitrogen < 20) alerts.push({ icon: "⚠️", title: "Low Nitrogen",  desc: `Average N = ${data.averageNitrogen} kg/ha. Apply ${dose} kg/ha soon.`, color: "bg-red-50 border-red-100" });
  if (hasData && moisture < 25)      alerts.push({ icon: "💧", title: "Low Moisture",         desc: "Irrigate before fertilizer application.", color: "bg-blue-50 border-blue-100" });
  if (alerts.length === 0 && hasData) alerts.push({ icon: "✅", title: "All Systems Normal", desc: "Soil conditions look healthy for crop growth.", color: "bg-green-50 border-green-100" });
  if (alerts.length === 0 && !hasData) alerts.push({ icon: "📤", title: "Upload a Report",   desc: "Get personalised AI alerts after uploading your soil report.", color: "bg-gray-50 border-gray-100" });

  return (
    <div className="bg-white rounded-2xl shadow border border-green-50 p-5 relative overflow-hidden mt-0">
      <div className="absolute top-0 right-0 w-48 h-48 bg-green-100 rounded-full blur-3xl opacity-30 -mr-16 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-green-900">{greeting}</h1>
            <span className="text-xs text-gray-400 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">AI Daily Summary</span>
          </div>
          <p className="text-base font-semibold text-gray-800 mt-1">{farmer.name} 🌾</p>
          <p className="text-gray-500 text-sm mt-1 leading-6 max-w-2xl">{summaryText()}</p>
        </div>

        {/* Confidence / report count */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl p-4 min-w-[130px] shadow-lg shrink-0 text-center">
          <p className="text-white/80 text-xs">{hasData ? "Your Reports" : "Reports"}</p>
          <h1 className="text-4xl font-bold mt-1">{data?.totalReports ?? 0}</h1>
          <p className="text-xs text-green-100 mt-1">{hasData ? "AI analysed" : "Upload now"}</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 relative z-10">
        {[
          { label: "Soil Health",  value: soilHealth  !== null ? `${soilHealth}`   : "—",  color: "bg-green-50 text-green-700 border-green-100" },
          { label: "Moisture",     value: moisture    !== null ? `${moisture}%`    : "—",  color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "Rain Risk",    value: temp !== null ? `${rainRisk}%`           : "—",  color: "bg-orange-50 text-orange-600 border-orange-100" },
          { label: "Yield Trend",  value: yieldGrowth !== null ? `${yieldGrowth >= 0 ? "+" : ""}${yieldGrowth}%` : "—", color: "bg-purple-50 text-purple-700 border-purple-100" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} border px-4 py-3 rounded-xl`}>
            <p className="text-gray-400 text-xs">{s.label}</p>
            <h1 className="text-2xl font-bold mt-1">{s.value}</h1>
          </div>
        ))}
      </div>

      {/* Smart alerts */}
      <div className="mt-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-green-900">Smart AI Alerts</h2>
          {alerts.length > 0 && (
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${alerts.some(a => a.icon === "⚠️" || a.icon === "🌡️") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
              {alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={`${a.color} border p-3 rounded-xl flex items-center gap-2`}>
              <span className="text-lg shrink-0">{a.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">{a.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-4">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
