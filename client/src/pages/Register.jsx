import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import {
  FaLeaf,
  FaSeedling,
  FaCloudSun,
} from "react-icons/fa";

import { motion } from "framer-motion";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    village: "",
    district: "",
    state: "",
    farmSize: "",
    cropType: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      alert("Registration Successful");

      navigate("/login");

    } catch (error) {

      alert("Registration Failed");
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

            Start Your
            <br />
            Smart Farming Journey

          </h2>

          <p className="text-green-100 text-lg leading-8 max-w-xl">

            Join the AI-powered agriculture platform
            that helps farmers optimize fertilizer,
            improve yield, and monitor soil health.

          </p>

        </div>

        <div className="relative z-10 space-y-6">

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-4 rounded-2xl">
              <FaSeedling size={22} />
            </div>

            <div>

              <h3 className="font-semibold text-xl">
                Smart Soil Analysis
              </h3>

              <p className="text-green-100">
                AI-powered fertilizer optimization
              </p>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="bg-white/20 p-4 rounded-2xl">
              <FaCloudSun size={22} />
            </div>

            <div>

              <h3 className="font-semibold text-xl">
                Weather Intelligence
              </h3>

              <p className="text-green-100">
                Real-time farming insights
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
          className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[40px] p-10"
        >

          <div className="text-center mb-10">

            <h2 className="text-5xl font-bold text-green-800 mb-3">
              Create Account
            </h2>

            <p className="text-gray-500">
              Register your smart farming profile
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all md:col-span-2"
              />

              <input
                type="text"
                name="village"
                placeholder="Village"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <input
                type="text"
                name="district"
                placeholder="District"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <input
                type="text"
                name="farmSize"
                placeholder="Farm Size (Acres)"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              />

              <select
                name="cropType"
                onChange={handleChange}
                className="p-5 rounded-2xl border border-gray-200 bg-white/70 outline-none focus:ring-4 focus:ring-green-200 transition-all"
              >

                <option value="">
                  Select Crop Type
                </option>

                <option value="Rice">
                  Rice
                </option>

                <option value="Paddy">
                  Paddy
                </option>

                <option value="Wheat">
                  Wheat
                </option>

                <option value="Sugarcane">
                  Sugarcane
                </option>

                <option value="Cotton">
                  Cotton
                </option>

              </select>

            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-5 rounded-2xl font-semibold text-lg hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >

              Create Account

            </button>

          </form>

          <p className="text-center text-gray-600 mt-8">

            Already have an account?

            <Link
              to="/login"
              className="text-green-700 font-bold ml-2"
            >
              Login
            </Link>

          </p>

        </motion.div>

      </div>

    </div>
  );
}

export default Register;