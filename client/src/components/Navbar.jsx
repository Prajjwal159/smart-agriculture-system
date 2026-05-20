import React, { useState } from "react";

import { FaBell } from "react-icons/fa";

import NotificationDropdown from "./NotificationDropdown";

function Navbar() {

  const farmer = JSON.parse(
    localStorage.getItem("farmer")
  );

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  return (

    <div className="flex justify-between items-center mb-8">

      {/* LEFT */}
      <div>

        <h1 className="text-4xl font-bold text-green-900">
          Smart Agriculture Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, {farmer?.name}
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5 relative">

        {/* NOTIFICATION BUTTON */}

        {/* DROPDOWN */}
        <NotificationDropdown
          open={notificationOpen}
          setOpen={setNotificationOpen}
        />

        {/* AI BADGE */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg font-semibold">

          🌾 AI Smart Farming

        </div>

      </div>

    </div>
  );
}

export default Navbar;