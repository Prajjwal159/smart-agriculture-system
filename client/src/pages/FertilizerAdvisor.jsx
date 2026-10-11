import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FaSeedling, FaFlask, FaLeaf, FaCheckCircle,
  FaExclamationTriangle, FaExternalLinkAlt, FaSpinner,
  FaRulerCombined, FaChevronRight, FaShoppingCart,
  FaInfoCircle, FaCalendarAlt, FaDollarSign, FaTint,
} from "react-icons/fa";
import { GiChemicalDrop, GiFertilizerBag } from "react-icons/gi";

// ── Constants matching backend ──────────────────────────────────────────────
const CROPS = [
  "Wheat", "Paddy", "Rice", "Maize", "Cotton",
  "Sugarcane", "Millets", "Barley", "Pulses",
  "Ground Nuts", "Oil seeds", "Tobacco",
];

const SOIL_TYPES = ["Loamy", "Sandy", "Black", "Red", "Clayey"];

const CROP_STAGES = {
  Wheat:        ["Land Preparation", "Sowing", "Tillering (21 days)", "Jointing (42 days)", "Heading"],
  Paddy:        ["Nursery", "Transplanting", "Tillering (15 days)", "Panicle Initiation", "Grain Filling"],
  Rice:         ["Nursery", "Transplanting", "Tillering (15 days)", "Panicle Initiation", "Grain Filling"],
  Maize:        ["Land Preparation", "Sowing", "Knee-High (30 days)", "Tasselling (55 days)", "Grain Filling"],
  Cotton:       ["Land Preparation", "Sowing", "Squaring (30 days)", "Flowering (60 days)", "Boll Formation (90 days)"],
  Sugarcane:    ["Land Preparation", "Planting", "45 Days", "90 Days", "Grand Growth (5-9 months)"],
  Millets:      ["Land Preparation", "Sowing", "Tillering (25 days)", "Panicle Emergence"],
  Barley:       ["Land Preparation", "Sowing", "Tillering (21 days)", "Jointing (40 days)"],
  Pulses:       ["Land Preparation", "Sowing", "Flowering (35 days)", "Pod Development"],
  "Ground Nuts":["Land Preparation", "Sowing", "Flowering (30 days)", "Pegging (40 days)", "Pod Development"],
  "Oil seeds":  ["Land Preparation", "Sowing", "Branching (25 days)", "Flowering (45 days)"],
  Tobacco:      ["Nursery", "Transplanting", "3 Weeks After Transplant", "6 Weeks After Transplant"],
};

// ── Stages that actually apply fertilizer (skip prep/nursery stages) ─────
// These are stages where N/P/K fraction > 0 in the backend ADVISORY_DB
const FERTILIZER_STAGES = {
  Wheat:         "Sowing",
  Paddy:         "Transplanting",
  Rice:          "Transplanting",
  Maize:         "Sowing",
  Cotton:        "Sowing",
  Sugarcane:     "Planting",
  Millets:       "Sowing",
  Barley:        "Sowing",
  Pulses:        "Sowing",
  "Ground Nuts": "Sowing",
  "Oil seeds":   "Sowing",
  Tobacco:       "Transplanting",
};

// Returns the best default stage for a crop — always one that applies fertilizer
function getBestStage(crop) {
  return FERTILIZER_STAGES[crop]
    || (CROP_STAGES[crop] || CROP_STAGES["Wheat"])[1]   // fallback: second stage
    || (CROP_STAGES[crop] || CROP_STAGES["Wheat"])[0];  // last resort: first stage
}

// ── Nutrient badge ──────────────────────────────────────────────────────────
function NutrientBadge({ label, value, unit = "kg/ha", color }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <p className="text-xs opacity-70 font-semibold">{label}</p>
      <p className="text-xl font-bold mt-1">{value ?? 0}</p>
      <p className="text-xs opacity-60">{unit}</p>
    </div>
  );
}

