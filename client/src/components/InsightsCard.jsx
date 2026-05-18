function InsightsCard() {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-8 rounded-[30px] shadow-2xl">

      <h1 className="text-3xl font-bold mb-6">
        AI Insights
      </h1>

      <div className="space-y-5 text-lg leading-8">

        <p>
          🌱 Nitrogen utilization efficiency improved by 12%.
        </p>

        <p>
          💧 Soil moisture levels are optimal for crop growth.
        </p>

        <p>
          🌾 Yield forecast predicts 18% increase this season.
        </p>

        <p>
          ⚠️ Potassium levels are slightly below ideal range.
        </p>

      </div>

    </div>
  );
}

export default InsightsCard;