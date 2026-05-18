import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", nitrogen: 35 },
  { month: "Feb", nitrogen: 42 },
  { month: "Mar", nitrogen: 50 },
  { month: "Apr", nitrogen: 48 },
  { month: "May", nitrogen: 62 },
  { month: "Jun", nitrogen: 58 },
];

function NitrogenChart() {
  return (
    <div className="bg-white p-8 rounded-[30px] shadow-xl mt-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-green-900">
            Nitrogen Trend Analysis
          </h1>

          <p className="text-gray-500 mt-2">
            Monthly nitrogen usage monitoring
          </p>

        </div>

        <div className="bg-green-100 text-green-700 px-5 py-3 rounded-2xl font-semibold">
          +12% Improvement
        </div>

      </div>

      <ResponsiveContainer width="100%" height={350}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="nitrogen"
            stroke="#15803d"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default NitrogenChart;