import { motion } from "framer-motion";

function StatsCard({
  title,
  value,
  unit,
  color,
  icon,
}) {

  return (

    <motion.div

      whileHover={{
        y: -6,
        scale: 1.02,
      }}

      className={`${color} p-6 rounded-[30px] shadow-2xl text-white relative overflow-hidden`}
    >

      {/* GLOW */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>

      <div className="relative z-10 flex justify-between items-start">

        <div>

          <p className="text-white/80 text-sm">
            {title}
          </p>

          <h1 className="text-4xl font-bold mt-4">

            {value}

            {unit}

          </h1>

        </div>

        <div className="text-4xl text-white/90">

          {icon}

        </div>

      </div>

    </motion.div>
  );
}

export default StatsCard;