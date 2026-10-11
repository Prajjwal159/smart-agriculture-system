function InsightsCard() {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
      <h1 className="text-base font-bold mb-3">AI Insights</h1>
      <div className="space-y-2 text-sm leading-6 text-green-50">
        <p>🌱 Nitrogen utilization efficiency improved by 12%.</p>
        <p>💧 Soil moisture levels are optimal for crop growth.</p>
        <p>🌾 Yield forecast predicts 18% increase this season.</p>
        <p>⚠️ Potassium levels slightly below ideal range.</p>
      </div>
    </div>
  );
}

export default InsightsCard;
