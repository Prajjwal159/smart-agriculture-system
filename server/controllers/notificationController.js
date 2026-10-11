const Notification = require("../models/Notification");

// GET NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const notifications = await Notification.find({ farmerId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// MARK ONE AS READ
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// MARK ALL AS READ (for one farmer)
const markAllRead = async (req, res) => {
  try {
    const { farmerId } = req.params;
    await Notification.updateMany({ farmerId }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CLEAR ALL (delete all notifications for one farmer)
const clearAll = async (req, res) => {
  try {
    const { farmerId } = req.params;
    await Notification.deleteMany({ farmerId });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  clearAll,
};