// ── Step indicator ──────────────────────────────────────────────────────────
function StepBadge({ num, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all
      ${active ? "bg-green-700 text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
        ${active ? "bg-white text-green-700" : done ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}>
        {done ? "✓" : num}
      </div>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── pH status pill ──────────────────────────────────────────────────────────
function PHPill({ status }) {
  const map = {
    OPTIMAL:     { cls: "bg-green-100 text-green-700", label: "✅ Optimal" },
    TOO_ACIDIC:  { cls: "bg-red-100 text-red-700",     label: "⚠️ Too Acidic" },
    TOO_ALKALINE:{ cls: "bg-orange-100 text-orange-700",label: "⚠️ Too Alkaline" },
  };
  const m = map[status] || map.OPTIMAL;
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.cls}`}>{m.label}</span>;
}

export default function FertilizerAdvisor() {
  const farmer       = JSON.parse(localStorage.getItem("farmer")) || {};
  const [searchParams] = useSearchParams();

  // Check if we were redirected from Upload Report with pre-filled values
  const fromUpload  = searchParams.get("fromUpload") === "true";
  const urlCrop     = searchParams.get("crop")        || farmer.cropType || "Wheat";
  const urlN        = searchParams.get("nitrogen")    || "";
  const urlP        = searchParams.get("phosphorous") || "";
  const urlK        = searchParams.get("potassium")   || "";
  const urlM        = searchParams.get("moisture")    || "";
  const urlFarmSize = searchParams.get("farmSize")    || farmer.farmSize || "1";
  const urlStage    = searchParams.get("stage")       || null;   // stage passed from upload

  const CROP_MAP = {
    "Rice":"Rice","Paddy":"Paddy","Wheat":"Wheat","Sugarcane":"Sugarcane",
    "Cotton":"Cotton","Maize":"Maize","Millets":"Millets","Barley":"Barley",
    "Pulses":"Pulses","Oil seeds":"Oil seeds","Ground Nuts":"Ground Nuts","Tobacco":"Tobacco",
  };
  const resolvedCrop  = CROP_MAP[urlCrop] || "Wheat";
  // Use stage from URL if provided, otherwise use smart default
  const resolvedStage = urlStage || getBestStage(resolvedCrop);

  // ── form state — default stage is always a fertilizer-applying stage ──
  const [form, setForm] = useState({
    crop:        resolvedCrop,
    stage:       resolvedStage,   // FIXED: from URL or smart default, never "Nursery"
    soilType:    "Loamy",
    pH:          "6.5",
    nitrogen:    urlN,
    phosphorous: urlP,
    potassium:   urlK,
    farmSize:    String(urlFarmSize),
  });

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [activeStep, setActiveStep] = useState(0);

  // If redirected from upload with values, auto-submit on first render
  useEffect(() => {
    if (fromUpload && urlN) {
      const timer = setTimeout(() => {
        handleSubmitWithValues({
          crop:        resolvedCrop,
          stage:       resolvedStage,   // FIXED: always real fertilizer stage
          soilType:    "Loamy",
          pH:          6.5,
          nitrogen:    Number(urlN)        || 0,
          phosphorous: Number(urlP)        || 0,
          potassium:   Number(urlK)        || 0,
          farmSize:    Number(urlFarmSize) || 1,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // shared submit logic used both by the form and the auto-submit
  const handleSubmitWithValues = async (values) => {
    setError("");
    setLoading(true);
    setResult(null);
    setActiveStep(0);
    try {
      const res = await axios.post("http://127.0.0.1:8000/fertilizer-advisor", values);
      if (res.data.error) {
        setError(`Service Error: ${res.data.error}`);
      } else {
        setResult(res.data);
        setActiveStep(1);
      }
    } catch {
      setError("Advisory service failed. Make sure the ML service is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === "crop") {
      updated.stage = getBestStage(e.target.value);  // FIXED: smart default
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitWithValues({
      crop:        form.crop,
      stage:       form.stage,
      soilType:    form.soilType,
      pH:          Number(form.pH),
      nitrogen:    Number(form.nitrogen)    || 0,
      phosphorous: Number(form.phosphorous) || 0,
      potassium:   Number(form.potassium)   || 0,
      farmSize:    Number(form.farmSize)    || 1,
    });
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm transition-all";

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        {/* ── PAGE HEADER ── */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-2xl flex items-center justify-center shadow">
              <FaSeedling size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900">Fertilizer Advisory Engine</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                5-step professional crop nutrition planner based on ICAR agronomic guidelines
              </p>
            </div>
          </div>
        </div>

        {/* ── STEP PROGRESS BAR ── */}
        {result && (
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {[
              "Crop & Stage",
              "Soil Test",
              "Recommendation",
              "Product Plan",
              "Buy Fertilizer",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <StepBadge
                  num={i + 1}
                  label={label}
                  active={activeStep === i + 1}
                  done={activeStep > i + 1}
                />
                {i < 4 && <FaChevronRight size={10} className="text-gray-300 shrink-0" />}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ══════════════════════════════════════════
              LEFT — INPUT FORM
          ══════════════════════════════════════════ */}
          <div className="xl:col-span-1 space-y-4">

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow border border-gray-50 p-5 space-y-4">

              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FaFlask size={14} className="text-green-700" />
                <h2 className="text-sm font-bold text-green-900">Field Parameters</h2>
              </div>

              {/* PRE-FILLED BANNER — shown when redirected from Upload Report */}
              {fromUpload && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <FaCheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-orange-800">Values pre-filled from your soil report</p>
                    <p className="text-xs text-orange-600 mt-0.5 leading-5">
                      N: <b>{urlN}</b> · P: <b>{urlP}</b> · K: <b>{urlK}</b> kg/ha · Moisture: <b>{urlM}%</b> · Crop: <b>{resolvedCrop}</b> · Stage: <b>{resolvedStage}</b>.
                      You can adjust the stage or soil type below if needed.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              {/* CROP */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Crop Type</label>
                <div className="relative">
                  <FaSeedling size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="crop" value={form.crop} onChange={handleChange} className={`${inputCls} pl-8 appearance-none`}>
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* GROWTH STAGE */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Growth Stage</label>
                <div className="relative">
                  <FaCalendarAlt size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="stage" value={form.stage} onChange={handleChange} className={`${inputCls} pl-8 appearance-none`}>
                    {(CROP_STAGES[form.crop] || CROP_STAGES["Wheat"]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SOIL TYPE */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Soil Type</label>
                <div className="relative">
                  <FaLeaf size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="soilType" value={form.soilType} onChange={handleChange} className={`${inputCls} pl-8 appearance-none`}>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* SOIL pH */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Soil pH <span className="text-gray-400 font-normal">(from soil test report)</span>
                </label>
                <div className="relative">
                  <GiChemicalDrop size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number" step="0.1" min="4" max="9"
                    name="pH" value={form.pH} onChange={handleChange}
                    placeholder="e.g. 6.5"
                    className={`${inputCls} pl-8`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Normal range: 6.0–7.5 for most crops</p>
              </div>

              {/* NUTRIENTS */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Available Nutrients in Soil <span className="text-gray-400 font-normal">(kg/ha, from soil test)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "nitrogen",    label: "N" },
                    { name: "phosphorous", label: "P" },
                    { name: "potassium",   label: "K" },
                  ].map(f => (
                    <div key={f.name} className="relative">
                      <input
                        type="number" min="0" name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        placeholder={f.label}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm text-center transition-all"
                      />
                      <span className="absolute -top-1.5 left-2 bg-white px-1 text-xs font-bold text-green-700">
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave blank if not tested — system will assume 0</p>
              </div>

              {/* FARM SIZE */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Farm Size (Acres)</label>
                <div className="relative">
                  <FaRulerCombined size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number" min="0.1" step="0.1"
                    name="farmSize" value={form.farmSize}
                    onChange={handleChange} placeholder="e.g. 2.5"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><FaSpinner className="animate-spin" size={13} />Generating Advisory...</>
                  : <><FaSeedling size={13} />Generate Fertilizer Plan</>
                }
              </motion.button>
            </form>

            {/* INFO CARD */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <FaInfoCircle size={14} />
                <h3 className="text-sm font-bold">Data Sources</h3>
              </div>
              <div className="space-y-2 text-xs text-green-100 leading-5">
                <p>📚 ICAR crop-wise fertilizer recommendations</p>
                <p>🌾 FAO crop nutrition guidelines</p>
                <p>🧪 Stage-wise N-P-K split schedules</p>
                <p>💰 Govt. MRP prices (2024)</p>
                <p>🏪 Live links to 5 Indian agri stores</p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT — RESULTS (5 STEPS)
          ══════════════════════════════════════════ */}
          <div className="xl:col-span-2">

            {/* EMPTY STATE */}
            {!result && !loading && (
              <div className="bg-white rounded-2xl shadow border border-gray-50 flex flex-col items-center justify-center py-20 px-8 text-center h-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <GiFertilizerBag size={36} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-green-900">Ready to Advise</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-sm leading-6">
                  Fill in your crop, growth stage, soil test values and farm size on the left.
                  The engine will generate a complete 5-step professional fertilizer plan with real product recommendations and buy links.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 w-full max-w-md">
                  {[
                    { icon: "🌱", label: "Crop & Stage" },
                    { icon: "🧪", label: "Soil Analysis" },
                    { icon: "📋", label: "ICAR Guidelines" },
                    { icon: "🧴", label: "Product Plan" },
                    { icon: "💰", label: "Cost Estimate" },
                    { icon: "🛒", label: "Buy Links" },
                  ].map((f, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-xl mb-1">{f.icon}</p>
                      <p className="text-xs font-semibold text-green-800">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS */}
            {result && (
              <div className="space-y-5">

                {/* ── STEP 1: CROP & GROWTH STAGE ──────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer bg-green-50 border-b border-green-100"
                    onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <h2 className="text-sm font-bold text-green-900">Crop & Growth Stage Identification</h2>
                    </div>
                    <FaCheckCircle size={16} className="text-green-600" />
                  </div>

                  <AnimatePresence>
                    {activeStep >= 1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            <div className="bg-green-50 border border-green-100 p-3 rounded-xl">
                              <p className="text-xs text-gray-400">Crop</p>
                              <p className="text-base font-bold text-green-800 mt-1">{result.crop}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                              <p className="text-xs text-gray-400">Current Stage</p>
                              <p className="text-sm font-bold text-blue-800 mt-1">{result.stage}</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
                              <p className="text-xs text-gray-400">Farm Size</p>
                              <p className="text-base font-bold text-orange-700 mt-1">
                                {result.farm_size_acres} ac / {result.farm_size_ha} ha
                              </p>
                            </div>
                          </div>

                          {/* Full season stage timeline */}
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Full Season Stage Timeline
                          </p>
                          <div className="flex items-start gap-0 overflow-x-auto pb-2">
                            {result.full_schedule.map((s, i) => (
                              <div key={i} className="flex flex-col items-center shrink-0 relative">
                                {/* connector line */}
                                {i < result.full_schedule.length - 1 && (
                                  <div className="absolute top-3.5 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
                                )}
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 relative
                                  ${s.current
                                    ? "bg-green-700 border-green-700 text-white"
                                    : "bg-white border-gray-300 text-gray-500"
                                  }`}>
                                  {i + 1}
                                </div>
                                <p className={`text-xs text-center mt-1.5 max-w-[80px] leading-4 font-medium
                                  ${s.current ? "text-green-700" : "text-gray-400"}`}>
                                  {s.stage}
                                </p>
                                {(s.N > 0 || s.P > 0 || s.K > 0) && (
                                  <p className="text-xs text-center text-gray-400 mt-1">
                                    {s.N > 0 && `N:${s.N} `}
                                    {s.P > 0 && `P:${s.P} `}
                                    {s.K > 0 && `K:${s.K}`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Current stage note */}
                          {result.stage_note && (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-900">
                              <span className="font-bold">Stage Note: </span>{result.stage_note}
                            </div>
                          )}

                          <button
                            onClick={() => setActiveStep(2)}
                            className="mt-4 flex items-center gap-2 text-xs text-green-700 font-semibold hover:underline"
                          >
                            Next: Soil Test Analysis <FaChevronRight size={10} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── STEP 2: SOIL TEST ────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer bg-blue-50 border-b border-blue-100"
                    onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <h2 className="text-sm font-bold text-blue-900">Soil Test Results & pH Analysis</h2>
                    </div>
                    <FaCheckCircle size={16} className="text-blue-600" />
                  </div>

                  <AnimatePresence>
                    {activeStep >= 2 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5">
                          {/* pH */}
                          <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-xs text-gray-500">Soil pH</p>
                              <p className="text-2xl font-bold text-gray-900 mt-0.5">{result.soil_ph}</p>
                            </div>
                            <PHPill status={result.ph_status} />
                          </div>

                          {result.ph_status !== "OPTIMAL" && (
                            <div className={`mb-4 rounded-xl px-4 py-3 text-sm border
                              ${result.ph_status === "TOO_ACIDIC"
                                ? "bg-red-50 border-red-200 text-red-800"
                                : "bg-orange-50 border-orange-200 text-orange-800"}`}>
                              <p className="font-bold mb-1">pH Correction Required</p>
                              <p className="leading-6">{result.ph_action}</p>
                              {result.ph_amendment && (
                                <p className="mt-2 font-semibold">
                                  Amendment: {result.ph_amendment}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Current soil nutrients */}
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Available Nutrients (Soil Test)
                          </p>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <NutrientBadge label="Nitrogen (N)"    value={result.soil_inputs.N} color="bg-green-50 text-green-700 border border-green-100" />
                            <NutrientBadge label="Phosphorous (P)" value={result.soil_inputs.P} color="bg-blue-50 text-blue-700 border border-blue-100" />
                            <NutrientBadge label="Potassium (K)"   value={result.soil_inputs.K} color="bg-orange-50 text-orange-700 border border-orange-100" />
                          </div>

                          {/* Soil credit */}
                          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-800">
                            <p className="font-bold mb-1">Soil Nutrient Credit Applied (50%)</p>
                            <p>
                              N credit: {result.soil_credit.N} kg/ha ·
                              P credit: {result.soil_credit.P} kg/ha ·
                              K credit: {result.soil_credit.K} kg/ha
                            </p>
                            <p className="mt-1 text-gray-500">
                              Existing soil nutrients reduce your fertilizer requirement. System applies 50% availability factor.
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveStep(3)}
                            className="mt-4 flex items-center gap-2 text-xs text-blue-700 font-semibold hover:underline"
                          >
                            Next: Authoritative Recommendation <FaChevronRight size={10} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── STEP 3: RECOMMENDATION ───────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer bg-purple-50 border-b border-purple-100"
                    onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <h2 className="text-sm font-bold text-purple-900">Authoritative Crop Recommendation</h2>
                    </div>
                    <FaCheckCircle size={16} className="text-purple-600" />
                  </div>

                  <AnimatePresence>
                    {activeStep >= 3 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5">
                          {/* Authority source */}
                          <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Authoritative Source</p>
                              <p className="text-sm font-bold text-purple-900 mt-0.5">{result.authority}</p>
                            </div>
                            <a
                              href={result.authority_url}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-xl font-semibold transition-all"
                            >
                              <FaExternalLinkAlt size={10} /> Visit Source
                            </a>
                          </div>

                          {/* Season totals vs this stage */}
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Full Season vs This Stage Requirement
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                              <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600">Full Season Total</div>
                              <div className="p-3 grid grid-cols-3 gap-2">
                                <NutrientBadge label="N" value={result.season_total.N} color="bg-green-50 text-green-700" />
                                <NutrientBadge label="P" value={result.season_total.P} color="bg-blue-50 text-blue-700" />
                                <NutrientBadge label="K" value={result.season_total.K} color="bg-orange-50 text-orange-700" />
                              </div>
                            </div>
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                              <div className="bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">This Stage Only</div>
                              <div className="p-3 grid grid-cols-3 gap-2">
                                <NutrientBadge label="N" value={result.stage_required.N} color="bg-green-50 text-green-700" />
                                <NutrientBadge label="P" value={result.stage_required.P} color="bg-blue-50 text-blue-700" />
                                <NutrientBadge label="K" value={result.stage_required.K} color="bg-orange-50 text-orange-700" />
                              </div>
                            </div>
                          </div>

                          {/* Adjusted after soil credit */}
                          <div className="mt-4 bg-gradient-to-r from-green-700 to-emerald-500 text-white rounded-xl p-4">
                            <p className="text-xs text-green-200 font-semibold uppercase tracking-wide mb-2">
                              Final Adjusted Dose (after soil credit)
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: "N to Apply", value: result.adjusted_dose.N },
                                { label: "P to Apply", value: result.adjusted_dose.P },
                                { label: "K to Apply", value: result.adjusted_dose.K },
                              ].map((d, i) => (
                                <div key={i} className="bg-white/20 rounded-xl p-3 text-center">
                                  <p className="text-xs text-green-200">{d.label}</p>
                                  <p className="text-2xl font-bold mt-1">{d.value}</p>
                                  <p className="text-xs text-green-200">kg/ha</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveStep(4)}
                            className="mt-4 flex items-center gap-2 text-xs text-purple-700 font-semibold hover:underline"
                          >
                            Next: Product & Cost Plan <FaChevronRight size={10} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── STEP 4: PRODUCT PLAN + COST ──────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer bg-orange-50 border-b border-orange-100"
                    onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                      <h2 className="text-sm font-bold text-orange-900">Fertilizer Products & Cost Estimate</h2>
                    </div>
                    <FaCheckCircle size={16} className="text-orange-600" />
                  </div>

                  <AnimatePresence>
                    {activeStep >= 4 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5">

                          {/* Cost summary header */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                              <p className="text-xs text-gray-500">Cost per Hectare</p>
                              <p className="text-2xl font-bold text-orange-700 mt-1">
                                ₹{result.total_cost_per_ha.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                              <p className="text-xs text-gray-500">Total for {result.farm_size_acres} Acres</p>
                              <p className="text-2xl font-bold text-green-700 mt-1">
                                ₹{result.total_cost_farm.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          {result.products.length === 0 ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center text-sm text-green-800">
                              ✅ No fertilizer application needed at this growth stage.
                              Soil nutrients are adequate for the current stage.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {result.products.map((p, i) => (
                                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                                  {/* Product header */}
                                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <GiFertilizerBag size={16} className="text-orange-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-900">{p.product}</p>
                                        <p className="text-xs text-gray-500">For: {p.nutrient}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-400">Nutrient Composition</p>
                                      <p className="text-xs font-bold text-gray-700">
                                        N:{p.N_pct}% P:{p.P_pct}% K:{p.K_pct}%
                                      </p>
                                    </div>
                                  </div>

                                  <div className="p-4">
                                    <p className="text-xs text-gray-500 leading-5 mb-3">{p.description}</p>

                                    {/* Quantities */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                      <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-gray-400">Nutrient Needed</p>
                                        <p className="text-base font-bold text-blue-700 mt-1">{p.nutrient_needed_kg_ha}</p>
                                        <p className="text-xs text-gray-400">kg/ha</p>
                                      </div>
                                      <div className="bg-purple-50 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-gray-400">Product qty/ha</p>
                                        <p className="text-base font-bold text-purple-700 mt-1">{p.product_qty_kg_ha}</p>
                                        <p className="text-xs text-gray-400">kg/ha</p>
                                      </div>
                                      <div className="bg-green-50 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-gray-400">For Your Farm</p>
                                        <p className="text-base font-bold text-green-700 mt-1">{p.qty_for_farm_kg}</p>
                                        <p className="text-xs text-gray-400">kg total</p>
                                      </div>
                                      <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                                        <p className="text-xs text-gray-400">Bags ({p.bag_size}kg)</p>
                                        <p className="text-base font-bold text-orange-700 mt-1">{p.bags_for_farm}</p>
                                        <p className="text-xs text-gray-400">≈ bags</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 mb-3">
                                      <div className="flex items-center gap-2">
                                        <FaDollarSign size={12} className="text-green-600" />
                                        <span className="text-xs text-gray-600">Estimated cost for your farm</span>
                                      </div>
                                      <span className="text-base font-bold text-green-700">
                                        ₹{p.cost_for_farm_inr.toLocaleString("en-IN")}
                                      </span>
                                    </div>

                                    {p.note && (
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5 text-xs text-yellow-900 mb-3">
                                        ℹ️ {p.note}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => setActiveStep(5)}
                            className="mt-4 flex items-center gap-2 text-xs text-orange-700 font-semibold hover:underline"
                          >
                            Next: Buy Fertilizer Online <FaChevronRight size={10} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── STEP 5: BUY FERTILIZER ───────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer bg-indigo-50 border-b border-indigo-100"
                    onClick={() => setActiveStep(activeStep === 5 ? 0 : 5)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-indigo-700 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
                      <h2 className="text-sm font-bold text-indigo-900">Buy Recommended Fertilizers Online</h2>
                    </div>
                    <FaShoppingCart size={16} className="text-indigo-600" />
                  </div>

                  <AnimatePresence>
                    {activeStep >= 5 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 space-y-5">
                          <p className="text-xs text-gray-500 leading-5">
                            Click any product below to search and purchase directly on trusted Indian agri-commerce platforms.
                            Prices shown are government MRP — actual prices may vary. Always verify the product label matches
                            the recommended grade (e.g. NPK ratio, brand).
                          </p>

                          {result.products.map((p, i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <GiFertilizerBag size={16} className="text-orange-600" />
                                <p className="text-sm font-bold text-gray-900">{p.product}</p>
                                <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
                                  {p.qty_for_farm_kg} kg needed
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {p.buy_links.map((link, j) => (
                                  <a
                                    key={j}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 hover:shadow-md rounded-xl px-3 py-2.5 transition-all group"
                                  >
                                    <span className="text-lg shrink-0">{link.logo}</span>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-800 group-hover:text-green-800">
                                        {link.store}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate leading-4">
                                        {link.desc}
                                      </p>
                                    </div>
                                    <FaExternalLinkAlt size={9} className="text-gray-300 group-hover:text-green-600 ml-auto shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Disclaimer */}
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-5">
                            <p className="font-semibold text-gray-600 mb-1">⚠️ Important Disclaimer</p>
                            <p>
                              Prices are based on Government of India MRP (2024). Actual market prices may differ.
                              Always check the product grade, manufacturer, and batch number before purchase.
                              For subsidy benefits, purchase through authorised dealers or the PM-KISAN portal.
                              This advisory is based on ICAR guidelines and is for informational purposes —
                              consult your local Krishi Vigyan Kendra (KVK) for field-specific validation.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── EXPAND ALL / COLLAPSE ALL ── */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveStep(5)}
                    className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition-all"
                  >
                    Expand All Steps
                  </button>
                  <button
                    onClick={() => setActiveStep(0)}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-all"
                  >
                    Collapse All
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
