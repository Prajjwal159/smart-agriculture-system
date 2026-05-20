import { motion, AnimatePresence } from "framer-motion";

import {
  FaBell,
  FaTint,
  FaCloudRain,
  FaLeaf,
  FaCheckCircle,
} from "react-icons/fa";

function NotificationDropdown({
  open,
  setOpen,
}) {

  const notifications = [

    {
      icon: <FaTint />,
      title: "Soil Moisture Low",
      message:
        "Increase irrigation within 24 hours.",
      color: "text-blue-500",
    },

    {
      icon: <FaLeaf />,
      title: "Nitrogen Alert",
      message:
        "AI detected high nitrogen levels.",
      color: "text-green-600",
    },

    {
      icon: <FaCloudRain />,
      title: "Rain Forecast",
      message:
        "Heavy rainfall expected tomorrow.",
      color: "text-cyan-500",
    },

    {
      icon: <FaCheckCircle />,
      title: "OCR Analysis Complete",
      message:
        "Soil report analyzed successfully.",
      color: "text-emerald-500",
    },

  ];

  return (

    <div className="relative">

      {/* BELL BUTTON */}

      <motion.button

        whileTap={{ scale: 0.9 }}

        onClick={() => setOpen(!open)}

        className="relative w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center hover:shadow-2xl transition-all duration-300"
      >

        <FaBell className="text-green-700 text-lg" />

        {/* BADGE */}

        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
          4
        </span>

      </motion.button>

      {/* DROPDOWN */}

      <AnimatePresence>

        {open && (

          <motion.div

            initial={{
              opacity: 0,
              y: -10,
              scale: 0.95,
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}

            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
            }}

            className="absolute right-0 mt-4 w-[380px] bg-white rounded-[30px] shadow-2xl border border-green-100 overflow-hidden z-50"
          >

            {/* HEADER */}

            <div className="p-6 border-b">

              <h1 className="text-2xl font-bold text-green-900">
                Notifications
              </h1>

              <p className="text-gray-500 mt-1">
                Smart farming AI alerts
              </p>

            </div>

            {/* ITEMS */}

            <div className="max-h-[400px] overflow-y-auto">

              {notifications.map((item, index) => (

                <motion.div

                  key={index}

                  whileHover={{
                    x: 5,
                  }}

                  className="flex gap-4 p-5 border-b hover:bg-green-50 transition-all duration-300 cursor-pointer"
                >

                  <div
                    className={`w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl ${item.color}`}
                  >
                    {item.icon}
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-800">
                      {item.title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 leading-6">
                      {item.message}
                    </p>

                  </div>

                </motion.div>

              ))}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}

export default NotificationDropdown;