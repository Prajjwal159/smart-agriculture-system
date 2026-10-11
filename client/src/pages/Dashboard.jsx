import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import WeatherWidget from "../components/WeatherWidget";
import FarmMap from "../components/FarmMap";
import LiveActivityFeed from "../components/LiveActivityFeed";
import { API_BASE } from "../api";
import {
  FaSeedling, FaMapMarkedAlt, FaLeaf, FaChartLine,
  FaBrain, FaTint, FaFileAlt, FaUpload,
} from "react-icons/fa";
import {
  LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

// ── Reusable empty state ──────────────────────────────────────────────────
function EmptyChart({ message = "Upload a soil report to see data" }) {
  return (
    <div className="flex flex-col items-center justify-center h-44 text-gray-300 gap-2">
      <FaFileAlt size={28} />
      <p className="text-xs text-center leading-5 max-w-[220px]">{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const farmer  = JSON.parse(localStorage.getItem("farmer")) || {};
  const district = farmer.district || farmer.state || "Bangalore";
  const city     = farmer.district || farmer.village || farmer.state || "Bangalore";

  const [dash,    setDash]    = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/reports/dashboard/${encodeURIComponent(district)}`).catch(() => null),
      axios.get(`${API_BASE}/api/weather/${encodeURIComponent(city)}`).catch(() => null),
    ]).then(([d, w]) => {
      if (d) setDash(d.data);
      if (w) setWeather(w.data);
      setLoading(false);
    });
  }, [district, city]);

  const hasData = dash?.hasData === true;

  // Time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning ☀️" : hour < 18 ? "Good Afternoon 🌤️" : "Good Evening 🌙";

  // Smart weather advice from live data
  const wxAdvice = () => {
    if (!weather) return `Fetching live weather for ${district}...`;
    const t = Math.round(weather.main?.temp   || 0);
    const h = weather.main?.humidity           || 0;
    const cond = weather.weather?.[0]?.main   || "";
    if (t > 35) return `🌡️ ${t}°C detected near ${district}. Irrigate crops during evening hours.`;
    if (h > 80) return `💧 Humidity ${h}% near ${district}. High fungal disease risk — monitor crops.`;
    if (cond === "Rain") return `🌧️ Rain detected near ${district}. Delay fertilizer application.`;
    return `✅ Weather at ${district} (${t}°C, ${h}% humidity) is favourable for crop growth today.`;
  };

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* ── TOP: GREETING + DISTRICT STATS ─────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

          {/* Greeting card */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow border border-green-50 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-30 -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-green-900">{greeting}</h1>
                    <span className="text-xs text-gray-400 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                      {district} Region
                    </span>
                  </div>
                  <p className="text-base font-semibold text-gray-800">{farmer.name} 🌾</p>
                  <p className="text-gray-500 text-sm mt-1 leading-6 max-w-2xl">{wxAdvice()}</p>

                  {!loading && !hasData && (
                    <div className="mt-3 bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded-xl px-4 py-3 leading-5">
                      <b>No soil reports for {district} region yet.</b><br />
                      Dashboard stats will populate once farmers upload reports.{" "}
                      <a href="/upload" className="underline font-semibold">Upload yours now →</a>
                    </div>
                  )}
                </div>

                {/* District counter */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl p-4 min-w-[130px] shadow-lg shrink-0 text-center">
                  <p className="text-white/80 text-xs">District Reports</p>
                  <h1 className="text-4xl font-bold mt-1">{loading ? "…" : dash?.totalReports || 0}</h1>
                  <p className="text-xs text-green-100 mt-1">{loading ? "" : `${dash?.totalFarmers || 0} farmers`}</p>
                </div>
              </div>

              {/* Mini stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Avg Soil Health", value: hasData ? `${dash.avgHealth}` : "—",           color: "bg-green-50 text-green-700 border-green-100" },
                  { label: "Avg Moisture",    value: hasData ? `${dash.avgMoisture}%` : "—",        color: "bg-blue-50 text-blue-700 border-blue-100" },
                  { label: "Avg Nitrogen",    value: hasData ? `${dash.avgNitrogen} kg/ha` : "—",   color: "bg-orange-50 text-orange-700 border-orange-100" },
                  { label: "Avg N Dose",      value: hasData ? `${dash.avgDose} kg/ha` : "—",       color: "bg-purple-50 text-purple-700 border-purple-100" },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} border rounded-xl px-3 py-2.5`}>
                    <p className="text-xs opacity-70">{s.label}</p>
                    <p className="text-base font-bold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live activity feed */}
          <LiveActivityFeed />
        </div>

        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-5 shadow-xl text-white mb-5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white text-green-700 p-3 rounded-2xl shadow-lg shrink-0"><FaLeaf size={20} /></div>
            <div>
              <h1 className="text-xl font-bold">Smart Agriculture AI — {district} Community 🌱</h1>
              <p className="text-green-100 text-sm mt-0.5">
                {hasData
                  ? `${dash.totalFarmers} registered farmers · ${dash.totalReports} soil reports analysed · District-level intelligence`
                  : "Upload soil reports to power community-level farming intelligence for your district"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── STATS CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          {[
            { title: "Crop Type",         value: farmer.cropType || "—",                   color: "from-green-700 to-green-500",    icon: <FaSeedling size={20} /> },
            { title: "Farm Size",         value: farmer.farmSize ? `${farmer.farmSize} Ac` : "—", color: "from-blue-700 to-blue-500",  icon: <FaMapMarkedAlt size={20} /> },
            { title: "Dist Avg Moisture", value: hasData ? `${dash.avgMoisture}%` : "—",   color: "from-cyan-700 to-cyan-500",      icon: <FaTint size={20} /> },
            { title: "Dist Soil Health",  value: hasData ? `${dash.avgHealth}` : "—",      color: "from-orange-600 to-yellow-500",  icon: <FaChartLine size={20} /> },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }}
              className={`bg-gradient-to-br ${s.color} p-4 rounded-2xl shadow-lg text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs">{s.title}</p>
                  <h1 className="text-2xl font-bold mt-2">{s.value}</h1>
                </div>
                <div className="text-white/80">{s.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* LEFT — charts */}
          <div className="xl:col-span-2 space-y-5">

            {/* Nitrogen trend */}
            <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-green-900">Nitrogen Trend — {district} Region</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Monthly community-average nutrient levels</p>
                </div>
                {hasData && (
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100">
                    {dash.nitrogenTrend.length} months
                  </span>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center h-44 items-center">
                  <div className="w-6 h-6 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                </div>
              ) : hasData && dash.nitrogenTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dash.nitrogenTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="nitrogen"   stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Avg N (kg/ha)" />
                    <Line type="monotone" dataKey="moisture"   stroke="#2563eb" strokeWidth={2}   dot={{ r: 3 }} name="Avg Moisture %" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="prediction" stroke="#f59e0b" strokeWidth={2}   dot={{ r: 3 }} name="Avg Dose Rec" strokeDasharray="6 3" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message={`No reports from ${district} yet. Upload soil reports to generate district trends.`} />
              )}
            </div>

            {/* AI Recommendation — shows last report's data for this user */}
            <RecommendationFromReports farmerId={farmer._id} />

            {/* Yield forecast */}
            <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-green-900">Yield Trend — {district} Region</h2>
                <span className="text-xs text-gray-400">Estimated from N-dose data</span>
              </div>
              {hasData && dash.yieldTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dash.yieldTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="forecast" stroke="#16a34a" fill="#bbf7d0" strokeWidth={2} name="Forecast (t/ha)" fillOpacity={0.5} />
                    <Area type="monotone" dataKey="actual"   stroke="#2563eb" fill="#bfdbfe" strokeWidth={2} name="Estimated (t/ha)" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>

            {/* Soil radar + crop distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
                <h2 className="text-sm font-bold text-green-900 mb-3">Soil Health Profile — {district}</h2>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={[
                      { subject: "Nitrogen",    value: Math.min(100, dash.avgNitrogen) },
                      { subject: "Phosphorous", value: Math.min(100, dash.avgPhosphorous) },
                      { subject: "Potassium",   value: Math.min(100, dash.avgPotassium) },
                      { subject: "Moisture",    value: Math.min(100, dash.avgMoisture) },
                      { subject: "Health",      value: Math.min(100, dash.avgHealth) },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fontSize: 9 }} />
                      <Radar dataKey="value" stroke="#15803d" fill="#22c55e" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
                <h2 className="text-sm font-bold text-green-900 mb-3">Crop Distribution — {district}</h2>
                {hasData && dash.cropDistribution?.length > 0 ? (
                  <div className="space-y-2.5 mt-2">
                    {dash.cropDistribution.slice(0, 5).map((c, i) => {
                      const total = dash.cropDistribution.reduce((s, x) => s + x.value, 0);
                      const pct   = Math.round((c.value / total) * 100);
                      const cols  = ["bg-green-500","bg-blue-500","bg-orange-500","bg-purple-500","bg-cyan-500"];
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{c.name}</span>
                            <span className="text-gray-400">{c.value} farmer{c.value !== 1 ? "s" : ""} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className={`${cols[i % cols.length]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <EmptyChart message="No farmer data for this district yet." />}
              </div>
            </div>

            {/* Farm Map using farmer's real location */}
            <FarmMap />

            {/* Insights + Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <InsightsFromData dash={dash} hasData={hasData} district={district} />
              <WeatherWidget />
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <ProfileCard />

            {/* District soil status */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl"><FaBrain size={18} /></div>
                <div>
                  <h1 className="text-sm font-bold text-green-900">District Soil Status</h1>
                  <p className="text-gray-400 text-xs">{district} community average</p>
                </div>
              </div>
              {hasData ? (
                <div className="space-y-3">
                  {[
                    { label: "Soil Health",  val: Math.min(100, dash.avgHealth),                color: "bg-green-600",  track: "bg-green-100" },
                    { label: "Nitrogen",     val: Math.min(100, dash.avgNitrogen),              color: "bg-blue-600",   track: "bg-blue-100" },
                    { label: "Moisture",     val: Math.min(100, dash.avgMoisture),              color: "bg-orange-500", track: "bg-orange-100" },
                  ].map((m, i) => (
                    <div key={i} className={`${m.track} p-3 rounded-xl`}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-600">{m.label}</span>
                        <span className="font-bold text-gray-800">{m.val}%</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full">
                        <div className={`${m.color} h-2 rounded-full transition-all`} style={{ width: `${m.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-300 text-xs">
                  <FaUpload size={24} className="mx-auto mb-2" />
                  Upload reports to see district status
                </div>
              )}
            </div>

            {/* Live weather from API */}
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
              <h1 className="text-sm font-bold text-green-900 mb-3">Live Weather — {district} 🌦️</h1>
              {weather ? (
                <div className="space-y-2">
                  {[
                    { label: "Temperature", value: `${Math.round(weather.main?.temp)}°C`,      color: "bg-green-50 text-green-700" },
                    { label: "Humidity",    value: `${weather.main?.humidity}%`,                color: "bg-blue-50 text-blue-700" },
                    { label: "Condition",   value: weather.weather?.[0]?.main || "—",          color: "bg-cyan-50 text-cyan-700" },
                    { label: "Wind",        value: `${weather.wind?.speed} km/h`,              color: "bg-orange-50 text-orange-600" },
                  ].map((w, i) => (
                    <div key={i} className={`flex justify-between items-center ${w.color} px-3 py-2 rounded-xl text-xs`}>
                      <span className="opacity-70">{w.label}</span>
                      <span className="font-bold">{w.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Loading weather for {district}...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline component: AI recommendation from user's last report ───────────
function RecommendationFromReports({ farmerId }) {
  const [recs, setRecs] = useState([]);
  const [dose, setDose] = useState(null);

  useEffect(() => {
    if (!farmerId) return;
    axios.get(`${API_BASE}/api/reports/analytics/${farmerId}`)
      .then(r => {
        if (r.data.hasData) {
          setRecs(r.data.lastRecommendations || []);
          setDose(r.data.lastDose || null);
        }
      }).catch(() => {});
  }, [farmerId]);

  if (!recs.length) {
    return (
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
        <h1 className="text-sm font-bold mb-2">AI Recommendation</h1>
        <p className="text-xs text-green-100 leading-5">
          Upload your first soil report to get personalised AI fertilizer recommendations based on your soil analysis.
        </p>
        <a href="/upload" className="mt-3 inline-block bg-white text-green-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-50 transition-all">
          Upload Report →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-sm font-bold">AI Recommendation (Your Last Report)</h1>
        {dose && <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold">{dose} kg/ha N</span>}
      </div>
      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
        {recs.slice(0, 4).map((r, i) => (
          <p key={i} className="text-xs text-green-100 leading-5">
            • {r.replace(/[⚠️✅📋🌿]/g, "").trim()}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Inline component: insights from real district data ───────────────────
function InsightsFromData({ dash, hasData, district }) {
  if (!hasData) {
    return (
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
        <h1 className="text-sm font-bold mb-2">AI Insights</h1>
        <p className="text-xs text-green-100 leading-5">
          Insights will be generated once soil reports are uploaded from {district} region.
        </p>
      </div>
    );
  }

  const insights = [];
  if (dash.avgNitrogen < 20)       insights.push(`⚠️ Average nitrogen critically low (${dash.avgNitrogen} kg/ha) in ${district}. Most farms need immediate N application.`);
  else if (dash.avgNitrogen > 70)  insights.push(`⚠️ Average nitrogen high (${dash.avgNitrogen} kg/ha). District-wide over-fertilization risk detected.`);
  else                             insights.push(`✅ Average nitrogen (${dash.avgNitrogen} kg/ha) is within healthy range across ${district}.`);

  if (dash.avgMoisture < 30)       insights.push(`💧 District average moisture low (${dash.avgMoisture}%). Widespread irrigation needed before fertilizer application.`);
  else if (dash.avgMoisture > 75)  insights.push(`⚠️ High moisture (${dash.avgMoisture}%) across ${district}. Waterlogging risk — open drainage channels.`);
  else                             insights.push(`✅ Soil moisture (${dash.avgMoisture}%) is adequate for crop growth across the district.`);

  if (dash.avgPhosphorous < 15)    insights.push(`🌱 Phosphorous deficiency (${dash.avgPhosphorous} kg/ha avg). DAP application recommended across ${district}.`);
  else                             insights.push(`✅ Phosphorous levels adequate (${dash.avgPhosphorous} kg/ha avg) for most crops in ${district}.`);

  insights.push(`📊 ${dash.totalReports} soil reports from ${dash.totalFarmers} farmers analysed in ${district} region.`);

  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
      <h1 className="text-sm font-bold mb-3">District AI Insights — {district}</h1>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <p key={i} className="text-xs text-green-100 leading-5">{ins}</p>
        ))}
      </div>
    </div>
  );
}
