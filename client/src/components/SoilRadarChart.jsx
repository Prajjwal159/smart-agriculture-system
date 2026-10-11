import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const data = [
  { subject: "Nitrogen",    value: 72 },
  { subject: "Phosphorous", value: 45 },
  { subject: "Potassium",   value: 38 },
  { subject: "Moisture",    value: 68 },
  { subject: "Yield",       value: 80 },
];

function SoilRadarChart() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
      <h1 className="text-base font-bold text-green-900 mb-4">Soil Health Analysis</h1>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          <Radar dataKey="value" stroke="#15803d" fill="#22c55e" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SoilRadarChart;
