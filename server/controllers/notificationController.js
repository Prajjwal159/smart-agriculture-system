const Notification = require(
  "../models/Notification"
);

// GET NOTIFICATIONS
const getNotifications =
  async (req, res) => {

    try {

      const { farmerId } = req.params;

      const notifications =
        await Notification.find({
          farmerId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json(
        notifications
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });

    }
};

// MARK AS READ
const markAsRead =
  async (req, res) => {

    try {

      await Notification.findByIdAndUpdate(
        req.params.id,
        {
          isRead: true,
        }
      );

      res.status(200).json({
        message:
          "Notification read",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });

    }
};

module.exports = {
  getNotifications,
  markAsRead,
};