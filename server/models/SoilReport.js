const mongoose = require("mongoose");

const soilReportSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
    },

    pdfFile: {
      type: String,
      required: true,
    },

    nitrogen: Number,
    phosphorous: Number,
    potassium: Number,
    moisture: Number,
    recommendedNitrogenDose: Number,
    recommendation: String,
    svrPrediction: Number,
    nnPrediction: Number,
    recommendations: [String],

    reportName: {
      type: String,
    },

    generatedReport: {
      type: String,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SoilReport",
  soilReportSchema
);