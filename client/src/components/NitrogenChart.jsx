import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
    <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-base font-bold text-green-900">Nitrogen Trend Analysis</h1>
          <p className="text-gray-400 text-xs mt-0.5">Monthly nitrogen usage monitoring</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
          +12% Improvement
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="nitrogen" stroke="#15803d" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default NitrogenChart;
