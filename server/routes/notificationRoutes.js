const express = require("express");
const router  = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllRead,
  clearAll,
} = require("../controllers/notificationController");

// GET all for a farmer
router.get("/:farmerId", getNotifications);

// MARK one as read
router.put("/read/:id", markAsRead);

// MARK ALL as read
router.put("/read-all/:farmerId", markAllRead);

// CLEAR ALL (delete)
router.delete("/clear-all/:farmerId", clearAll);

module.exports = router;
