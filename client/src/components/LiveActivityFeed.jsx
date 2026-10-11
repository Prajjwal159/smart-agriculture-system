import { motion } from "framer-motion";

function LiveActivityFeed() {

  const activities = [
    { title: "OCR Analysis Completed",    description: "Soil report processed successfully.", time: "2 min ago",  icon: "📄", color: "bg-green-100" },
    { title: "Nitrogen Increased",        description: "Nitrogen level increased by 4%.",      time: "10 min ago", icon: "🧪", color: "bg-yellow-100" },
    { title: "Rain Detected Near Farm",   description: "Heavy rainfall expected tomorrow.",     time: "18 min ago", icon: "🌧️", color: "bg-blue-100" },
    { title: "AI Recommendation Updated", description: "Irrigation requirement changed.",       time: "30 min ago", icon: "🤖", color: "bg-purple-100" },
    { title: "Moisture Stabilized",       description: "Soil moisture reached optimal level.",  time: "45 min ago", icon: "💧", color: "bg-cyan-100" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow border border-green-50 p-5"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold text-green-900">Live Activity Feed</h1>
          <p className="text-gray-400 text-xs mt-0.5">Real-time AI farming updates</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-green-700 text-xs">LIVE</span>
        </div>
      </div>

      {/* FEED — horizontal scroll on small, grid on large */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {activities.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ x: 3 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200"
          >
            {/* ICON */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${item.color}`}>
              {item.icon}
            </div>

            {/* TEXT */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">{item.title}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{item.description}</p>
            </div>

            {/* TIME */}
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.time}</span>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}

export default LiveActivityFeed;
