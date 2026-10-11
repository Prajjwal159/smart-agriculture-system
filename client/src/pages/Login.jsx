import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FaLeaf, FaRobot, FaChartLine, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("farmer", JSON.stringify(res.data.farmer));
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[42%] bg-gradient-to-br from-green-800 to-green-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-16 -left-16"></div>
        <div className="absolute w-56 h-56 bg-white/10 rounded-full bottom-10 right-0"></div>

        {/* LOGO */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white text-green-700 p-3 rounded-2xl shadow">
            <FaLeaf size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Smart Agro</h1>
            <p className="text-green-200 text-xs">AI Powered Farming Platform</p>
          </div>
        </div>

        {/* HERO TEXT */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Smart Farming<br />With AI Intelligence
          </h2>
          <p className="text-green-100 text-sm leading-7 max-w-sm">
            Optimize fertilizer dosage, analyze soil health, predict crop yield and improve
            agricultural productivity using AI and Machine Learning.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl">
              <div className="bg-white/20 p-2.5 rounded-xl"><FaRobot size={16} /></div>
              <div>
                <p className="font-semibold text-sm">AI Farming Assistant</p>
                <p className="text-green-200 text-xs">Smart recommendations for farmers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl">
              <div className="bg-white/20 p-2.5 rounded-xl"><FaChartLine size={16} /></div>
              <div>
                <p className="font-semibold text-sm">Yield Prediction</p>
                <p className="text-green-200 text-xs">ML-powered fertilizer optimization</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="relative z-10 text-green-300 text-xs">
          © 2026 Smart Agriculture System
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* CARD */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl rounded-3xl p-8">

            {/* MOBILE LOGO */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="bg-green-700 text-white p-2.5 rounded-xl">
                <FaLeaf size={18} />
              </div>
              <h1 className="text-lg font-bold text-green-900">Smart Agro</h1>
            </div>

            <h2 className="text-3xl font-bold text-green-900 mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-7">Login to continue your smart farming journey</p>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/70 outline-none focus:ring-2 focus:ring-green-300 text-sm transition-all"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 bg-white/70 outline-none focus:ring-2 focus:ring-green-300 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 hover:scale-[1.01] transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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

          {/* BOTTOM NOTE */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Secure login powered by JWT authentication
          </p>

        </motion.div>
      </div>
    </div>
  );
}

export default Login;
