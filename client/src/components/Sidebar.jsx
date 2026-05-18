import {
  FaHome,
  FaUser,
  FaHistory,
  FaFileUpload,
  FaRobot,
  FaLeaf,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {

  // CLEAR STORAGE
  localStorage.removeItem("token");

  localStorage.removeItem("farmer");

  // FORCE REDIRECT
  window.location.href = "/login";
};
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[270px] h-screen fixed overflow-y-auto bg-gradient-to-b from-green-900 to-green-700 text-white p-6 shadow-2xl"
    >

      {/* LOGO */}
      <div className="flex items-center gap-3 mb-12">

        <div className="bg-white text-green-700 p-3 rounded-2xl">
          <FaLeaf size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Smart Agro
          </h1>

          <p className="text-sm text-green-200">
            AI Farming Assistant
          </p>
        </div>

      </div>

      {/* MENU */}
      <ul className="space-y-5">

        <li
  onClick={() => navigate("/dashboard")}
  className="group flex items-center gap-4 bg-white/10 transition-all duration-300 px-5 py-4 rounded-2xl cursor-pointer shadow-lg"
>
  <FaHome />
  Dashboard
</li>

        <li className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer">
          <FaUser />
          Farmer Profile
        </li>

        <li
  onClick={() => navigate("/upload")}
  className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer"
>
  <FaFileUpload />
  Upload Soil Report
</li>

        <li
  onClick={() => navigate("/history")}
  className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer"
>
  <FaHistory />
  Prediction History
</li>

        <li
  onClick={() => navigate("/prediction")}
  className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer"
>
  🧠
  AI Prediction
</li>

        <li
  onClick={() => navigate("/chatbot")}
  className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer"
>
  <FaRobot />
  AI Assistant
</li>

        <li
  onClick={() => navigate("/admin")}
  className="flex items-center gap-4 hover:bg-white/10 transition-all duration-300 p-4 rounded-2xl cursor-pointer"
>
  🛠️
  Admin Panel
</li>

        <li
  onClick={handleLogout}
  className="group flex items-center gap-4 hover:bg-red-500/20 transition-all duration-300 px-5 py-4 rounded-2xl cursor-pointer mt-8 text-red-200 hover:text-white"
>
  🚪
  Logout
</li>
      </ul>

      {/* FOOTER */}
      <div className="absolute bottom-10 left-6 right-6 bg-white/10 p-5 rounded-2xl backdrop-blur-lg">

        <h2 className="font-bold mb-2">
          Smart Suggestion
        </h2>

        <p className="text-sm text-green-100 leading-6">
          Soil nitrogen levels appear slightly low.
          AI recommends balanced fertilization.
        </p>

      </div>

    </motion.div>
  );
}

export default Sidebar;