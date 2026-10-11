import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaLeaf, FaSeedling, FaCloudSun,
  FaEnvelope, FaLock, FaUser, FaMapMarkerAlt,
  FaRulerCombined, FaEye, FaEyeSlash,
} from "react-icons/fa";
import { API_BASE } from "../api";

// ── Field wrapper defined OUTSIDE component so it never remounts on re-render ──
function Field({ icon, children }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  );
}

const inputCls =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-green-300 text-sm";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    village: "", district: "", state: "",
    farmSize: "", cropType: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/register`, formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[38%] bg-gradient-to-br from-green-800 to-green-600 p-10 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-14 -left-14" />
        <div className="absolute w-48 h-48 bg-white/10 rounded-full bottom-8 right-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white text-green-700 p-3 rounded-2xl shadow">
            <FaLeaf size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Smart Agro</h1>
            <p className="text-green-200 text-xs">AI Powered Farming Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-snug mb-3">
            Start Your<br />Smart Farming Journey
          </h2>
          <p className="text-green-100 text-sm leading-7 max-w-xs">
            Join the AI-powered agriculture platform that helps farmers optimize
            fertilizer, improve yield, and monitor soil health.
          </p>
          <div className="mt-7 space-y-3">
            {[
              { icon: <FaSeedling size={14} />, title: "Smart Soil Analysis",  sub: "AI-powered fertilizer optimization" },
              { icon: <FaCloudSun  size={14} />, title: "Weather Intelligence", sub: "Real-time farming insights" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <div className="bg-white/20 p-2.5 rounded-xl">{f.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-green-200 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-green-300 text-xs">© 2026 Smart Agriculture System</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      {/* No framer-motion wrapper — animation was blocking input clicks on laptop */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-5 sm:p-8">

            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-5">
              <div className="bg-green-700 text-white p-2.5 rounded-xl"><FaLeaf size={16} /></div>
              <h1 className="text-lg font-bold text-green-900">Smart Agro</h1>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-1">Create Account</h2>
            <p className="text-gray-400 text-sm mb-6">Register your smart farming profile</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">

              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Personal Info</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field icon={<FaUser />}>
                  <input
                    type="text" name="name" placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange} required
                    className={inputCls}
                  />
                </Field>

                <Field icon={<FaEnvelope />}>
                  <input
                    type="email" name="email" placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange} required
                    className={inputCls}
                  />
                </Field>

                {/* Password — spans both columns */}
                <div className="relative sm:col-span-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    <FaLock />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    name="password" placeholder="Password"
                    value={formData.password}
                    onChange={handleChange} required
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </button>
                </div>
              </div>

              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Farm Location</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field icon={<FaMapMarkerAlt />}>
                  <input
                    type="text" name="village" placeholder="Village"
                    value={formData.village}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
                <Field icon={<FaMapMarkerAlt />}>
                  <input
                    type="text" name="district" placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
                <Field icon={<FaMapMarkerAlt />}>
                  <input
                    type="text" name="state" placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide pt-1">Farm Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field icon={<FaRulerCombined />}>
                  <input
                    type="number" name="farmSize" placeholder="Farm Size (Acres)"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </Field>

                <div className="relative">
                  <FaSeedling className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleChange}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">Select Crop Type</option>
                    <option value="Rice">Rice</option>
                    <option value="Paddy">Paddy</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

            </form>

            <p className="text-center text-gray-500 text-sm mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-green-700 font-semibold hover:underline">Login</Link>
            </p>

          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
