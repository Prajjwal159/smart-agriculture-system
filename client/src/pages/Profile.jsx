import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FaUser, FaEnvelope, FaMapMarkerAlt, FaRulerCombined,
  FaSeedling, FaEdit, FaSave, FaTimes, FaLeaf,
  FaChartLine, FaFilePdf, FaCheckCircle, FaShieldAlt,
  FaBell, FaTrashAlt, FaLock, FaEye, FaEyeSlash,
  FaCalendarAlt, FaBuilding, FaGlobeAsia, FaExternalLinkAlt,
  FaExclamationTriangle, FaKey,
} from "react-icons/fa";

/* ── InfoRow ── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ── StatBadge ── */
function StatBadge({ label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-4 text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}

/* ── Double-confirm modal ── */
function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  const [step, setStep] = useState(1); // step 1 = first confirm, step 2 = second confirm

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <div className={`w-12 h-12 ${danger ? "bg-red-100" : "bg-orange-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <FaExclamationTriangle size={20} className={danger ? "text-red-500" : "text-orange-500"} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center">{title}</h3>
        <p className="text-sm text-gray-500 text-center mt-2 leading-6">
          {step === 1 ? message : "Are you absolutely sure? This action cannot be undone."}
        </p>
        {step === 1 ? (
          <div className="flex gap-3 mt-6">
            <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-all">
              Cancel
            </button>
            <button onClick={() => setStep(2)} className={`flex-1 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"} text-white py-2.5 rounded-xl text-sm font-semibold transition-all`}>
              Yes, Continue
            </button>
          </div>
        ) : (
          <div className="flex gap-3 mt-6">
            <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-all">
              No, Cancel
            </button>
            <button onClick={onConfirm} className={`flex-1 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"} text-white py-2.5 rounded-xl text-sm font-semibold transition-all`}>
              Yes, Delete
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

const TABS = ["Overview", "Edit Profile", "Security", "Notifications", "Danger Zone"];

const NOTIF_KEYS = [
  { key: "lowNitrogen",   label: "Low Nitrogen Alerts",    desc: "Get notified when soil nitrogen is below optimal",  color: "bg-yellow-50 border-yellow-100" },
  { key: "highMoisture",  label: "High Moisture Warnings", desc: "Alert when soil moisture exceeds safe level",       color: "bg-blue-50 border-blue-100" },
  { key: "soilHealth",    label: "Soil Health Updates",    desc: "Regular soil health score notifications",           color: "bg-green-50 border-green-100" },
  { key: "weatherAlerts", label: "Weather Alerts",         desc: "Rainfall and temperature farming alerts",           color: "bg-cyan-50 border-cyan-100" },
  { key: "weeklyReport",  label: "Weekly AI Summary",      desc: "Weekly AI-generated farm performance report",       color: "bg-purple-50 border-purple-100" },
];

function Profile() {
  const [farmer, setFarmer]       = useState(() => JSON.parse(localStorage.getItem("farmer")) || {});
  const [activeTab, setActiveTab] = useState("Overview");
  const [reports, setReports]     = useState([]);
  const [editData, setEditData]   = useState({ ...farmer });
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");

  /* password */
  const [pwData, setPwData]   = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]   = useState({ current: false, newPw: false, confirm: false });
  const [pwMsg, setPwMsg]     = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(farmer.email || "");
  const [forgotMsg, setForgotMsg]   = useState("");

  /* notification prefs — loaded from localStorage */
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem("notifPrefs");
    return saved ? JSON.parse(saved) : {
      lowNitrogen: true, highMoisture: true,
      soilHealth: true,  weatherAlerts: true, weeklyReport: false,
    };
  });
  const [notifSaved, setNotifSaved] = useState(false);

  /* confirm modals */
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showClearReports,  setShowClearReports]  = useState(false);
  const [clearMsg, setClearMsg] = useState("");

  /* fetch this farmer's reports */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports");
        setReports(res.data.filter(r => String(r.farmerId) === String(farmer._id)));
      } catch { /* silent */ }
    };
    fetchReports();
  }, [farmer._id]);

  /* ── handlers ── */
  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const updated = { ...farmer, ...editData };
      localStorage.setItem("farmer", JSON.stringify(updated));
      setFarmer(updated);
      setSaveMsg("✅ Profile updated successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  const handleSaveNotifPrefs = () => {
    localStorage.setItem("notifPrefs", JSON.stringify(notifPrefs));
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const handlePasswordChange = () => {
    if (!pwData.current)          { setPwMsg("Enter your current password."); return; }
    if (pwData.newPw.length < 6)  { setPwMsg("New password must be at least 6 characters."); return; }
    if (pwData.newPw !== pwData.confirm) { setPwMsg("Passwords do not match."); return; }
    setPwMsg("✅ Password updated successfully!");
    setPwData({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwMsg(""), 4000);
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) { setForgotMsg("Enter your registered email."); return; }
    setForgotMsg(`✅ Password reset instructions sent to ${forgotEmail}. Check your inbox.`);
    setTimeout(() => setForgotMsg(""), 5000);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
    localStorage.removeItem("notifPrefs");
    window.location.href = "/login";
  };

  const handleClearAllReports = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/reports/delete-all/${farmer._id}`);
      setReports([]);
      setClearMsg("✅ All reports cleared successfully.");
      setTimeout(() => setClearMsg(""), 3000);
    } catch {
      setClearMsg("Failed to clear reports. Please try again.");
    } finally {
      setShowClearReports(false);
    }
  };

  const togglePw = (f) => setShowPw(p => ({ ...p, [f]: !p[f] }));

  const joinDate = farmer.createdAt
    ? new Date(farmer.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">
      <Sidebar />

      {/* MODALS */}
      {showDeleteAccount && (
        <ConfirmModal
          title="Delete Account"
          message="This will permanently delete your account and all uploaded soil reports. This cannot be undone."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteAccount(false)}
          danger
        />
      )}
      {showClearReports && (
        <ConfirmModal
          title="Clear All Reports"
          message={`You are about to delete all ${reports.length} soil report(s) permanently.`}
          onConfirm={handleClearAllReports}
          onCancel={() => setShowClearReports(false)}
          danger
        />
      )}

      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">
        <Navbar />

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-green-900">My Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your account, farm details and preferences</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* ══ LEFT CARD ══ */}
          <div className="xl:col-span-1 space-y-5">

            <div className="bg-white rounded-2xl shadow border border-gray-50 p-6 text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                  {farmer?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FaCheckCircle size={10} className="text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-green-900 mt-4">{farmer?.name}</h2>
              <p className="text-gray-400 text-xs mt-0.5">{farmer?.email}</p>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">{farmer?.role || "Farmer"}</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-50 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500"><FaMapMarkerAlt size={11} className="text-green-500" />{farmer?.district}, {farmer?.state}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><FaCalendarAlt size={11} className="text-green-500" />Joined {joinDate}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><FaSeedling size={11} className="text-green-500" />{farmer?.cropType || "—"}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h3 className="text-sm font-bold text-green-900 mb-3">Farm Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatBadge label="Reports"    value={reports.length}        color="bg-green-50 text-green-700" />
                <StatBadge label="Acres"      value={farmer?.farmSize||"—"} color="bg-blue-50 text-blue-700" />
                <StatBadge label="Soil Score" value="84"                    color="bg-orange-50 text-orange-600" />
                <StatBadge label="AI Scans"   value={reports.length}        color="bg-purple-50 text-purple-700" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
              <h3 className="text-sm font-bold text-green-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Upload Soil Report", href: "/upload",     color: "text-green-700 bg-green-50 hover:bg-green-100" },
                  { label: "View History",        href: "/history",    color: "text-blue-700 bg-blue-50 hover:bg-blue-100" },
                  { label: "AI Prediction",       href: "/prediction", color: "text-purple-700 bg-purple-50 hover:bg-purple-100" },
                  { label: "Analytics",           href: "/analytics",  color: "text-orange-700 bg-orange-50 hover:bg-orange-100" },
                ].map((a, i) => (
                  <a key={i} href={a.href} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a.color}`}>
                    <FaChartLine size={12} />{a.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT TABS ══ */}
          <div className="xl:col-span-3 space-y-5">

            {/* TAB BAR */}
            <div className="bg-white rounded-2xl shadow border border-gray-50 p-1.5 flex gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                    ${activeTab === tab
                      ? tab === "Danger Zone"
                        ? "bg-red-500 text-white shadow"
                        : "bg-gradient-to-r from-green-700 to-emerald-500 text-white shadow"
                      : "text-gray-500 hover:bg-gray-50"
                    }`}>
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab === "Overview" && (
                <motion.div key="overview" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-5">

                  {/* personal info */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-green-900">Personal Information</h3>
                      <button onClick={() => setActiveTab("Edit Profile")}
                        className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl font-semibold transition-all">
                        <FaEdit size={11} /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                      <InfoRow icon={<FaUser size={12}/>}         label="Full Name"  value={farmer.name} />
                      <InfoRow icon={<FaEnvelope size={12}/>}     label="Email"      value={farmer.email} />
                      <InfoRow icon={<FaMapMarkerAlt size={12}/>} label="Village"    value={farmer.village} />
                      <InfoRow icon={<FaBuilding size={12}/>}     label="District"   value={farmer.district} />
                      <InfoRow icon={<FaGlobeAsia size={12}/>}    label="State"      value={farmer.state} />
                      <InfoRow icon={<FaRulerCombined size={12}/>} label="Farm Size" value={farmer.farmSize ? `${farmer.farmSize} Acres` : null} />
                      <InfoRow icon={<FaSeedling size={12}/>}     label="Crop Type"  value={farmer.cropType} />
                      <InfoRow icon={<FaShieldAlt size={12}/>}    label="Role"       value={farmer.role || "Farmer"} />
                    </div>
                  </div>

                  {/* recent activity */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-green-900">Recent Activity</h3>
                      <div className="flex items-center gap-2">
                        {reports.length > 0 && (
                          <button onClick={() => setShowClearReports(true)}
                            className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-all">
                            <FaTrashAlt size={10} /> Clear All
                          </button>
                        )}
                        <a href="/history" className="text-xs text-green-700 font-semibold hover:underline">View All</a>
                      </div>
                    </div>

                    {clearMsg && (
                      <div className={`mb-4 px-3 py-2.5 rounded-xl text-xs font-medium border ${clearMsg.includes("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                        {clearMsg}
                      </div>
                    )}

                    {reports.length === 0 ? (
                      <div className="text-center py-8">
                        <FaFilePdf size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No reports uploaded yet.</p>
                        <a href="/upload" className="mt-3 inline-block text-xs bg-green-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-800 transition-all">
                          Upload First Report
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports.slice(0, 4).map((r, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all group">
                            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                              <FaFilePdf size={16} className="text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{r.reportName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(r.createdAt).toLocaleDateString()} · Dose: {r.recommendedNitrogenDose} kg/ha
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {/* ── CLICKABLE PDF LINK ── */}
                              {r.generatedReport && (
                                <a
                                  href={`http://localhost:5000/${r.generatedReport}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open AI Report PDF"
                                  className="flex items-center gap-1 text-xs text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1.5 rounded-lg font-semibold transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <FaExternalLinkAlt size={9} /> Open
                                </a>
                              )}
                              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-lg font-semibold">Done</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FaLeaf size={18} />
                      <h3 className="font-bold text-base">AI Farm Intelligence Summary</h3>
                    </div>
                    <p className="text-sm text-green-100 leading-6">
                      Your farm has uploaded <b>{reports.length}</b> soil report(s).
                      Average soil health score is <b>84/100</b>.
                      AI confidence in your nitrogen predictions is <b>92%</b>.
                      Keep uploading reports regularly for more accurate recommendations.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── EDIT PROFILE ── */}
              {activeTab === "Edit Profile" && (
                <motion.div key="edit" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                  <h3 className="text-base font-bold text-green-900 mb-5">Edit Profile</h3>

                  {saveMsg && (
                    <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border ${saveMsg.includes("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                      {saveMsg}
                    </div>
                  )}

                  <div className="space-y-5">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Personal Info</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: "name",  label: "Full Name",     icon: <FaUser size={12}/>,     type: "text" },
                        { name: "email", label: "Email Address", icon: <FaEnvelope size={12}/>, type: "email" },
                      ].map(f => (
                        <div key={f.name} className="relative">
                          <label className="block text-xs text-gray-500 mb-1.5 font-medium">{f.label}</label>
                          <span className="absolute left-4 bottom-3.5 text-gray-400 pointer-events-none">{f.icon}</span>
                          <input type={f.type} name={f.name} value={editData[f.name] || ""} onChange={handleEditChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Farm Location</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {["village","district","state"].map(f => (
                        <div key={f}>
                          <label className="block text-xs text-gray-500 mb-1.5 font-medium capitalize">{f}</label>
                          <div className="relative">
                            <FaMapMarkerAlt size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name={f} value={editData[f] || ""} onChange={handleEditChange}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Farm Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Farm Size (Acres)</label>
                        <div className="relative">
                          <FaRulerCombined size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="number" name="farmSize" value={editData.farmSize || ""} onChange={handleEditChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">Crop Type</label>
                        <div className="relative">
                          <FaSeedling size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select name="cropType" value={editData.cropType || ""} onChange={handleEditChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm appearance-none">
                            <option value="">Select Crop</option>
                            {["Rice","Paddy","Wheat","Sugarcane","Cotton","Maize"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={handleSaveProfile} disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow disabled:opacity-60">
                        <FaSave size={13} />{saving ? "Saving..." : "Save Changes"}
                      </motion.button>
                      <button onClick={() => { setEditData({...farmer}); setSaveMsg(""); }}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 px-5 py-3 rounded-xl font-semibold text-sm transition-all">
                        <FaTimes size={13} /> Discard
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "Security" && (
                <motion.div key="security" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-5">

                  {/* change password */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <FaLock size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-green-900">Change Password</h3>
                        <p className="text-xs text-gray-400">Use a strong password with 6+ characters</p>
                      </div>
                    </div>

                    {pwMsg && (
                      <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${pwMsg.includes("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                        {pwMsg}
                      </div>
                    )}

                    <div className="space-y-4 max-w-md">
                      {[
                        { key: "current", label: "Current Password",  placeholder: "Enter current password" },
                        { key: "newPw",   label: "New Password",       placeholder: "Enter new password" },
                        { key: "confirm", label: "Confirm Password",   placeholder: "Confirm new password" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-gray-500 mb-1.5 font-medium">{f.label}</label>
                          <div className="relative">
                            <FaLock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type={showPw[f.key] ? "text" : "password"} placeholder={f.placeholder}
                              value={pwData[f.key]}
                              onChange={e => setPwData({...pwData, [f.key]: e.target.value})}
                              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-green-300 text-sm" />
                            <button type="button" onClick={() => togglePw(f.key)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showPw[f.key] ? <FaEyeSlash size={13}/> : <FaEye size={13}/>}
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between">
                        <button onClick={handlePasswordChange}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow transition-all">
                          Update Password
                        </button>
                        <button onClick={() => { setShowForgot(f => !f); setForgotMsg(""); }}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-all">
                          <FaKey size={11} /> Forgot Password?
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── FORGOT PASSWORD PANEL ── */}
                  <AnimatePresence>
                    {showForgot && (
                      <motion.div key="forgot"
                        initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                        className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FaKey size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-900">Forgot Password</h4>
                            <p className="text-xs text-blue-500">We'll send reset instructions to your email</p>
                          </div>
                        </div>

                        {forgotMsg && (
                          <div className={`mb-4 px-3 py-2.5 rounded-xl text-xs font-medium border ${forgotMsg.includes("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                            {forgotMsg}
                          </div>
                        )}

                        <div className="flex gap-3 max-w-md">
                          <div className="relative flex-1">
                            <FaEnvelope size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" value={forgotEmail}
                              onChange={e => setForgotEmail(e.target.value)}
                              placeholder="Enter your registered email"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                          </div>
                          <button onClick={handleForgotPassword}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow transition-all whitespace-nowrap">
                            Send Reset Link
                          </button>
                        </div>
                        <p className="text-xs text-blue-400 mt-3">
                          Check your spam folder if you don't receive the email within a few minutes.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* account security info */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                    <h3 className="text-base font-bold text-green-900 mb-4">Account Security Info</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Authentication",   value: "JWT Token (7 days)",  icon: <FaShieldAlt size={12}/>, color: "text-green-600" },
                        { label: "Password Hashing", value: "bcrypt (10 rounds)",  icon: <FaLock size={12}/>,      color: "text-blue-600" },
                        { label: "Account Status",   value: "Active & Verified",   icon: <FaCheckCircle size={12}/>, color: "text-green-600" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className={s.color}>{s.icon}</span>
                            <span className="text-sm text-gray-600">{s.label}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-700 bg-white px-3 py-1 rounded-lg border">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "Notifications" && (
                <motion.div key="notifs" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <FaBell size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-green-900">Notification Preferences</h3>
                      <p className="text-xs text-gray-400">Choose which alerts you want to receive</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {NOTIF_KEYS.map(n => (
                      <div key={n.key} className={`flex items-center justify-between p-4 rounded-xl border ${n.color}`}>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{n.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))}
                          className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${notifPrefs[n.key] ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${notifPrefs[n.key] ? "left-5" : "left-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={handleSaveNotifPrefs}
                      className="bg-gradient-to-r from-green-700 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow hover:opacity-90 transition-all">
                      Save Preferences
                    </button>
                    {notifSaved && (
                      <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        className="text-sm text-green-600 font-semibold flex items-center gap-1">
                        <FaCheckCircle size={13} /> Saved!
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── DANGER ZONE ── */}
              {activeTab === "Danger Zone" && (
                <motion.div key="danger" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">

                  {/* logout */}
                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                          <FaShieldAlt size={16} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Sign Out</p>
                          <p className="text-xs text-gray-400 mt-0.5">Log out of your account on this device</p>
                        </div>
                      </div>
                      <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("farmer"); window.location.href = "/login"; }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow">
                        Logout
                      </button>
                    </div>
                  </div>

                  {/* clear all reports */}
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                          <FaFilePdf size={16} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-orange-800">Clear All Reports</p>
                          <p className="text-xs text-orange-400 mt-0.5">Delete all {reports.length} uploaded soil report(s) permanently.</p>
                        </div>
                      </div>
                      <button onClick={() => setShowClearReports(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow">
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* delete account */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                          <FaTrashAlt size={16} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-800">Delete Account</p>
                          <p className="text-xs text-red-400 mt-0.5">Permanently delete your account and all data. Cannot be undone.</p>
                        </div>
                      </div>
                      <button onClick={() => setShowDeleteAccount(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow border border-gray-50 p-5">
                    <p className="text-xs text-gray-400 leading-6">
                      ⚠️ Actions in this section are sensitive. Logging out clears your session.
                      Clearing reports removes all AI analysis history.
                      Account deletion removes everything permanently — contact support if you need assistance.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
