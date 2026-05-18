import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    subject: "Nitrogen",
    value: 72,
  },
  {
    subject: "Phosphorous",
    value: 45,
  },
  {
    subject: "Potassium",
    value: 38,
  },
  {
    subject: "Moisture",
    value: 68,
  },
  {
    subject: "Yield",
    value: 80,
  },
];

function SoilRadarChart() {
  return (
    <div className="bg-white p-8 rounded-[30px] shadow-xl">

      <h1 className="text-3xl font-bold text-green-900 mb-8">
        Soil Health Analysis
      </h1>

      <ResponsiveContainer width="100%" height={350}>

        <RadarChart data={data}>

          <PolarGrid />

          <PolarAngleAxis dataKey="subject" />

          <PolarRadiusAxis />

          <Radar
            dataKey="value"
            stroke="#15803d"
            fill="#22c55e"
            fillOpacity={0.6}
          />

        </RadarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SoilRadarChart;