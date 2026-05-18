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
} from "react-icons/fa";

function Dashboard() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  return (
    <div className="bg-[#f4fff7] min-h-screen">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="ml-[290px] p-8">

        {/* NAVBAR */}
        <Navbar />

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2">

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <StatsCard
                title="Crop Type"
                value={farmer?.cropType}
                color="bg-gradient-to-r from-green-600 to-green-500"
                icon={<FaSeedling />}
              />

              <StatsCard
                title="Farm Size"
                value={`${farmer?.farmSize} Acres`}
                color="bg-gradient-to-r from-blue-600 to-blue-500"
                icon={<FaMapMarkedAlt />}
              />

              <StatsCard
                title="Water Level"
                value="78%"
                color="bg-gradient-to-r from-cyan-600 to-cyan-500"
                icon={<FaWater />}
              />

            </div>

            {/* CHART */}
            <YieldChart />

            {/* RECOMMENDATION */}
            <RecommendationCard />

            {/* NITROGEN CHART */}
<NitrogenChart />

{/* ANALYTICS GRID */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

  <SoilRadarChart />

  <YieldForecastChart />

</div>

{/* INSIGHTS + WEATHER */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

  <InsightsCard />

  <WeatherWidget />

</div>
          </div>

          

          {/* RIGHT */}
          <div>

            <ProfileCard />

            {/* WEATHER CARD */}
            <div className="bg-white p-7 rounded-[30px] shadow-xl mt-8">

              <h1 className="text-2xl font-bold text-green-900 mb-5">
                Weather Analysis
              </h1>

              <div className="space-y-5">

                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span className="font-bold">29°C</span>
                </div>

                <div className="flex justify-between">
                  <span>Humidity</span>
                  <span className="font-bold">68%</span>
                </div>

                <div className="flex justify-between">
                  <span>Rainfall</span>
                  <span className="font-bold">120 mm</span>
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