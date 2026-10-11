import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", yield: 40 },
  { month: "Feb", yield: 55 },
  { month: "Mar", yield: 70 },
  { month: "Apr", yield: 65 },
  { month: "May", yield: 90 },
];

function YieldChart() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
      <h2 className="text-base font-bold text-green-700 mb-4">Crop Yield Analysis</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="yield" stroke="#15803d" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default YieldChart;
