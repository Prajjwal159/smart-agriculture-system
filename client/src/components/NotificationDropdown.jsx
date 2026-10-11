import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTint, FaCloudRain, FaLeaf, FaCheckCircle, FaTrashAlt, FaCheck } from "react-icons/fa";

function NotificationDropdown({ open, setOpen }) {
  const [notifications, setNotifications] = useState([]);
  const farmer = JSON.parse(localStorage.getItem("farmer"));

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${farmer._id}`);
      setNotifications(res.data);
    } catch (error) { console.log(error); }
  };

  // mark one as read
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) { console.log(error); }
  };

  // mark all as read
  const handleMarkAllRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read-all/${farmer._id}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.log(error); }
  };

  // clear all — deletes from DB
  const handleClearAll = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/clear-all/${farmer._id}`);
      setNotifications([]);
    } catch (error) { console.log(error); }
  };

  const getIcon = (title) => {
    if (title.includes("Moisture")) return <FaTint size={13} />;
    if (title.includes("Rain"))     return <FaCloudRain size={13} />;
    if (title.includes("Nitrogen")) return <FaLeaf size={13} />;
    return <FaCheckCircle size={13} />;
  };

  const getColor = (type) => {
    if (type === "warning") return { bg: "bg-orange-100", text: "text-orange-500" };
    if (type === "success") return { bg: "bg-green-100",  text: "text-green-600"  };
    if (type === "info")    return { bg: "bg-cyan-100",   text: "text-cyan-500"   };
    return { bg: "bg-emerald-100", text: "text-emerald-500" };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">

      {/* BELL BUTTON */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center hover:shadow-md transition-all duration-200"
      >
        <FaBell className="text-green-700" size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h1 className="text-sm font-bold text-green-900">Notifications</h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* mark all read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      <FaCheck size={10} /> All Read
                    </button>
                  )}
                  {/* clear all */}
                  <button
                    onClick={handleClearAll}
                    title="Clear all notifications"
                    className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-all"
                  >
                    <FaTrashAlt size={10} /> Clear All
                  </button>
                </div>
              )}
            </div>

            {/* ITEMS */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <FaBell size={28} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No notifications</p>
                  <p className="text-gray-300 text-xs mt-1">Upload a soil report to get AI alerts</p>
                </div>
              ) : (
                notifications.map((item, index) => {
                  const c = getColor(item.type);
                  return (
                    <motion.div
                      key={item._id || index}
                      whileHover={{ x: 3 }}
                      onClick={() => !item.isRead && handleMarkRead(item._id)}
                      className={`flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-all duration-200 cursor-pointer
                        ${item.isRead ? "opacity-60" : "hover:bg-green-50/50"}`}
                    >
                      {/* ICON */}
                      <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 mt-0.5`}>
                        {getIcon(item.title)}
                      </div>

                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold text-gray-800 leading-tight ${!item.isRead ? "" : "text-gray-500"}`}>
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-5">{item.message}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-400">
                  Click a notification to mark it as read
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
