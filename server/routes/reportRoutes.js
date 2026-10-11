const express = require("express");
const router  = express.Router();
const upload  = require("../config/multer");

const {
  uploadReport,
  getReports,
  getAnalytics,
  deleteAllReports,
} = require("../controllers/reportController");

// UPLOAD PDF
router.post("/upload", upload.single("pdf"), uploadReport);

// GET ALL REPORTS
router.get("/", getReports);

// ANALYTICS FOR A FARMER
router.get("/analytics/:farmerId", getAnalytics);

// DELETE ALL REPORTS FOR A FARMER
router.delete("/delete-all/:farmerId", deleteAllReports);

module.exports = router;
