const SoilReport    = require("../models/SoilReport");
const Farmer        = require("../models/Farmer");
const Notification  = require("../models/Notification");
const axios         = require("axios");
const FormData      = require("form-data");
const fs            = require("fs");

// ─── helpers ──────────────────────────────────────────────────────────────

// Map crop names from the registration form to the ML model's known crop classes
const CROP_MAP = {
  "Rice":      "Rice",
  "Paddy":     "Paddy",
  "Wheat":     "Wheat",
  "Sugarcane": "Sugarcane",
  "Cotton":    "Cotton",
  "Maize":     "Maize",
  "Millets":   "Millets",
  "Barley":    "Barley",
  "Pulses":    "Pulses",
  "Oil seeds": "Oil seeds",
  "Ground Nuts":"Ground Nuts",
  "Tobacco":   "Tobacco",
};

// Pick a realistic soil type based on Indian state or default to Loamy
const STATE_SOIL_MAP = {
  "Karnataka":       "Red",
  "Maharashtra":     "Black",
  "Andhra Pradesh":  "Red",
  "Telangana":       "Black",
  "Tamil Nadu":      "Red",
  "Gujarat":         "Black",
  "Rajasthan":       "Sandy",
  "Punjab":          "Loamy",
  "Haryana":         "Loamy",
  "Uttar Pradesh":   "Loamy",
  "Madhya Pradesh":  "Black",
  "Bihar":           "Clayey",
  "West Bengal":     "Clayey",
  "Odisha":          "Red",
  "Jharkhand":       "Red",
  "Chhattisgarh":    "Red",
  "Kerala":          "Clayey",
  "Assam":           "Clayey",
};

function getSoilTypeForFarmer(farmer) {
  if (!farmer) return "Loamy";
  const state = (farmer.state || "").trim();
  return STATE_SOIL_MAP[state] || "Loamy";
}

// Fetch live weather for farmer's district, fallback to sensible defaults
async function getWeatherForFarmer(farmer) {
  try {
    const city = farmer.district || farmer.village || farmer.state || "Bangalore";
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const res = await axios.get(url, { timeout: 4000 });
    return {
      temperature: Math.round(res.data.main.temp),
      humidity:    Math.round(res.data.main.humidity),
    };
  } catch {
    // sensible seasonal defaults if weather API fails
    return { temperature: 28, humidity: 65 };
  }
}

