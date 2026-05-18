import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", yield: 40 },
  { month: "Feb", yield: 55 },
  { month: "Mar", yield: 70 },
  { month: "Apr", yield: 65 },
  { month: "May", yield: 90 },
];

function YieldChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">

      <h2 className="text-2xl font-bold text-green-700 mb-6">
        Crop Yield Analysis
      </h2>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={data}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="yield"
            stroke="#15803d"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default YieldChart;