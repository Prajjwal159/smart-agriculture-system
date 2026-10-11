function RecommendationCard() {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-5 rounded-2xl shadow-lg">
      <h1 className="text-base font-bold mb-2">AI Recommendation</h1>
      <p className="text-sm leading-6 text-green-50">
        Based on soil moisture, rainfall prediction, and nitrogen analysis — reduce nitrogen dosage
        by 12% this season to avoid over-fertilization and maximize crop productivity.
      </p>
    </div>
  );
}

export default RecommendationCard;
