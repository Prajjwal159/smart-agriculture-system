import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt, FaFilePdf, FaCheckCircle,
  FaSpinner, FaLeaf, FaTimes, FaHistory,
  FaSeedling,
} from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE, ML_BASE } from "../api";

function UploadReport() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [dragOver, setDragOver] = useState(false);

  const farmer   = JSON.parse(localStorage.getItem("farmer"));
  const navigate = useNavigate();

  // Build fertilizer-advisor URL with pre-filled values from analysis result
  const buildAdvisorUrl = (r) => {
    if (!r) return "/fertilizer-advisor";
    const farmer = JSON.parse(localStorage.getItem("farmer")) || {};
    const cropMap = {
      "Rice":"Rice","Paddy":"Paddy","Wheat":"Wheat","Sugarcane":"Sugarcane",
      "Cotton":"Cotton","Maize":"Maize","Millets":"Millets","Barley":"Barley",
      "Pulses":"Pulses","Oil seeds":"Oil seeds","Ground Nuts":"Ground Nuts","Tobacco":"Tobacco",
    };
    // Stage map — always pick the sowing/transplanting stage, never nursery/land prep
    const stageMap = {
      "Rice":"Transplanting","Paddy":"Transplanting","Wheat":"Sowing",
      "Maize":"Sowing","Cotton":"Sowing","Sugarcane":"Planting",
      "Millets":"Sowing","Barley":"Sowing","Pulses":"Sowing",
      "Ground Nuts":"Sowing","Oil seeds":"Sowing","Tobacco":"Transplanting",
    };
    const crop  = cropMap[farmer.cropType]  || "Wheat";
    const stage = stageMap[crop]            || "Sowing";
    const params = new URLSearchParams({
      crop:        crop,
      stage:       stage,
      nitrogen:    r.nitrogen    ?? 0,
      phosphorous: r.phosphorous ?? 0,
      potassium:   r.potassium   ?? 0,
      moisture:    r.moisture    ?? 0,
      farmSize:    farmer.farmSize || 1,
      fromUpload:  "true",
    });
    return `/fertilizer-advisor?${params.toString()}`;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else {
      setError("Only PDF files are accepted.");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setError(""); }
  };

  const removeFile = () => { setFile(null); setSuccess(false); setResult(null); };

  const uploadReport = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("farmerId", farmer._id);

      const response = await axios.post(
        `${API_BASE}/api/reports/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data.report);
      setSuccess(true);
    } catch (err) {
      setError("Upload failed. Make sure the ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Upload Soil Report</h1>
            <p className="text-gray-400 text-sm mt-0.5">Upload your soil PDF for AI analysis and nitrogen prediction</p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all shadow-sm"
          >
            <FaHistory size={13} />
            View History
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── LEFT: UPLOAD ZONE ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* DROP ZONE */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
              <h2 className="text-base font-bold text-green-900 mb-4">Select Soil Report PDF</h2>

              {!file ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                    ${dragOver ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-green-50/50"}`}
                >
                  <FaCloudUploadAlt size={44} className="text-green-400 mb-3" />
                  <p className="font-semibold text-gray-700 text-sm">Drag & drop your PDF here</p>
                  <p className="text-gray-400 text-xs mt-1">or click to browse files</p>
                  <span className="mt-4 bg-green-100 text-green-700 px-4 py-1.5 rounded-xl text-xs font-semibold">
                    Browse PDF
                  </span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="border border-green-200 bg-green-50 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <FaFilePdf size={22} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{file.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow transition-all"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* UPLOAD BUTTON */}
              <motion.button
                whileHover={{ scale: file && !loading ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={uploadReport}
                disabled={loading || !file}
                className="mt-5 w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    Analyzing Soil Report...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt size={14} />
                    Upload & Analyze
                  </>
                )}
              </motion.button>
            </div>

            {/* SUCCESS + RESULTS */}
            <AnimatePresence>
              {success && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow border border-green-100 p-6"
                >
                  {/* SUCCESS HEADER */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-green-900">Analysis Complete!</h2>
                      <p className="text-gray-400 text-xs">AI has processed your soil report</p>
                    </div>
                  </div>

                  {/* NUTRIENT GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Nitrogen",     value: result.nitrogen,    unit: "kg/ha", color: "green" },
                      { label: "Phosphorous",  value: result.phosphorous, unit: "kg/ha", color: "blue" },
                      { label: "Potassium",    value: result.potassium,   unit: "kg/ha", color: "orange" },
                      { label: "Moisture",     value: result.moisture,    unit: "%",     color: "cyan" },
                    ].map((n, i) => (
                      <div key={i} className={`bg-${n.color}-50 border border-${n.color}-100 p-3 rounded-xl`}>
                        <p className="text-gray-400 text-xs">{n.label}</p>
                        <p className={`text-xl font-bold text-${n.color}-700 mt-1`}>{n.value ?? "—"}</p>
                        <p className="text-gray-400 text-xs">{n.unit}</p>
                      </div>
                    ))}
                  </div>

                  {/* RECOMMENDED DOSE */}
                  <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white p-4 rounded-xl mb-4">
                    <p className="text-xs text-green-100">Recommended Nitrogen Dose</p>
                    <p className="text-3xl font-bold mt-1">
                      {result.recommendedNitrogenDose} <span className="text-base font-normal">kg/ha</span>
                    </p>
                  </div>

                  {/* RECOMMENDATIONS */}
                  {result.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-green-900 mb-3">AI Recommendations</p>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 bg-green-50 px-3 py-2.5 rounded-xl text-sm text-gray-700">
                            <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" size={12} />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="mt-5 flex flex-col gap-3">

                    {/* View AI PDF */}
                    {result.generatedReport && (
                      <a
                        href={`${API_BASE}/${result.generatedReport}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all"
                      >
                        <FaFilePdf size={14} />
                        View AI Generated Report
                      </a>
                    )}

                    {/* Get Fertilizer Plan — goes to advisor with values pre-filled */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(buildAdvisorUrl(result))}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
                    >
                      <FaSeedling size={14} />
                      Get Fertilizer Plan
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">
                        Values pre-filled ✓
                      </span>
                    </motion.button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: INFO PANEL ── */}
          <div className="space-y-5">

            {/* HOW IT WORKS */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h2 className="text-sm font-bold text-green-900 mb-4">How It Works</h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Upload PDF",        desc: "Upload your soil analysis report in PDF format.", color: "bg-green-100 text-green-700" },
                  { step: "2", title: "OCR Extraction",    desc: "AI extracts nitrogen, phosphorous, potassium & moisture values.", color: "bg-blue-100 text-blue-700" },
                  { step: "3", title: "ML Prediction",     desc: "SVR & Neural Network models predict optimal nitrogen dose.", color: "bg-purple-100 text-purple-700" },
                  { step: "4", title: "AI Report",         desc: "Downloadable PDF report with full analysis is generated.", color: "bg-orange-100 text-orange-700" },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIPS */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-500 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <FaLeaf size={16} />
                <h2 className="text-sm font-bold">Upload Tips</h2>
              </div>
              <ul className="space-y-2 text-xs text-green-100 leading-5">
                <li>✅ Use standard soil lab report PDFs</li>
                <li>✅ Ensure values like Nitrogen, Moisture are clearly mentioned</li>
                <li>✅ File size should be under 10 MB</li>
                <li>✅ Scanned PDFs work best when clearly readable</li>
              </ul>
            </div>

            {/* FARMER CONTEXT */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h2 className="text-sm font-bold text-green-900 mb-3">Your Farm Profile</h2>
              <div className="space-y-2.5">
                {[
                  { label: "Crop Type",  value: farmer?.cropType },
                  { label: "Farm Size",  value: `${farmer?.farmSize} Acres` },
                  { label: "District",   value: farmer?.district },
                  { label: "State",      value: farmer?.state },
                ].map((f, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{f.label}</span>
                    <span className="font-semibold text-gray-800">{f.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadReport;
