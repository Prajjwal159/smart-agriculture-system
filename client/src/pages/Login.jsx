import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaRobot, FaChartLine, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE } from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("farmer", JSON.stringify(res.data.farmer));
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-green-300 text-sm";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[42%] bg-gradient-to-br from-green-800 to-green-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-16 -left-16" />
        <div className="absolute w-56 h-56 bg-white/10 rounded-full bottom-10 right-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white text-green-700 p-3 rounded-2xl shadow">
            <FaLeaf size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Smart Agro</h1>
            <p className="text-green-200 text-xs">AI Powered Farming Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Smart Farming<br />With AI Intelligence
          </h2>
          <p className="text-green-100 text-sm leading-7 max-w-sm">
            Optimize fertilizer dosage, analyze soil health, predict crop yield
            and improve agricultural productivity using AI and Machine Learning.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: <FaRobot size={16} />,     title: "AI Farming Assistant", sub: "Smart recommendations for farmers" },
              { icon: <FaChartLine size={16} />, title: "Yield Prediction",     sub: "ML-powered fertilizer optimization" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl">
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
      {/* No framer-motion wrapper here — animation was preventing input clicks on laptop */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8">

            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="bg-green-700 text-white p-2.5 rounded-xl"><FaLeaf size={18} /></div>
              <h1 className="text-lg font-bold text-green-900">Smart Agro</h1>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-green-900 mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-7">Login to continue your smart farming journey</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-700 font-semibold hover:underline">
                Register
              </Link>
            </p>

          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure login powered by JWT authentication
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
