import { motion } from "framer-motion";

function StatsCard({ title, value, unit, color, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`${color} p-5 rounded-2xl shadow-lg text-white relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/80 text-xs">{title}</p>
          <h1 className="text-3xl font-bold mt-2">
            {value}{unit}
          </h1>
        </div>
        <div className="text-2xl text-white/90">{icon}</div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
