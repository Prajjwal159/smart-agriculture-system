import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API_BASE } from "../api";
import { FaFilePdf, FaCheckCircle } from "react-icons/fa";

export default function LiveActivityFeed() {
  const farmer   = JSON.parse(localStorage.getItem("farmer")) || {};
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmer._id) { setLoading(false); return; }
    axios.get(`${API_BASE}/api/reports`)
      .then(r => {
        const mine = r.data
          .filter(rep => String(rep.farmerId) === String(farmer._id))
          .slice(0, 5);
        setReports(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [farmer._id]);

  // Build activity items from real reports
  const activities = reports.map(r => ({
    title:       r.reportName || "Soil Report",
    description: `N: ${r.nitrogen ?? "—"} kg/ha · Rec Dose: ${r.recommendedNitrogenDose ?? "—"} kg/ha`,
    time:        new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    icon:        "📄",
    color:       "bg-green-100",
    link:        r.generatedReport ? `${API_BASE}/${r.generatedReport}` : null,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow border border-green-50 p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-sm font-bold text-green-900">Recent Uploads</h1>
          <p className="text-gray-400 text-xs mt-0.5">Your latest soil reports</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-green-700 text-xs">LIVE</span>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-5 h-5 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-300 gap-2">
          <FaFilePdf size={28} />
          <p className="text-xs text-center leading-5">No reports yet.<br />Upload a soil PDF to get started.</p>
          <a href="/upload"
            className="mt-2 text-xs bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all">
            Upload Report
          </a>
        </div>
      ) : (
        <div className="space-y-2 max-h-[200px] sm:max-h-[260px] overflow-y-auto pr-1">
          {activities.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 3 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-gray-800 truncate">{item.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{item.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer"
                    className="text-xs text-green-700 hover:underline flex items-center gap-0.5">
                    <FaCheckCircle size={9} /> View
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
