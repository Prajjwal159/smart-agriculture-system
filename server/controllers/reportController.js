const SoilReport = require("../models/SoilReport");

const axios = require("axios");

const FormData = require("form-data");

const fs = require("fs");

const Notification = require("../models/Notification");


// UPLOAD REPORT
const uploadReport = async (req, res) => {
  try {

    const { farmerId } = req.body;

    // =========================
    // OCR EXTRACTION
    // =========================

    const formData = new FormData();

    formData.append(
      "pdf",
      fs.createReadStream(req.file.path)
    );

    const ocrResponse = await axios.post(
      "http://127.0.0.1:8000/extract",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const extractedData = ocrResponse.data;


    // =========================
    // ML PREDICTION
    // =========================

    const predictionResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        temperature: 26,
        humidity: 65,

        moisture: extractedData.moisture,

        soilType: "Sandy",

        cropType: "Wheat",

        nitrogen: extractedData.nitrogen,

        potassium: extractedData.potassium,

        phosphorous: extractedData.phosphorous,
      }
    );

    const predictionData = predictionResponse.data;

    // =========================
// SMART NOTIFICATIONS
// =========================

const notifications = [];

// LOW NITROGEN
if (
  extractedData.nitrogen < 30
) {

  notifications.push({
    farmerId,

    title:
      "Low Nitrogen Alert",

    message:
      "Nitrogen level is low. Add fertilizer soon.",

    type: "warning",
  });
}

// HIGH MOISTURE
if (
  extractedData.moisture > 70
) {

  notifications.push({
    farmerId,

    title:
      "High Moisture Detected",

    message:
      "Soil moisture is very high. Prevent waterlogging.",

    type: "info",
  });
}

// GOOD SOIL
if (
  extractedData.nitrogen > 40
) {

  notifications.push({
    farmerId,

    title:
      "Healthy Soil Status",

    message:
      "Soil nutrients look balanced.",

    type: "success",
  });
}

// SAVE ALL
if (
  notifications.length > 0
) {

  await Notification.insertMany(
    notifications
  );
}


    // =========================
    // SAVE TO DATABASE
    // =========================

    const report = await SoilReport.create({

      farmerId,

      pdfFile: req.file.filename,

      reportName: req.file.originalname,

      generatedReport: predictionData.report_path,

      ...extractedData,

      recommendedNitrogenDose:
        predictionData.recommended_nitrogen_dose,

      recommendations:
        predictionData.recommendations,

      svrPrediction:
        predictionData.svr_prediction,

      nnPrediction:
        predictionData.nn_prediction,

    });


    res.status(201).json({
      message: "AI Analysis Completed",
      report,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};


// GET REPORTS
const getReports = async (req, res) => {
  try {

    const reports = await SoilReport.find()
      .sort({ createdAt: -1 });

    res.status(200).json(reports);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

// =========================
// GET ANALYTICS
// =========================

const getAnalytics =
  async (req, res) => {

    try {

      const { farmerId } =
        req.params;

      const reports =
        await SoilReport.find({
          farmerId,
        }).sort({
          createdAt: 1,
        });

      // NITROGEN TREND
      const nitrogenTrend =
        reports.map(
          (report, index) => ({

            name:
              `Report ${index + 1}`,

            nitrogen:
              report.nitrogen || 0,

            moisture:
              report.moisture || 0,

            prediction:
              report.recommendedNitrogenDose || 0,

          })
        );

      // SOIL HEALTH SCORE
      const healthScores =
        reports.map((report) => {

          const score = (

            (
              (report.nitrogen || 0) +
              (report.phosphorous || 0) +
              (report.potassium || 0) +
              (report.moisture || 0)

            ) / 4

          );

          return score;

        });

      const averageHealth =
        healthScores.length > 0

          ? (
              healthScores.reduce(
                (a, b) => a + b,
                0
              ) /
              healthScores.length
            ).toFixed(2)

          : 0;

      res.status(200).json({

        totalReports:
          reports.length,

        averageHealth,

        nitrogenTrend,

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Server Error",
      });

    }
};


module.exports = {
  uploadReport,
  getReports,
  getAnalytics,
};