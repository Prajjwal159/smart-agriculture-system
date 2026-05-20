import { useEffect, useState } from "react";

import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
 Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  FaLeaf,
  FaChartLine,
  FaTint,
  FaSeedling,
} from "react-icons/fa";

import { motion } from "framer-motion";

// =========================
// STATIC DATA
// =========================

const fertilizerData = [

  { name: "Nitrogen", value: 45 },

  { name: "Phosphorous", value: 30 },

  { name: "Potassium", value: 25 },

];

const rainfallData = [

  { month: "Jan", rainfall: 20 },

  { month: "Feb", rainfall: 35 },

  { month: "Mar", rainfall: 60 },

  { month: "Apr", rainfall: 80 },

  { month: "May", rainfall: 120 },

];

const COLORS = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
];

function Analytics() {

  // =========================
  // STATE
  // =========================

  const [analytics, setAnalytics] =
    useState(null);

  // =========================
  // FARMER
  // =========================

  const farmer = JSON.parse(
    localStorage.getItem("farmer")
  );

  // =========================
  // FETCH ANALYTICS
  // =========================

  useEffect(() => {

    fetchAnalytics();

  }, []);

  const fetchAnalytics =
    async () => {

      try {

        const response =
          await axios.get(
            `http://localhost:5000/api/reports/analytics/${farmer._id}`
          );

        console.log(response.data);

        setAnalytics(
          response.data
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (

    <div className="bg-gradient-to-br from-[#f4fff7] via-[#eefbf3] to-[#e8fff0] min-h-screen">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="ml-[290px] p-8">

        <Navbar />

        {/* HERO */}
        <motion.div

          initial={{
            opacity: 0,
            y: 30,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          className="bg-gradient-to-r from-green-800 to-emerald-600 rounded-[40px] p-10 shadow-2xl text-white relative overflow-hidden"
        >

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-20 -mt-20"></div>

          <h1 className="text-5xl font-bold relative z-10">

            Advanced Analytics 📈

          </h1>

          <p className="mt-4 text-lg text-green-100 max-w-2xl relative z-10 leading-8">

            AI-powered agriculture intelligence,
            soil analytics,
            crop performance,
            and smart farming insights.

          </p>

        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 mt-10">

          {/* SOIL HEALTH */}
          <div className="bg-gradient-to-br from-green-700 to-green-500 p-8 rounded-[30px] text-white shadow-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-white/80">
                  Soil Health
                </p>

                <h1 className="text-5xl font-bold mt-3">

                  {analytics?.averageHealth || 0}%

                </h1>

              </div>

              <FaLeaf size={40} />

            </div>

          </div>

          {/* YIELD */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-500 p-8 rounded-[30px] text-white shadow-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-white/80">
                  Yield Growth
                </p>

                <h1 className="text-5xl font-bold mt-3">

                  63%

                </h1>

              </div>

              <FaChartLine size={40} />

            </div>

          </div>

          {/* MOISTURE */}
          <div className="bg-gradient-to-br from-cyan-700 to-cyan-500 p-8 rounded-[30px] text-white shadow-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-white/80">
                  Moisture
                </p>

                <h1 className="text-5xl font-bold mt-3">

                  68%

                </h1>

              </div>

              <FaTint size={40} />

            </div>

          </div>

          {/* CROP QUALITY */}
          <div className="bg-gradient-to-br from-orange-600 to-yellow-500 p-8 rounded-[30px] text-white shadow-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-white/80">
                  Crop Quality
                </p>

                <h1 className="text-5xl font-bold mt-3">

                  91%

                </h1>

              </div>

              <FaSeedling size={40} />

            </div>

          </div>

          {/* TOTAL REPORTS */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-500 p-8 rounded-[30px] text-white shadow-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-white/80">
                  Total Reports
                </p>

                <h1 className="text-5xl font-bold mt-3">

                  {analytics?.totalReports || 0}

                </h1>

              </div>

              <FaChartLine size={40} />

            </div>

          </div>

        </div>

        {/* CHART GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">

          {/* AI PREDICTION TREND */}
          <div className="bg-white p-8 rounded-[35px] shadow-2xl">

            <h1 className="text-3xl font-bold text-green-900 mb-6">

              AI Prediction Trend

            </h1>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <LineChart
                data={
                  analytics?.nitrogenTrend || []
                }
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="prediction"
                  stroke="#16a34a"
                  strokeWidth={5}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* PIE CHART */}
          <div className="bg-white p-8 rounded-[35px] shadow-2xl">

            <h1 className="text-3xl font-bold text-green-900 mb-6">

              Fertilizer Usage

            </h1>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <PieChart>

                <Pie
                  data={fertilizerData}
                  dataKey="value"
                  outerRadius={120}
                  label
                >

                  {fertilizerData.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[index]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">

          {/* RAINFALL */}
          <div className="bg-white p-8 rounded-[35px] shadow-2xl">

            <h1 className="text-3xl font-bold text-green-900 mb-6">

              Rainfall Analysis

            </h1>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <BarChart data={rainfallData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="rainfall"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* AI INSIGHTS */}
          <div className="bg-white p-8 rounded-[35px] shadow-2xl">

            <h1 className="text-3xl font-bold text-green-900 mb-6">

              AI Farming Insights

            </h1>

            <div className="space-y-5">

              <div className="bg-green-50 p-5 rounded-2xl">

                <h2 className="font-bold text-green-700 text-xl">

                  Soil Health Improving

                </h2>

                <p className="text-gray-600 mt-3 leading-7">

                  AI detected stable nutrient
                  growth across uploaded reports.

                </p>

              </div>

              <div className="bg-blue-50 p-5 rounded-2xl">

                <h2 className="font-bold text-blue-700 text-xl">

                  AI Prediction Tracking

                </h2>

                <p className="text-gray-600 mt-3 leading-7">

                  Machine learning predictions
                  are dynamically generated
                  from real uploaded soil reports.

                </p>

              </div>

              <div className="bg-orange-50 p-5 rounded-2xl">

                <h2 className="font-bold text-orange-700 text-xl">

                  Fertilizer Optimization

                </h2>

                <p className="text-gray-600 mt-3 leading-7">

                  Smart fertilizer recommendations
                  help improve crop productivity
                  and reduce overuse.

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;