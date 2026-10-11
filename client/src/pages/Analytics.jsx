import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";
import {
  LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import {
  FaLeaf, FaChartLine, FaTint, FaSeedling,
  FaCloudRain, FaFlask,
} from "react-icons/fa";

const FERTILIZER_DATA = [
  { name: "Nitrogen",    value: 45 },
  { name: "Phosphorous", value: 30 },
  { name: "Potassium",   value: 25 },
];
const COLORS = ["#16a34a", "#2563eb", "#f59e0b"];

const RAINFALL_DATA = [
  { month: "Jan", rainfall: 20 },
  { month: "Feb", rainfall: 35 },
  { month: "Mar", rainfall: 60 },
  { month: "Apr", rainfall: 80 },
  { month: "May", rainfall: 120 },
  { month: "Jun", rainfall: 95 },
];

const YIELD_DATA = [
  { month: "Jan", actual: 40, forecast: 45 },
  { month: "Feb", actual: 55, forecast: 58 },
  { month: "Mar", actual: 70, forecast: 72 },
  { month: "Apr", actual: 65, forecast: 68 },
  { month: "May", actual: 90, forecast: 92 },
  { month: "Jun", actual: 85, forecast: 88 },
];

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reports/analytics/${farmer._id}`);
      setAnalytics(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Soil Health",    value: `${analytics?.averageHealth || 0}%`, color: "from-green-700 to-green-500",   icon: <FaLeaf size={18} /> },
    { label: "Yield Growth",   value: "63%",                               color: "from-blue-700 to-blue-500",    icon: <FaChartLine size={18} /> },
    { label: "Moisture",       value: "68%",                               color: "from-cyan-700 to-cyan-500",    icon: <FaTint size={18} /> },
    { label: "Crop Quality",   value: "91%",                               color: "from-orange-600 to-yellow-500",icon: <FaSeedling size={18} /> },
    { label: "Total Reports",  value: analytics?.totalReports || 0,        color: "from-purple-700 to-purple-500",icon: <FaChartLine size={18} /> },
  ];

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-800 to-emerald-600 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden mb-5"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10" />
          <h1 className="text-2xl font-bold relative z-10">Advanced Analytics 📈</h1>
          <p className="mt-1 text-sm text-green-100 relative z-10">
            AI-powered soil analytics, crop performance, and smart farming insights
          </p>
        </motion.div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className={`bg-gradient-to-br ${s.color} p-4 rounded-2xl text-white shadow-lg`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs">{s.label}</p>
                  <h2 className="text-2xl font-bold mt-1.5">{s.value}</h2>
                </div>
                <div className="text-white/70">{s.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROW 1 CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

          {/* AI PREDICTION TREND */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-green-900">AI Prediction Trend</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                From your reports
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : analytics?.nitrogenTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.nitrogenTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="nitrogen"   stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Nitrogen" />
                  <Line type="monotone" dataKey="prediction" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Prediction" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <FaFlask size={32} className="mb-3" />
                <p className="text-sm">Upload reports to see prediction trends</p>
              </div>
            )}
          </div>

          {/* FERTILIZER PIE */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <h2 className="text-base font-bold text-green-900 mb-4">Fertilizer Usage Breakdown</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={FERTILIZER_DATA} dataKey="value" outerRadius={85} innerRadius={45} paddingAngle={3}>
                    {FERTILIZER_DATA.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full sm:w-auto space-y-3 sm:flex-1">
                {FERTILIZER_DATA.map((d, i) => (
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
          </div>
        </div>

        {/* ROW 2 CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

          {/* RAINFALL */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaCloudRain size={14} className="text-blue-500" />
              <h2 className="text-base font-bold text-green-900">Rainfall Analysis</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={RAINFALL_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rainfall" fill="#2563eb" radius={[6, 6, 0, 0]} name="Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* YIELD ACTUAL vs FORECAST */}
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine size={14} className="text-green-600" />
              <h2 className="text-base font-bold text-green-900">Yield: Actual vs Forecast</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={YIELD_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="forecast" stroke="#16a34a" fill="#bbf7d0" strokeWidth={2} name="Forecast" fillOpacity={0.5} />
                <Area type="monotone" dataKey="actual"   stroke="#2563eb" fill="#bfdbfe" strokeWidth={2} name="Actual"   fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INSIGHTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Soil Health Improving",      desc: "AI detected stable nutrient growth across uploaded reports.",              color: "bg-green-50 border-green-100",  tc: "text-green-700" },
            { title: "AI Prediction Tracking",     desc: "ML predictions are dynamically generated from real uploaded soil reports.", color: "bg-blue-50 border-blue-100",    tc: "text-blue-700" },
            { title: "Fertilizer Optimization",    desc: "Smart recommendations reduce fertilizer overuse and improve crop yield.",   color: "bg-orange-50 border-orange-100",tc: "text-orange-700" },
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

export default Analytics;
