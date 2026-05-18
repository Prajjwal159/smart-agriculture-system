const SoilReport = require("../models/SoilReport");

const axios = require("axios");

const FormData = require("form-data");

const fs = require("fs");


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


module.exports = {
  uploadReport,
  getReports,
};