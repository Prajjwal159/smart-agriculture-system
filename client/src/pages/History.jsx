import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../api";
import {
  FaFilePdf, FaDownload, FaEye, FaLeaf,
  FaFlask, FaTint, FaSeedling, FaSearch,
  FaSort, FaCheckCircle, FaTrashAlt, FaTimes,
  FaExclamationTriangle, FaShoppingCart,
} from "react-icons/fa";

/* ── double-confirm modal ── */
function ConfirmModal({ count, onConfirm, onCancel }) {
  const [step, setStep] = useState(1);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center">
          {step === 1 ? "Clear All Reports?" : "Are you absolutely sure?"}
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2 leading-6">
          {step === 1
            ? `This will permanently delete all ${count} soil report(s) and their AI analysis.`
            : "This action cannot be undone. All your farming history will be lost."}
        </p>
        {step === 1 ? (
          <div className="flex gap-3 mt-6">
            <button onClick={onCancel}      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={() => setStep(2)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Yes, Continue</button>
          </div>
        ) : (
          <div className="flex gap-3 mt-6">
            <button onClick={onCancel}   className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">No, Cancel</button>
            <button onClick={onConfirm}  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold">Yes, Delete All</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function History() {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [sortOrder, setSortOrder]     = useState("newest");
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearMsg, setClearMsg]       = useState("");

  const farmer   = JSON.parse(localStorage.getItem("farmer"));
  const navigate = useNavigate();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/reports`);
      const filtered = res.data.filter(r => String(r.farmerId) === String(farmer._id));
      setReports(filtered);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_BASE}/api/reports/delete-all/${farmer._id}`);
      setReports([]);
      setClearMsg("✅ All reports cleared successfully.");
      setTimeout(() => setClearMsg(""), 3000);
    } catch {
      setClearMsg("Failed to clear reports.");
    } finally {
      setShowConfirm(false);
    }
  };

  // Strict search — only reports whose name contains the term
  const displayed = reports
    .filter(r =>
      search.trim() === ""
        ? true
        : (r.reportName || "").toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const getHealthColor = (score) => {
    if (score >= 60) return "text-green-600 bg-green-50";
    if (score >= 40) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      {showConfirm && (
        <ConfirmModal
          count={reports.length}
          onConfirm={handleClearAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Prediction History</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              All your uploaded soil reports and AI analysis results
            </p>
          </div>

          {/* SEARCH + SORT + CLEAR ALL */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-green-300 w-40 sm:w-48"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={11} />
                </button>
              )}
            </div>

            <button
              onClick={() => setSortOrder(s => s === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all"
            >
              <FaSort size={12} />
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </button>

            {reports.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <FaTrashAlt size={11} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* CLEAR MESSAGE */}
        {clearMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
            clearMsg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {clearMsg}
          </div>
        )}

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            {
              label: "Total Reports",
              value: reports.length,
              color: "from-green-700 to-green-500",
              icon:  <FaFilePdf size={18} />,
            },
            {
              label: "Avg Nitrogen",
              value: reports.length
                ? Math.round(reports.reduce((s, r) => s + (r.nitrogen || 0), 0) / reports.length)
                : 0,
              color: "from-blue-700 to-blue-500",
              icon:  <FaFlask size={18} />,
            },
            {
              label: "Avg Moisture",
              value: reports.length
                ? Math.round(reports.reduce((s, r) => s + (r.moisture || 0), 0) / reports.length)
                : 0,
              color: "from-cyan-700 to-cyan-500",
              icon:  <FaTint size={18} />,
            },
            {
              label: "Avg Rec Dose",
              value: reports.length
                ? Math.round(reports.reduce((s, r) => s + (r.recommendedNitrogenDose || 0), 0) / reports.length)
                : 0,
              color: "from-orange-600 to-yellow-500",
              icon:  <FaSeedling size={18} />,
            },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} text-white p-4 rounded-2xl shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs">{s.label}</p>
                  <h2 className="text-3xl font-bold mt-1">{s.value}</h2>
                </div>
                <div className="text-white/80">{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && displayed.length === 0 && (
          <div className="bg-white rounded-2xl shadow border border-gray-50 p-14 text-center">
            <FaFilePdf size={40} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-green-900">
              {search ? "No reports match your search" : "No Reports Uploaded Yet"}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {search
                ? "Try a different keyword."
                : "Upload your first soil report to begin AI analysis."}
            </p>
            {!search && (
              <a
                href="/upload"
                className="mt-5 inline-block bg-gradient-to-r from-green-700 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow hover:opacity-90 transition-all"
              >
                Upload Report
              </a>
            )}
          </div>
        )}

        {/* REPORT CARDS */}
        {!loading && displayed.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {displayed.map((report, i) => {
              const healthScore = Math.round(
                ((report.nitrogen     || 0) +
                 (report.phosphorous  || 0) +
                 (report.potassium    || 0) +
                 (report.moisture     || 0)) / 4
              );
              const hc = getHealthColor(healthScore);

              return (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 p-5 hover:shadow-lg transition-all"
                >
                  {/* TOP ROW */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <FaFilePdf size={18} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate max-w-[180px]">
                          {report.reportName || "Soil Report"}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(report.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 ${hc}`}>
                      Score: {healthScore}
                    </span>
                  </div>

                  {/* NUTRIENT GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "N",   value: report.nitrogen,    unit: "",   color: "bg-green-50  text-green-700"  },
                      { label: "P",   value: report.phosphorous, unit: "",   color: "bg-blue-50   text-blue-700"   },
                      { label: "K",   value: report.potassium,   unit: "",   color: "bg-orange-50 text-orange-600" },
                      { label: "M%",  value: report.moisture,    unit: "%",  color: "bg-cyan-50   text-cyan-700"   },
                    ].map((n, j) => (
                      <div key={j} className={`${n.color} rounded-xl p-2.5 text-center`}>
                        <p className="text-xs opacity-70 font-medium">{n.label}</p>
                        <p className="text-base font-bold mt-0.5">{n.value ?? "—"}{n.unit}</p>
                      </div>
                    ))}
                  </div>

                  {/* RECOMMENDED DOSE BANNER */}
                  <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white rounded-xl px-4 py-3 flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-green-100">Recommended Nitrogen Dose</p>
                      <p className="text-xl font-bold mt-0.5">
                        {report.recommendedNitrogenDose ?? "—"}
                        <span className="text-sm font-normal ml-1">kg/ha</span>
                      </p>
                    </div>
                    <FaLeaf size={20} className="text-white/70" />
                  </div>

                  {/* AI RECOMMENDATIONS (collapsed, scrollable) */}
                  {report.recommendations?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-green-900 mb-2">AI Recommendations</p>
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {report.recommendations.map((rec, k) => (
                          <div key={k} className="flex items-start gap-2 text-xs text-gray-600 bg-green-50 px-3 py-2 rounded-xl">
                            <FaCheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── ACTION BUTTONS ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                    {/* View AI report PDF */}
                    <a
                      href={`${API_BASE}/${report.generatedReport}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <FaEye size={11} /> View Report
                    </a>

                    {/* Download PDF */}
                    <a
                      href={`${API_BASE}/${report.generatedReport}`}
                      download
                      className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <FaDownload size={11} /> Download
                    </a>

                    {/* Buy Fertilizers → redirects to /fertilizer-advisor */}
                    <button
                      onClick={() => navigate("/fertilizer-advisor")}
                      className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                    >
                      <FaShoppingCart size={11} /> Buy Fertilizer
                    </button>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
