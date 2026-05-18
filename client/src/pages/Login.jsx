import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaLeaf,
  FaRobot,
  FaChartLine,
} from "react-icons/fa";

import { motion } from "framer-motion";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "farmer",
        JSON.stringify(res.data.farmer)
      );

      navigate("/dashboard");

    } catch (error) {

      alert("Invalid Credentials");
    }
  };

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">

      {/* LEFT SECTION */}

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 to-green-600 p-16 text-white flex-col justify-between relative overflow-hidden">

        <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-20 -left-20"></div>

        <div className="absolute w-72 h-72 bg-white/10 rounded-full bottom-0 right-0"></div>

        <div className="relative z-10">

          <div className="flex items-center gap-4 mb-10">

            <div className="bg-white text-green-700 p-4 rounded-3xl">
              <FaLeaf size={30} />
            </div>

            <div>

              <h1 className="text-4xl font-bold">
                Smart Agro
              </h1>

              <p className="text-green-100 mt-1">
                AI Powered Farming Platform
              </p>

            </div>

          </div>

          <h2 className="text-6xl font-bold leading-tight mb-8">

            Smart Farming
            <br />
            With AI Intelligence

          </h2>

          <p className="text-green-100 text-lg leading-8 max-w-xl">

            Optimize fertilizer dosage, analyze soil health,
            predict crop yield and improve agricultural
            productivity using AI and Machine Learning.

          </p>

        </div>

        <div className="relative z-10 space-y-6">

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-4 rounded-2xl">
              <FaRobot size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-xl">
                AI Farming Assistant
              </h3>

              <p className="text-green-100">
                Smart recommendations for farmers
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-4 rounded-2xl">
              <FaChartLine size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-xl">
                Yield Prediction
              </h3>

              <p className="text-green-100">
                ML-powered fertilizer optimization
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* RIGHT SECTION */}

      <div className="flex-1 flex items-center justify-center p-8">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[40px] p-10"
        >

          <div className="text-center mb-10">

            <h2 className="text-5xl font-bold text-green-800 mb-3">
              Welcome Back
            </h2>

            <p className="text-gray-500">
              Login to continue your smart farming journey
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
            />

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-5 rounded-2xl font-semibold text-lg hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >

              Login

            </button>

          </form>

          <p className="text-center text-gray-600 mt-8">

            Don't have an account?

            <Link
              to="/register"
              className="text-green-700 font-bold ml-2"
            >
              Register
            </Link>

          </p>

        </motion.div>

      </div>

    </div>
  );
}

export default Login;