import { useEffect, useState } from "react";

import axios from "axios";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

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

  const [notifications,
    setNotifications] =
    useState([]);

  const farmer = JSON.parse(
    localStorage.getItem("farmer")
  );

  // =========================
  // FETCH NOTIFICATIONS
  // =========================

  useEffect(() => {

    fetchNotifications();

  }, []);

  const fetchNotifications =
    async () => {

      try {

        const response =
          await axios.get(
            `http://localhost:5000/api/notifications/${farmer._id}`
          );

        setNotifications(
          response.data
        );

      } catch (error) {

        console.log(error);

      }
    };

  // =========================
  // ICONS
  // =========================

  const getIcon = (title) => {

    if (
      title.includes("Moisture")
    ) {

      return (
        <FaTint />
      );
    }

    if (
      title.includes("Rain")
    ) {

      return (
        <FaCloudRain />
      );
    }

    if (
      title.includes("Nitrogen")
    ) {

      return (
        <FaLeaf />
      );
    }

    return (
      <FaCheckCircle />
    );
  };

  // =========================
  // COLORS
  // =========================

  const getColor = (type) => {

    if (type === "warning") {

      return "text-orange-500";
    }

    if (type === "success") {

      return "text-green-600";
    }

    if (type === "info") {

      return "text-cyan-500";
    }

    return "text-emerald-500";
  };

  return (

    <div className="relative">

      {/* BELL BUTTON */}

      <motion.button

        whileTap={{
          scale: 0.9,
        }}

        onClick={() =>
          setOpen(!open)
        }

        className="relative w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center hover:shadow-2xl transition-all duration-300"
      >

        <FaBell className="text-green-700 text-lg" />

        {/* BADGE */}

        {notifications.length > 0 && (

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">

            {notifications.length}

          </span>

        )}

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

              {notifications.length === 0 && (

                <div className="p-8 text-center text-gray-500">

                  No notifications available

                </div>

              )}

              {notifications.map(
                (item, index) => (

                  <motion.div

                    key={index}

                    whileHover={{
                      x: 5,
                    }}

                    className="flex gap-4 p-5 border-b hover:bg-green-50 transition-all duration-300 cursor-pointer"
                  >

                    {/* ICON */}

                    <div
                      className={`w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl ${getColor(item.type)}`}
                    >

                      {getIcon(item.title)}

                    </div>

                    {/* TEXT */}

                    <div>

                      <h2 className="font-bold text-gray-800">

                        {item.title}

                      </h2>

                      <p className="text-sm text-gray-500 mt-1 leading-6">

                        {item.message}

                      </p>

                      <p className="text-xs text-gray-400 mt-2">

                        {new Date(
                          item.createdAt
                        ).toLocaleString()}

                      </p>

                    </div>

                  </motion.div>

                )
              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}

export default NotificationDropdown;