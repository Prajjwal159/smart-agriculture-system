const SoilReport    = require("../models/SoilReport");
const Farmer        = require("../models/Farmer");
const Notification  = require("../models/Notification");
const axios         = require("axios");
const FormData      = require("form-data");
const fs            = require("fs");

// ─── ML Service URL — set ML_SERVICE_URL in Render env vars for production ─
const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

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
      `${ML_URL}/extract`,
      formData,
      { headers: formData.getHeaders() }
    );
    const extractedData = ocrResponse.data;

    // ── ML Prediction — now uses REAL farmer data ───────────────────────
    const predictionResponse = await axios.post(
      `${ML_URL}/predict`,
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

// ─── GET ANALYTICS (user's own reports) ────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const reports = await SoilReport.find({ farmerId }).sort({ createdAt: 1 });

    if (reports.length === 0) {
      return res.status(200).json({
        totalReports:    0,
        averageHealth:   0,
        averageNitrogen: 0,
        averageMoisture: 0,
        averageDose:     0,
        nitrogenTrend:   [],
        moistureTrend:   [],
        yieldTrend:      [],
        fertilizerBreakdown: [],
        hasData: false,
      });
    }

    // Per-report trend (ordered chronologically, labelled by upload date)
    const nitrogenTrend = reports.map((r) => ({
      name:       new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" }),
      nitrogen:   r.nitrogen    || 0,
      phosphorous:r.phosphorous || 0,
      potassium:  r.potassium   || 0,
      moisture:   r.moisture    || 0,
      prediction: r.recommendedNitrogenDose || 0,
    }));

    // Yield progression — estimated from recommended dose (dose * 0.08 tons/ha)
    const yieldTrend = reports.map((r) => {
      const dose = r.recommendedNitrogenDose || 0;
      return {
        name:     new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" }),
        actual:   parseFloat((dose * 0.06).toFixed(2)),
        forecast: parseFloat((dose * 0.08).toFixed(2)),
      };
    });

    // Average nutrient values
    const avg = (key) =>
      reports.length ? Math.round(reports.reduce((s, r) => s + (r[key] || 0), 0) / reports.length) : 0;

    const averageNitrogen  = avg("nitrogen");
    const averageMoisture  = avg("moisture");
    const averageDose      = avg("recommendedNitrogenDose");

    // Soil health score per report
    const healthScores = reports.map(r =>
      ((r.nitrogen||0) + (r.phosphorous||0) + (r.potassium||0) + (r.moisture||0)) / 4
    );
    const averageHealth = healthScores.length
      ? (healthScores.reduce((a, b) => a + b, 0) / healthScores.length).toFixed(1)
      : 0;

    // Fertilizer breakdown — N:P:K ratio averaged across all reports
    const totalN = reports.reduce((s, r) => s + (r.nitrogen || 0), 0);
    const totalP = reports.reduce((s, r) => s + (r.phosphorous || 0), 0);
    const totalK = reports.reduce((s, r) => s + (r.potassium || 0), 0);
    const totalNPK = totalN + totalP + totalK || 1;
    const fertilizerBreakdown = [
      { name: "Nitrogen",    value: Math.round((totalN / totalNPK) * 100) },
      { name: "Phosphorous", value: Math.round((totalP / totalNPK) * 100) },
      { name: "Potassium",   value: Math.round((totalK / totalNPK) * 100) },
    ];

    // Last report's recommendations for the dashboard card
    const lastReport = reports[reports.length - 1];

    res.status(200).json({
      totalReports:       reports.length,
      averageHealth:      parseFloat(averageHealth),
      averageNitrogen,
      averageMoisture,
      averageDose,
      nitrogenTrend,
      yieldTrend,
      fertilizerBreakdown,
      lastRecommendations: lastReport?.recommendations || [],
      lastNitrogen:        lastReport?.nitrogen    || 0,
      lastPhosphorous:     lastReport?.phosphorous || 0,
      lastPotassium:       lastReport?.potassium   || 0,
      lastMoisture:        lastReport?.moisture    || 0,
      lastDose:            lastReport?.recommendedNitrogenDose || 0,
      hasData: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ─── GET DASHBOARD (location aggregate — all farmers in same district) ──────
const getDashboardStats = async (req, res) => {
  try {
    const { district } = req.params;

    // Find all farmers registered in this district
    const farmers = await Farmer.find({
      district: { $regex: new RegExp(district, "i") }
    });
    const farmerIds = farmers.map(f => f._id);

    if (farmerIds.length === 0) {
      return res.status(200).json({ hasData: false, district, totalFarmers: 0 });
    }

    // All reports from farmers in this district
    const reports = await SoilReport.find({
      farmerId: { $in: farmerIds }
    }).sort({ createdAt: 1 });

    if (reports.length === 0) {
      return res.status(200).json({ hasData: false, district, totalFarmers: farmers.length });
    }

    // Average nutrient levels across district
    const avg = (key) =>
      Math.round(reports.reduce((s, r) => s + (r[key] || 0), 0) / reports.length);

    const avgNitrogen   = avg("nitrogen");
    const avgPhosphorous= avg("phosphorous");
    const avgPotassium  = avg("potassium");
    const avgMoisture   = avg("moisture");
    const avgDose       = avg("recommendedNitrogenDose");

    // District-level soil health score
    const healthScores  = reports.map(r =>
      ((r.nitrogen||0)+(r.phosphorous||0)+(r.potassium||0)+(r.moisture||0))/4
    );
    const avgHealth = healthScores.length
      ? parseFloat((healthScores.reduce((a,b) => a+b,0)/healthScores.length).toFixed(1))
      : 0;

    // Nitrogen trend over time (group by month)
    const monthMap = {};
    reports.forEach(r => {
      const key = new Date(r.createdAt).toLocaleDateString("en-IN", { month:"short", year:"2-digit" });
      if (!monthMap[key]) monthMap[key] = { nitrogen:[], moisture:[], dose:[] };
      monthMap[key].nitrogen.push(r.nitrogen || 0);
      monthMap[key].moisture.push(r.moisture || 0);
      monthMap[key].dose.push(r.recommendedNitrogenDose || 0);
    });
    const nitrogenTrend = Object.entries(monthMap).map(([name, vals]) => ({
      name,
      nitrogen: Math.round(vals.nitrogen.reduce((a,b)=>a+b,0)/vals.nitrogen.length),
      moisture: Math.round(vals.moisture.reduce((a,b)=>a+b,0)/vals.moisture.length),
      prediction: Math.round(vals.dose.reduce((a,b)=>a+b,0)/vals.dose.length),
    }));

    // Crop type distribution
    const cropCount = {};
    farmers.forEach(f => {
      const c = f.cropType || "Unknown";
      cropCount[c] = (cropCount[c] || 0) + 1;
    });
    const cropDistribution = Object.entries(cropCount).map(([name, value]) => ({ name, value }));

    // Yield estimate trend
    const yieldTrend = nitrogenTrend.map(d => ({
      name:     d.name,
      actual:   parseFloat((d.prediction * 0.06).toFixed(2)),
      forecast: parseFloat((d.prediction * 0.08).toFixed(2)),
    }));

    // Fertilizer breakdown
    const totalN = reports.reduce((s,r)=>s+(r.nitrogen||0),0);
    const totalP = reports.reduce((s,r)=>s+(r.phosphorous||0),0);
    const totalK = reports.reduce((s,r)=>s+(r.potassium||0),0);
    const tot    = totalN+totalP+totalK || 1;
    const fertilizerBreakdown = [
      { name:"Nitrogen",    value: Math.round((totalN/tot)*100) },
      { name:"Phosphorous", value: Math.round((totalP/tot)*100) },
      { name:"Potassium",   value: Math.round((totalK/tot)*100) },
    ];

    res.status(200).json({
      hasData: true,
      district,
      totalFarmers:   farmers.length,
      totalReports:   reports.length,
      avgHealth,
      avgNitrogen,
      avgPhosphorous,
      avgPotassium,
      avgMoisture,
      avgDose,
      nitrogenTrend,
      yieldTrend,
      cropDistribution,
      fertilizerBreakdown,
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

module.exports = { uploadReport, getReports, getAnalytics, getDashboardStats, deleteAllReports };
