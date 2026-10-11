import { useState } from "react";
import {
  FaHome, FaUser, FaUpload, FaHistory, FaRobot,
  FaLeaf, FaBars, FaTimes, FaChartLine, FaSignOutAlt,
  FaSeedling,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { title: "Dashboard",           icon: <FaHome />,      path: "/dashboard" },
    { title: "Profile",             icon: <FaUser />,      path: "/profile" },
    { title: "Upload Report",       icon: <FaUpload />,    path: "/upload" },
    { title: "Prediction History",  icon: <FaHistory />,   path: "/history" },
    { title: "AI Prediction",       icon: <FaChartLine />, path: "/prediction" },
    { title: "Fertilizer Advisor",  icon: <FaSeedling />,  path: "/fertilizer-advisor" },
    { title: "AI Assistant",        icon: <FaRobot />,     path: "/chatbot" },
    { title: "Analytics",           icon: <FaChartLine />, path: "/analytics" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("farmer");
    window.location.href = "/login";
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* ── MOBILE HAMBURGER BUTTON ── */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded-xl shadow-lg"
        aria-label="Open menu"
      >
        {open ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      {/* ── BACKDROP OVERLAY (mobile only) ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR PANEL ── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`
          fixed top-0 left-0 z-40
          h-screen w-[240px]
          bg-white/90 backdrop-blur-2xl
          border-r border-white/20
          shadow-xl
          transition-transform duration-300
          flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-700 to-emerald-500 text-white p-2.5 rounded-2xl shadow">
              <FaLeaf size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-green-900 leading-tight">Smart Agro</h1>
              <p className="text-gray-400 text-xs">AI Farming Platform</p>
            </div>
          </div>
        </div>

        {/* MENU — auto-closes sidebar on mobile when a link is clicked */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item, index) => {
            const active = location.pathname === item.path;
            return (
              <Link key={index} to={item.path} onClick={close}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3
                    px-3 py-2.5 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${active
                      ? "bg-gradient-to-r from-green-700 to-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-green-50"
                    }
                  `}
                >
                  <div className={`text-sm p-2 rounded-lg ${active ? "bg-white/20" : "bg-green-100 text-green-700"}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* BOTTOM */}
        <div className="px-3 pb-4 space-y-3">
          <div className="bg-gradient-to-br from-green-700 to-emerald-500 p-4 rounded-2xl text-white shadow">
            <h2 className="font-semibold text-sm">AI Smart Farming</h2>
            <p className="text-xs text-green-100 mt-1 leading-5">
              Fertilizer prediction &amp; smart crop insights.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all"
          >
            <FaSignOutAlt size={13} />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;
