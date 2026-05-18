import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", yield: 30 },
  { month: "Feb", yield: 45 },
  { month: "Mar", yield: 52 },
  { month: "Apr", yield: 65 },
  { month: "May", yield: 80 },
  { month: "Jun", yield: 92 },
];

function YieldForecastChart() {
  return (
    <div className="bg-white p-8 rounded-[30px] shadow-xl">

      <h1 className="text-3xl font-bold text-green-900 mb-8">
        Yield Forecast Analysis
      </h1>

      <ResponsiveContainer width="100%" height={350}>

        <AreaChart data={data}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="yield"
            stroke="#16a34a"
            fill="#4ade80"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}

export default YieldForecastChart;