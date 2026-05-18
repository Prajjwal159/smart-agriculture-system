import { motion } from "framer-motion";

function StatsCard({ title, value, color, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`p-7 rounded-[30px] text-white shadow-2xl ${color}`}
    >

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-lg opacity-80">
            {title}
          </h2>

          <h1 className="text-3xl font-bold mt-3">
            {value}
          </h1>

        </div>

        <div className="text-4xl opacity-70">
          {icon}
        </div>

      </div>

    </motion.div>
  );
}

export default StatsCard;