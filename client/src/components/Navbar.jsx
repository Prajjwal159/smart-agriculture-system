import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const farmer = JSON.parse(localStorage.getItem("farmer"));
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    /* pl-12 on mobile gives space for the hamburger button (fixed top-4 left-4) */
    <div className="flex justify-between items-center mb-5 pl-12 lg:pl-0">

      {/* LEFT */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold text-green-900 truncate">
          Smart Agriculture Dashboard
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">
          Welcome back, {farmer?.name}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3 relative shrink-0 ml-3">
        <NotificationDropdown
          open={notificationOpen}
          setOpen={setNotificationOpen}
        />
        {/* Badge hidden on small screens to save space */}
        <div className="hidden sm:flex bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 sm:px-4 py-2 rounded-xl shadow text-xs sm:text-sm font-semibold whitespace-nowrap">
          🌾 AI Smart Farming
        </div>
      </div>

    </div>
  );
}

export default Navbar;
