const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farmer",
      },

      title: {
        type: String,
      },

      message: {
        type: String,
      },

      type: {
        type: String,
        default: "info",
      },

      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
ufygkucgbhk