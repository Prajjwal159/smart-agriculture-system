import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  FaLeaf, FaChartLine, FaTint, FaSeedling,
  FaFilePdf, FaFlask, FaUpload,
} from "react-icons/fa";

const COLORS = ["#16a34a", "#2563eb", "#f59e0b"];

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
      <FaFilePdf size={28} />
      <p className="text-xs text-center max-w-[200px] leading-5">{message}</p>
    </div>
  );
}

export default function Analytics() {
  const farmer  = JSON.parse(localStorage.getItem("farmer")) || {};
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/reports/analytics/${farmer._id}`)
      .then(r => setData(r.data))
      .catch(() => setData({ hasData: false }))
      .finally(() => setLoading(false));
  }, [farmer._id]);

  const hasData = data?.hasData === true;

  // Stats derived entirely from user's own reports
  const stats = [
    { label: "Total Reports",  value: data?.totalReports   || 0,     color: "from-green-700 to-green-500",    icon: <FaFilePdf size={18} /> },
    { label: "Avg Nitrogen",   value: hasData ? `${data.averageNitrogen} kg/ha` : "—",  color: "from-blue-700 to-blue-500",    icon: <FaFlask size={18} /> },
    { label: "Avg Moisture",   value: hasData ? `${data.averageMoisture}%` : "—",       color: "from-cyan-700 to-cyan-500",    icon: <FaTint size={18} /> },
    { label: "Avg N Dose",     value: hasData ? `${data.averageDose} kg/ha` : "—",      color: "from-orange-600 to-yellow-500",icon: <FaSeedling size={18} /> },
    { label: "Soil Health",    value: hasData ? `${data.averageHealth}` : "—",          color: "from-purple-700 to-purple-500",icon: <FaChartLine size={18} /> },
  ];

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-800 to-emerald-600 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden mb-5"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10" />
          <h1 className="text-2xl font-bold relative z-10">My Analytics 📈</h1>
          <p className="mt-1 text-sm text-green-100 relative z-10">
            {hasData
              ? `Based on ${data.totalReports} soil report${data.totalReports !== 1 ? "s" : ""} you have uploaded`
              : "Upload soil reports to generate your personal analytics"}
          </p>
        </motion.div>

        {/* No data banner */}
        {!loading && !hasData && (
          <div className="bg-white rounded-2xl shadow border border-orange-100 p-8 text-center mb-5">
            <FaUpload size={36} className="text-orange-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-green-900 mb-2">No Reports Yet</h2>
            <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto leading-6">
              Your analytics page is personalised — every chart and number here comes from your own soil reports.
              Upload your first report to see N/P/K trends, yield progression, fertilizer breakdown, and soil health score.
            </p>
            <a href="/upload"
              className="inline-block bg-gradient-to-r from-green-700 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow hover:opacity-90 transition-all">
              Upload Soil Report
            </a>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`bg-gradient-to-br ${s.color} p-4 rounded-2xl text-white shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs">{s.label}</p>
                  <h2 className="text-xl font-bold mt-1.5">{loading ? "…" : s.value}</h2>
                </div>
                <div className="text-white/70">{s.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROW 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

          {/* N/P/K trend from MY reports */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-green-900">Nutrient Trend (My Reports)</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                Each point = 1 report
              </span>
            </div>
            {loading ? (
              <div className="flex justify-center h-48 items-center">
                <div className="w-6 h-6 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : hasData && data.nitrogenTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.nitrogenTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="nitrogen"    stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Nitrogen" />
                  <Line type="monotone" dataKey="phosphorous" stroke="#2563eb" strokeWidth={2}   dot={{ r: 3 }} name="Phosphorous" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="potassium"   stroke="#f59e0b" strokeWidth={2}   dot={{ r: 3 }} name="Potassium"   strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="prediction"  stroke="#8b5cf6" strokeWidth={2}   dot={{ r: 3 }} name="Rec N Dose"  strokeDasharray="6 2" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Upload reports to see your nutrient trend over time" />
            )}
          </div>

          {/* Fertilizer N:P:K breakdown from MY reports */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <h2 className="text-sm font-bold text-green-900 mb-4">My Fertilizer N:P:K Breakdown</h2>
            {hasData && data.fertilizerBreakdown?.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.fertilizerBreakdown} dataKey="value"
                      outerRadius={80} innerRadius={40} paddingAngle={3}>
                      {data.fertilizerBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full sm:w-auto space-y-3 sm:flex-1">
                  {data.fertilizerBreakdown.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">{d.name}</span>
                          <span className="font-bold text-gray-800">{d.value}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full">
                          <div className="h-1.5 rounded-full" style={{ width: `${d.value}%`, backgroundColor: COLORS[i] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Breakdown calculated from your uploaded reports" />
            )}
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

          {/* Moisture trend */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <h2 className="text-sm font-bold text-green-900 mb-4">Moisture Trend (My Reports)</h2>
            {hasData && data.nitrogenTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.nitrogenTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="moisture" fill="#0891b2" radius={[5, 5, 0, 0]} name="Moisture %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Moisture data from your soil reports" />
            )}
          </div>

          {/* Yield progression */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <h2 className="text-sm font-bold text-green-900 mb-4">Yield Progression (My Reports)</h2>
            {hasData && data.yieldTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.yieldTrend}>
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
              <EmptyState message="Yield progression estimated from your N-dose recommendations" />
            )}
          </div>
        </div>

        {/* INSIGHT CARDS — from real data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {hasData ? [
            {
              title: data.averageNitrogen < 20 ? "⚠️ Low Nitrogen Detected" : "✅ Nitrogen Status",
              desc:  data.averageNitrogen < 20
                ? `Average nitrogen across your reports is ${data.averageNitrogen} kg/ha — below optimal. Apply recommended dose promptly.`
                : `Your average soil nitrogen is ${data.averageNitrogen} kg/ha — within a healthy range for your crop.`,
              color: data.averageNitrogen < 20 ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100",
              tc:    data.averageNitrogen < 20 ? "text-orange-700" : "text-green-700",
            },
            {
              title: "📊 Report Summary",
              desc:  `You have uploaded ${data.totalReports} soil report${data.totalReports !== 1 ? "s" : ""}. Average recommended nitrogen dose: ${data.averageDose} kg/ha. Average soil health score: ${data.averageHealth}/100.`,
              color: "bg-blue-50 border-blue-100",
              tc:    "text-blue-700",
            },
            {
              title: data.averageMoisture < 30 ? "💧 Irrigation Needed" : data.averageMoisture > 75 ? "⚠️ High Moisture" : "✅ Moisture Status",
              desc:  data.averageMoisture < 30
                ? `Average moisture ${data.averageMoisture}% is low. Irrigate before fertilizer application for best nutrient uptake.`
                : data.averageMoisture > 75
                ? `Average moisture ${data.averageMoisture}% is high. Delay fertilizer to avoid denitrification loss.`
                : `Average soil moisture ${data.averageMoisture}% is optimal across your reports.`,
              color: data.averageMoisture < 30 || data.averageMoisture > 75 ? "bg-orange-50 border-orange-100" : "bg-cyan-50 border-cyan-100",
              tc:    data.averageMoisture < 30 || data.averageMoisture > 75 ? "text-orange-700" : "text-cyan-700",
            },
          ].map((c, i) => (
            <div key={i} className={`${c.color} border rounded-2xl p-4`}>
              <h3 className={`text-sm font-bold ${c.tc} mb-2`}>{c.title}</h3>
              <p className="text-xs text-gray-500 leading-5">{c.desc}</p>
            </div>
          )) : [
            { title: "📤 Upload Your First Report",  desc: "All analytics here are based on your own soil reports. Upload a PDF to get started.", color: "bg-green-50 border-green-100", tc: "text-green-700" },
            { title: "🔬 AI Will Analyse Your Data",  desc: "OCR extracts N, P, K, Moisture. ML models predict optimal fertilizer dose. Everything personalised.", color: "bg-blue-50 border-blue-100", tc: "text-blue-700" },
            { title: "📈 Track Over Time",            desc: "Each report adds a data point to your trends. The more reports, the smarter your analytics become.", color: "bg-purple-50 border-purple-100", tc: "text-purple-700" },
          ].map((c, i) => (
            <div key={i} className={`${c.color} border rounded-2xl p-4`}>
              <h3 className={`text-sm font-bold ${c.tc} mb-2`}>{c.title}</h3>
              <p className="text-xs text-gray-500 leading-5">{c.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