// ─── UPLOAD REPORT ─────────────────────────────────────────────────────────
const uploadReport = async (req, res) => {
  try {
    const { farmerId } = req.body;

    // Fetch farmer profile to get cropType, state, district
    const farmer = await Farmer.findById(farmerId);

    // Map crop type from registration to ML-known crop
    const cropType = CROP_MAP[farmer?.cropType] || "Wheat";

    // Determine soil type from farmer's state
    const soilType = getSoilTypeForFarmer(farmer);

    // Get live weather for farmer's location
    const weather = await getWeatherForFarmer(farmer);

    // ── OCR Extraction ──────────────────────────────────────────────────
    const formData = new FormData();
    formData.append("pdf", fs.createReadStream(req.file.path));

    const ocrResponse = await axios.post(
      "http://127.0.0.1:8000/extract",
      formData,
      { headers: formData.getHeaders() }
    );
    const extractedData = ocrResponse.data;

    // ── ML Prediction — now uses REAL farmer data ───────────────────────
    const predictionResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        temperature:  weather.temperature,
        humidity:     weather.humidity,
        moisture:     Number(extractedData.moisture)    || 45,
        soilType:     soilType,
        cropType:     cropType,
        nitrogen:     Number(extractedData.nitrogen)    || 10,
        potassium:    Number(extractedData.potassium)   || 5,
        phosphorous:  Number(extractedData.phosphorous) || 10,
        farmerName:   farmer?.name || "Farmer",
      }
    );
    const predictionData = predictionResponse.data;

    // ── Smart crop-aware Notifications ─────────────────────────────────
    const notifications = [];
    const N  = extractedData.nitrogen  || 0;
    const M  = extractedData.moisture  || 0;
    const P  = extractedData.phosphorous || 0;
    const K  = extractedData.potassium || 0;
    const dose = predictionData.recommended_nitrogen_dose || 0;

    // Nitrogen status
    if (N < 15) {
      notifications.push({
        farmerId,
        title:   "⚠️ Critical Nitrogen Deficiency",
        message: `Nitrogen is very low (${N} kg/ha) for your ${cropType} crop. Apply ${dose} kg/ha immediately using ${getCropFertilizer(cropType)}.`,
        type:    "warning",
      });
    } else if (N < 30) {
      notifications.push({
        farmerId,
        title:   "Low Nitrogen Alert",
        message: `Nitrogen (${N} kg/ha) is below optimal for ${cropType}. Recommended dose: ${dose} kg/ha.`,
        type:    "warning",
      });
    } else if (N > 80) {
      notifications.push({
        farmerId,
        title:   "⚠️ Nitrogen Excess Warning",
        message: `Nitrogen (${N} kg/ha) is too high for ${cropType}. Skip nitrogen fertilizer this cycle to prevent crop damage.`,
        type:    "warning",
      });
    } else {
      notifications.push({
        farmerId,
        title:   "✅ Healthy Nitrogen Status",
        message: `Nitrogen (${N} kg/ha) is in the healthy range for ${cropType}. Recommended maintenance dose: ${dose} kg/ha.`,
        type:    "success",
      });
    }

    // Moisture status
    if (M > 75) {
      notifications.push({
        farmerId,
        title:   "⚠️ Waterlogging Risk",
        message: `Soil moisture is very high (${M}%). Delay fertilizer application. Open drainage channels to prevent nutrient loss via denitrification.`,
        type:    "warning",
      });
    } else if (M < 25) {
      notifications.push({
        farmerId,
        title:   "💧 Low Moisture Alert",
        message: `Soil moisture (${M}%) is too low for ${cropType}. Irrigate before applying fertilizer — dry soil blocks nutrient uptake.`,
        type:    "info",
      });
    }

    // Phosphorous deficiency
    if (P < 10) {
      notifications.push({
        farmerId,
        title:   "Phosphorous Deficiency Detected",
        message: `Low phosphorous (${P} kg/ha) will cause poor root growth in ${cropType}. Apply DAP (18-46-0) at basal dose.`,
        type:    "info",
      });
    }

    // Potassium deficiency
    if (K < 5) {
      notifications.push({
        farmerId,
        title:   "Potassium Deficiency Detected",
        message: `Low potassium (${K} kg/ha) reduces disease resistance in ${cropType}. Apply MOP (0-0-60) at 20-30 kg/ha.`,
        type:    "info",
      });
    }

    // Weather alert
    if (weather.humidity > 80) {
      notifications.push({
        farmerId,
        title:   "🌧️ High Humidity Weather Alert",
        message: `Current humidity ${weather.humidity}% near your farm. High risk of fungal diseases for ${cropType}. Monitor crops closely.`,
        type:    "info",
      });
    }

    if (weather.temperature > 36) {
      notifications.push({
        farmerId,
        title:   "🌡️ Heat Stress Alert",
        message: `Temperature ${weather.temperature}°C near your farm. Irrigate ${cropType} during evening hours to reduce heat stress.`,
        type:    "warning",
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // ── Save to MongoDB ─────────────────────────────────────────────────
    const report = await SoilReport.create({
      farmerId,
      pdfFile:                req.file.filename,
      reportName:             req.file.originalname,
      generatedReport:        predictionData.report_path,
      ...extractedData,
      recommendedNitrogenDose: predictionData.recommended_nitrogen_dose,
      recommendations:        predictionData.recommendations,
      svrPrediction:          predictionData.svr_prediction,
      nnPrediction:           predictionData.nn_prediction,
    });

    res.status(201).json({ message: "AI Analysis Completed", report });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", detail: error.message });
  }
};

function getCropFertilizer(cropType) {
  const map = {
    "Maize": "Urea (46-0-0)", "Wheat": "Urea + DAP",
    "Paddy": "Urea (split)", "Rice": "Urea + SSP",
    "Cotton": "MOP + Urea",  "Sugarcane": "NPK 15-15-15",
    "Millets": "DAP",        "Barley": "Urea + DAP",
    "Pulses": "DAP only",    "Oil seeds": "NPK 12-32-16",
    "Ground Nuts": "DAP + Gypsum", "Tobacco": "Potassium Nitrate",
  };
  return map[cropType] || "balanced NPK fertilizer";
}

// ─── GET ALL REPORTS ───────────────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const reports = await SoilReport.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── GET ANALYTICS ─────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const reports = await SoilReport.find({ farmerId }).sort({ createdAt: 1 });

    const nitrogenTrend = reports.map((r, i) => ({
      name:       `Report ${i + 1}`,
      nitrogen:   r.nitrogen    || 0,
      moisture:   r.moisture    || 0,
      prediction: r.recommendedNitrogenDose || 0,
    }));

    const healthScores = reports.map(r =>
      ((r.nitrogen||0) + (r.phosphorous||0) + (r.potassium||0) + (r.moisture||0)) / 4
    );

    const averageHealth = healthScores.length > 0
      ? (healthScores.reduce((a, b) => a + b, 0) / healthScores.length).toFixed(2)
      : 0;

    res.status(200).json({
      totalReports: reports.length,
      averageHealth,
      nitrogenTrend,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── DELETE ALL REPORTS ────────────────────────────────────────────────────
const deleteAllReports = async (req, res) => {
  try {
    const { farmerId } = req.params;
    await SoilReport.deleteMany({ farmerId });
    res.status(200).json({ message: "All reports deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { uploadReport, getReports, getAnalytics, deleteAllReports };
