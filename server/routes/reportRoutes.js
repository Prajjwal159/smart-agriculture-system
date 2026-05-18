const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const {
  uploadReport,
  getReports,
} = require("../controllers/reportController");


// UPLOAD PDF
router.post(
  "/upload",
  upload.single("pdf"),
  uploadReport
);


// GET REPORTS
router.get("/", getReports);


module.exports = router;