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
  {
    name: "Week 1",
    nitrogen: 40,
    moisture: 60,
  },
  {
    name: "Week 2",
    nitrogen: 45,
    moisture: 58,
  },
  {
    name: "Week 3",
    nitrogen: 50,
    moisture: 63,
  },
  {
    name: "Week 4",
    nitrogen: 55,
    moisture: 66,
  },
];

function SoilChart() {

  return (

    <div className="bg-white p-8 rounded-[30px] shadow-xl">

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-green-800">
          Soil Analytics
        </h1>

        <p className="text-gray-500 mt-2">
          AI-powered nutrient trends
        </p>

      </div>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="nitrogen"
            stroke="#15803d"
            strokeWidth={4}
          />

          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#2563eb"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SoilChart;