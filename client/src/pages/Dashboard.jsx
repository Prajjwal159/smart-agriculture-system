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

  const farmer = JSON.parse(
    localStorage.getItem("farmer")
  );

  return (

    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="ml-[290px] p-8">

        {/* NAVBAR */}
        <Navbar />

        {/* HERO SECTION */}
        <motion.div

          initial={{ opacity: 0, y: 40 }}

          animate={{ opacity: 1, y: 0 }}

          className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-10 shadow-2xl text-white"
        >

          {/* GLOW */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20"></div>

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-20 -mb-20"></div>

          <div className="relative z-10">

            <div className="flex items-center gap-4 mb-6">

              <div className="bg-white text-green-700 p-4 rounded-3xl shadow-xl">
                <FaLeaf size={30} />
              </div>

              <div>

                <h1 className="text-5xl font-bold">
                  Smart Agriculture AI 🌱
                </h1>

                <p className="text-green-100 mt-2 text-lg">
                  Precision Farming & Intelligent Crop Analytics
                </p>

              </div>

            </div>

            <p className="max-w-3xl text-green-50 leading-8 text-lg">

              AI-powered fertilizer optimization,
              OCR soil analysis,
              crop intelligence,
              smart farming insights,
              and yield prediction system.

            </p>

          </div>

        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mt-10">

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">

          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-8">

            {/* YIELD CHART */}
            <motion.div
              whileHover={{ y: -4 }}
            >
              <YieldChart />
            </motion.div>

            {/* RECOMMENDATION */}
            <motion.div
              whileHover={{ y: -4 }}
            >
              <RecommendationCard />
            </motion.div>

            {/* NITROGEN */}
            <motion.div
              whileHover={{ y: -4 }}
            >
              <NitrogenChart />
            </motion.div>

            {/* ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <motion.div
                whileHover={{ y: -4 }}
              >
                <SoilRadarChart />
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
              >
                <YieldForecastChart />
              </motion.div>

            </div>

            {/* INSIGHTS + WEATHER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <motion.div
                whileHover={{ y: -4 }}
              >
                <InsightsCard />
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
              >
                <WeatherWidget />
              </motion.div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">

            {/* PROFILE */}
            <motion.div
              whileHover={{ y: -4 }}
            >
              <ProfileCard />
            </motion.div>

            {/* AI STATUS */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[35px] shadow-2xl border border-white/40">

              <div className="flex items-center gap-4 mb-6">

                <div className="bg-purple-100 text-purple-700 p-4 rounded-2xl">
                  <FaBrain size={26} />
                </div>

                <div>

                  <h1 className="text-2xl font-bold text-green-900">
                    AI Prediction Status
                  </h1>

                  <p className="text-gray-500">
                    Real-time ML insights
                  </p>

                </div>

              </div>

              <div className="space-y-6">

                <div className="bg-green-50 p-5 rounded-2xl">

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Nitrogen Optimization
                    </span>

                    <span className="font-bold text-green-700">
                      92%
                    </span>

                  </div>

                  <div className="w-full bg-green-100 h-3 rounded-full mt-3">

                    <div className="bg-green-600 h-3 rounded-full w-[92%]"></div>

                  </div>

                </div>

                <div className="bg-blue-50 p-5 rounded-2xl">

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Yield Forecast
                    </span>

                    <span className="font-bold text-blue-700">
                      88%
                    </span>

                  </div>

                  <div className="w-full bg-blue-100 h-3 rounded-full mt-3">

                    <div className="bg-blue-600 h-3 rounded-full w-[88%]"></div>

                  </div>

                </div>

                <div className="bg-orange-50 p-5 rounded-2xl">

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Soil Health
                    </span>

                    <span className="font-bold text-orange-700">
                      84%
                    </span>

                  </div>

                  <div className="w-full bg-orange-100 h-3 rounded-full mt-3">

                    <div className="bg-orange-500 h-3 rounded-full w-[84%]"></div>

                  </div>

                </div>

              </div>

            </div>

            {/* WEATHER */}
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[35px] shadow-2xl border border-white/40">

              <h1 className="text-2xl font-bold text-green-900 mb-6">
                Weather Intelligence 🌦️
              </h1>

              <div className="space-y-5">

                <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl">

                  <span className="text-gray-700">
                    Temperature
                  </span>

                  <span className="font-bold text-green-700">
                    29°C
                  </span>

                </div>

                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl">

                  <span className="text-gray-700">
                    Humidity
                  </span>

                  <span className="font-bold text-blue-700">
                    68%
                  </span>

                </div>

                <div className="flex justify-between items-center bg-cyan-50 p-4 rounded-2xl">

                  <span className="text-gray-700">
                    Rainfall
                  </span>

                  <span className="font-bold text-cyan-700">
                    120 mm
                  </span>

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