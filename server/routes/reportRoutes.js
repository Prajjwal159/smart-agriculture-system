const express = require("express");
const router  = express.Router();
const upload  = require("../config/multer");

const {
  uploadReport,
  getReports,
  getAnalytics,
  getDashboardStats,
  deleteAllReports,
} = require("../controllers/reportController");

// UPLOAD PDF
router.post("/upload", upload.single("pdf"), uploadReport);

// GET ALL REPORTS
router.get("/", getReports);

// USER ANALYTICS (personal — from their own reports)
router.get("/analytics/:farmerId", getAnalytics);

// DASHBOARD STATS (location aggregate — all farmers in same district)
router.get("/dashboard/:district", getDashboardStats);

// DELETE ALL REPORTS FOR A FARMER
router.delete("/delete-all/:farmerId", deleteAllReports);

module.exports = router;
