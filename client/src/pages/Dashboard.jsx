import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import YieldChart from "../components/YieldChart";
import RecommendationCard from "../components/RecommendationCard";
import ProfileCard from "../components/ProfileCard";
import NitrogenChart from "../components/NitrogenChart";
import SoilRadarChart from "../components/SoilRadarChart";
import YieldForecastChart from "../components/YieldForecastChart";
import InsightsCard from "../components/InsightsCard";
import WeatherWidget from "../components/WeatherWidget";
import FarmMap from "../components/FarmMap";
import AIFarmSummary from "../components/AIFarmSummary";
import LiveActivityFeed from "../components/LiveActivityFeed";

import {
  FaSeedling,
  FaMapMarkedAlt,
  FaWater,
  FaLeaf,
  FaBrain,
  FaChartLine,
} from "react-icons/fa";

import { motion } from "framer-motion";

function Dashboard() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  return (
    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">

      <Sidebar />

      {/* MAIN — offset matches new sidebar width 240px */}
      <div className="ml-0 lg:ml-[240px] p-4 sm:p-5">

        <Navbar />

        {/* AI SUMMARY + LIVE FEED side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <AIFarmSummary />
          </div>
          <div className="mt-5">
            <LiveActivityFeed />
          </div>
        </div>

        {/* HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-6 shadow-xl text-white mt-5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full -ml-10 -mb-10"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white text-green-700 p-3 rounded-2xl shadow-lg shrink-0">
              <FaLeaf size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Smart Agriculture AI 🌱</h1>
              <p className="text-green-100 text-sm mt-0.5">
                AI-powered fertilizer optimization · OCR soil analysis · Yield prediction
              </p>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          <StatsCard
            title="Crop Type"
            value={farmer?.cropType || "Wheat"}
            color="bg-gradient-to-br from-green-700 to-green-500"
            icon={<FaSeedling />}
          />
          <StatsCard
            title="Farm Size"
            value={farmer?.farmSize || 12}
            unit=" Acres"
            color="bg-gradient-to-br from-blue-700 to-blue-500"
            icon={<FaMapMarkedAlt />}
          />
          <StatsCard
            title="Water Level"
            value={78}
            unit="%"
            color="bg-gradient-to-br from-cyan-700 to-cyan-500"
            icon={<FaWater />}
          />
          <StatsCard
            title="Soil Health"
            value={84}
            unit="/100"
            color="bg-gradient-to-br from-orange-600 to-yellow-500"
            icon={<FaChartLine />}
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">

          {/* LEFT — charts */}
          <div className="xl:col-span-2 space-y-5">

            <motion.div whileHover={{ y: -3 }}>
              <YieldChart />
            </motion.div>

            <motion.div whileHover={{ y: -3 }}>
              <RecommendationCard />
            </motion.div>

            <motion.div whileHover={{ y: -3 }}>
              <NitrogenChart />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div whileHover={{ y: -3 }}><SoilRadarChart /></motion.div>
              <motion.div whileHover={{ y: -3 }}><YieldForecastChart /></motion.div>
            </div>

            <motion.div whileHover={{ y: -3 }}>
              <FarmMap />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div whileHover={{ y: -3 }}><InsightsCard /></motion.div>
              <motion.div whileHover={{ y: -3 }}><WeatherWidget /></motion.div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            <motion.div whileHover={{ y: -3 }}>
              <ProfileCard />
            </motion.div>

            {/* AI PREDICTION STATUS */}
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl">
                  <FaBrain size={18} />
                </div>
                <div>
                  <h1 className="text-base font-bold text-green-900">AI Prediction Status</h1>
                  <p className="text-gray-400 text-xs">Real-time ML insights</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nitrogen Optimization</span>
                    <span className="font-bold text-green-700">92%</span>
                  </div>
                  <div className="w-full bg-green-100 h-2 rounded-full mt-2">
                    <div className="bg-green-600 h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Yield Forecast</span>
                    <span className="font-bold text-blue-700">88%</span>
                  </div>
                  <div className="w-full bg-blue-100 h-2 rounded-full mt-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[88%]"></div>
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Soil Health</span>
                    <span className="font-bold text-orange-700">84%</span>
                  </div>
                  <div className="w-full bg-orange-100 h-2 rounded-full mt-2">
                    <div className="bg-orange-500 h-2 rounded-full w-[84%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* WEATHER SNAPSHOT */}
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-white/40">
              <h1 className="text-base font-bold text-green-900 mb-3">Weather Intelligence 🌦️</h1>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-green-50 px-3 py-2.5 rounded-xl text-sm">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-bold text-green-700">29°C</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50 px-3 py-2.5 rounded-xl text-sm">
                  <span className="text-gray-600">Humidity</span>
                  <span className="font-bold text-blue-700">68%</span>
                </div>
                <div className="flex justify-between items-center bg-cyan-50 px-3 py-2.5 rounded-xl text-sm">
                  <span className="text-gray-600">Rainfall</span>
                  <span className="font-bold text-cyan-700">120 mm</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
