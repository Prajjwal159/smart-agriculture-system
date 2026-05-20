import { useState } from "react";

import {
  FaHome,
  FaUser,
  FaUpload,
  FaHistory,
  FaRobot,
  FaLeaf,
  FaBars,
  FaTimes,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { Link, useLocation } from "react-router-dom";

function Sidebar() {

  const location = useLocation();

  const [open, setOpen] = useState(false);

  const menuItems = [

    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },

    {
      title: "Profile",
      icon: <FaUser />,
      path: "/profile",
    },

    {
      title: "Upload Report",
      icon: <FaUpload />,
      path: "/upload",
    },

    {
      title: "Prediction History",
      icon: <FaHistory />,
      path: "/history",
    },

    {
      title: "AI Prediction",
      icon: <FaChartLine />,
      path: "/prediction",
    },

    {
      title: "AI Assistant",
      icon: <FaRobot />,
      path: "/chatbot",
    },

    {
      title: "Analytics",
      icon: <FaChartLine />,
      path: "/analytics",
    },

  ];

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("farmer");

    window.location.href = "/login";
  };

  return (

    <>

      {/* MOBILE BUTTON */}
      <button

        onClick={() => setOpen(!open)}

        className="lg:hidden fixed top-5 left-5 z-50 bg-green-700 text-white p-3 rounded-2xl shadow-xl"
      >

        {open ? <FaTimes /> : <FaBars />}

      </button>

      {/* SIDEBAR */}
      <motion.div

        initial={{ x: -100, opacity: 0 }}

        animate={{ x: 0, opacity: 1 }}

        className={`

          fixed top-0 left-0 z-40
          h-screen w-[290px]
          bg-white/70 backdrop-blur-2xl
          border-r border-white/20
          shadow-2xl
          transition-all duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >

        {/* LOGO */}
        <div className="p-8 border-b border-gray-200">

          <div className="flex items-center gap-4">

            <div className="bg-gradient-to-br from-green-700 to-emerald-500 text-white p-4 rounded-3xl shadow-lg">

              <FaLeaf size={28} />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-green-900">
                Smart Agro
              </h1>

              <p className="text-gray-500 text-sm">
                AI Farming Platform
              </p>

            </div>

          </div>

        </div>

        {/* MENU */}
        <div className="p-6 flex flex-col justify-between h-[calc(100vh-140px)] overflow-y-auto">

          <div className="space-y-3">

            {menuItems.map((item, index) => {

              const active =
                location.pathname === item.path;

              return (

                <Link
                  key={index}
                  to={item.path}
                >

                  <motion.div

                    whileHover={{
                      x: 8,
                    }}

                    whileTap={{
                      scale: 0.98,
                    }}

                    className={`

                      flex items-center gap-4
                      px-5 py-4 rounded-2xl
                      transition-all duration-300
                      group relative overflow-hidden

                      ${
                        active
                          ? `
                            bg-gradient-to-r
                            from-green-700
                            to-emerald-500
                            text-white
                            shadow-xl
                          `
                          : `
                            text-gray-700
                            hover:bg-green-50
                          `
                      }
                    `}
                  >

                    {/* ACTIVE GLOW */}
                    {active && (

                      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>

                    )}

                    {/* ICON */}
                    <div
                      className={`

                        relative z-10
                        text-xl p-3 rounded-xl

                        ${
                          active
                            ? "bg-white/20"
                            : "bg-green-100 text-green-700"
                        }
                      `}
                    >

                      {item.icon}

                    </div>

                    {/* TEXT */}
                    <span className="relative z-10 font-semibold text-lg">

                      {item.title}

                    </span>

                  </motion.div>

                </Link>
              );
            })}

          </div>

          {/* BOTTOM */}
          <div className="space-y-4 pb-6">

            {/* AI STATUS */}
            <div className="bg-gradient-to-br from-green-700 to-emerald-500 p-5 rounded-3xl text-white shadow-xl">

              <h2 className="font-bold text-lg">
                AI Smart Farming
              </h2>

              <p className="text-sm text-green-100 mt-2 leading-6">

                AI-powered crop intelligence,
                fertilizer prediction,
                and smart farming insights.

              </p>

            </div>

            {/* LOGOUT */}
            <motion.button

              whileHover={{
                scale: 1.03,
              }}

              whileTap={{
                scale: 0.97,
              }}

              onClick={logout}

              className="
                w-full
                bg-red-500 hover:bg-red-600
                text-white
                py-4 rounded-2xl
                font-bold
                flex items-center justify-center gap-3
                shadow-lg transition-all
              "
            >

              <FaSignOutAlt />

              Logout

            </motion.button>

          </div>

        </div>

      </motion.div>

    </>
  );
}

export default Sidebar;