const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markAsRead,
} = require(
  "../controllers/notificationController"
);

// GET
router.get(
  "/:farmerId",
  getNotifications
);

// MARK READ
router.put(
  "/read/:id",
  markAsRead
);

module.exports = router;