function RecommendationCard() {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-8 rounded-[30px] shadow-2xl mt-8">

      <h1 className="text-3xl font-bold mb-5">
        AI Recommendation
      </h1>

      <p className="leading-8 text-lg">

        Based on soil moisture, rainfall prediction,
        and nitrogen analysis, the optimal nitrogen dosage
        for this season should be reduced by 12% to avoid
        over-fertilization and maximize crop productivity.

      </p>

    </div>
  );
}

export default RecommendationCard;