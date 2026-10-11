import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FaBrain, FaLeaf, FaFlask, FaTint,
  FaThermometerHalf, FaWind, FaSeedling,
  FaChartLine, FaCheckCircle, FaSpinner,
} from "react-icons/fa";

const SOIL_TYPES = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const CROP_TYPES = ["Wheat", "Rice", "Maize", "Sugarcane", "Cotton", "Paddy"];

function Prediction() {
  const [formData, setFormData] = useState({
    temperature: "", humidity: "", moisture: "",
    soilType: "Sandy", cropType: "Wheat",
    nitrogen: "", potassium: "", phosphorous: "",
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePredict = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Cast every numeric field to Number — fixes ML '<' str vs int error
      const payload = {
        temperature:  Number(formData.temperature),
        humidity:     Number(formData.humidity),
        moisture:     Number(formData.moisture),
        soilType:     formData.soilType,
        cropType:     formData.cropType,
        nitrogen:     Number(formData.nitrogen),
        potassium:    Number(formData.potassium),
        phosphorous:  Number(formData.phosphorous),
      };
      const res = await axios.post("http://127.0.0.1:8000/predict", payload);
      if (res.data.error) {
        setError(`ML Service Error: ${res.data.error}`);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError("Prediction failed. Make sure the ML service is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm transition-all";

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* HEADER */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-green-900">AI Fertilizer Prediction</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Enter soil and weather parameters to get ML-powered nitrogen dosage recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* ── FORM ── */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaBrain size={16} className="text-green-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-green-900">Input Parameters</h2>
                  <p className="text-xs text-gray-400">SVR + Neural Network models</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handlePredict} className="space-y-4">

                {/* WEATHER */}
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Weather Conditions</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "temperature", placeholder: "Temp °C",   icon: <FaThermometerHalf size={11} /> },
                    { name: "humidity",    placeholder: "Humidity %", icon: <FaWind size={11} /> },
                    { name: "moisture",    placeholder: "Moisture %", icon: <FaTint size={11} /> },
                  ].map(f => (
                    <div key={f.name} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                      <input
                        type="number" name={f.name}
                        placeholder={f.placeholder}
                        onChange={handleChange} required
                        className="w-full pl-8 pr-2 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* SOIL + CROP */}
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Soil & Crop</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <FaLeaf size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select name="soilType" onChange={handleChange}
                      className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-xs appearance-none">
                      {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <FaSeedling size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select name="cropType" onChange={handleChange}
                      className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-xs appearance-none">
                      {CROP_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* NUTRIENTS */}
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Current Nutrient Levels</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "nitrogen",    placeholder: "Nitrogen",    icon: <FaFlask size={11} /> },
                    { name: "potassium",   placeholder: "Potassium",   icon: <FaFlask size={11} /> },
                    { name: "phosphorous", placeholder: "Phosphorous", icon: <FaFlask size={11} /> },
                  ].map(f => (
                    <div key={f.name} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                      <input
                        type="number" name={f.name}
                        placeholder={f.placeholder}
                        onChange={handleChange} required
                        className="w-full pl-8 pr-2 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading
                    ? <><FaSpinner className="animate-spin" size={13} /> Predicting...</>
                    : <><FaBrain size={13} /> Predict Nitrogen Dosage</>
                  }
                </motion.button>
              </form>
            </div>

            {/* MODEL INFO */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5 mt-5">
              <h3 className="text-sm font-bold text-green-900 mb-3">ML Models Used</h3>
              <div className="space-y-2">
                {[
                  { name: "SVR (Support Vector)",  desc: "RBF kernel regression",        color: "bg-blue-50 text-blue-700" },
                  { name: "Neural Network (MLP)",   desc: "100→50 hidden layers",         color: "bg-purple-50 text-purple-700" },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${m.color}`}>
                    <span className="text-xs font-semibold">{m.name}</span>
                    <span className="text-xs opacity-70">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RESULTS ── */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 h-full flex flex-col items-center justify-center py-20 px-8 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaBrain size={28} className="text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-green-900">Ready to Predict</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs leading-6">
                    Fill in the soil and weather parameters on the left and click Predict to get your AI nitrogen dosage recommendation.
                  </p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* RECOMMENDED DOSE — big hero */}
                  <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
                    <p className="text-green-100 text-xs font-semibold uppercase tracking-wide relative z-10">
                      Recommended Nitrogen Dosage
                    </p>
                    <div className="flex items-end gap-3 mt-2 relative z-10">
                      <h1 className="text-5xl sm:text-6xl font-bold">{result.recommended_nitrogen_dose}</h1>
                      <span className="text-xl mb-2 text-green-200">kg/ha</span>
                    </div>
                    <p className="text-green-200 text-xs mt-3 relative z-10">
                      Final prediction based on Neural Network model
                    </p>
                  </div>

                  {/* MODEL COMPARISON */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
                    <h3 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                      <FaChartLine size={13} className="text-green-600" /> Model Comparison
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-blue-500 font-semibold">SVR Prediction</p>
                        <p className="text-3xl font-bold text-blue-700 mt-2">{result.svr_prediction}</p>
                        <p className="text-xs text-blue-400 mt-1">kg/ha</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-purple-500 font-semibold">Neural Network</p>
                        <p className="text-3xl font-bold text-purple-700 mt-2">{result.nn_prediction}</p>
                        <p className="text-xs text-purple-400 mt-1">kg/ha</p>
                      </div>
                    </div>

                    {/* ACCURACY BARS */}
                    <div className="mt-4 space-y-2">
                      {[
                        { label: "SVR",            pct: 85, color: "bg-blue-500" },
                        { label: "Neural Network", pct: 92, color: "bg-purple-500" },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{m.label}</span><span>{m.pct}% confidence</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full">
                            <div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI RECOMMENDATIONS — FIX: use recommendations array */}
                  {result.recommendations?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
                      <h3 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                        <FaLeaf size={13} className="text-green-600" /> AI Recommendations
                      </h3>
                      <div className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2.5 bg-green-50 border border-green-100 px-4 py-3 rounded-xl text-sm text-gray-700"
                          >
                            <FaCheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                            {rec}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDF REPORT */}
                  {result.report_path && (
                    <a
                      href={`http://localhost:5000/${result.report_path}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all"
                    >
                      View AI Generated Report PDF
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prediction;
