"""
app.py — Smart Agriculture ML Service
Flask API with crop-aware, soil-aware intelligent recommendation engine.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ocr import extract_soil_data
from generate_report import generate_ai_report
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# ── Load models ────────────────────────────────────────────────────────────
svr_model   = joblib.load("models/svr_model.pkl")
nn_model    = joblib.load("models/nn_model.pkl")
scaler      = joblib.load("models/scaler.pkl")
soil_encoder = joblib.load("models/soil_encoder.pkl")
crop_encoder = joblib.load("models/crop_encoder.pkl")

# ── Agronomic knowledge base ───────────────────────────────────────────────
# Optimal ranges: (N_min, N_optimal, N_max, P_min, P_opt, P_max, K_min, K_opt, K_max)
CROP_KNOWLEDGE = {
    "Maize": {
        "N": (40, 120, 160), "P": (20, 60, 80), "K": (10, 40, 60),
        "moisture": (45, 65), "temp": (18, 32),
        "fertilizer": "Urea (46-0-0) or CAN (27-0-0)",
        "split": "Apply 1/3 at sowing, 1/3 at knee-high, 1/3 at tasselling",
        "disease_risk": "Watch for Northern Corn Leaf Blight above 80% humidity",
        "note": "Maize is the highest nitrogen-demanding cereal. Sandy soils require split applications to prevent leaching.",
    },
    "Wheat": {
        "N": (30, 90, 130), "P": (15, 50, 70), "K": (8, 30, 50),
        "moisture": (40, 60), "temp": (12, 25),
        "fertilizer": "Urea + DAP blend recommended",
        "split": "50% at basal, 25% at tillering (21 days), 25% at jointing (42 days)",
        "disease_risk": "High humidity >75% increases rust and powdery mildew risk",
        "note": "Wheat responds strongly to nitrogen timing. Late application reduces grain quality.",
    },
    "Paddy": {
        "N": (25, 80, 120), "P": (10, 40, 60), "K": (5, 25, 40),
        "moisture": (55, 85), "temp": (22, 35),
        "fertilizer": "Urea split — avoid single basal application",
        "split": "1/3 at transplanting, 1/3 at tillering, 1/3 at panicle initiation",
        "disease_risk": "Waterlogging >85% moisture promotes blast and brown spot",
        "note": "Paddy fixes atmospheric nitrogen partially via blue-green algae. Avoid excess N which lodges the crop.",
    },
    "Rice": {
        "N": (25, 75, 110), "P": (10, 38, 55), "K": (5, 22, 38),
        "moisture": (55, 85), "temp": (22, 35),
        "fertilizer": "Urea + SSP (Single Super Phosphate)",
        "split": "1/3 at transplanting, 2/3 split at tillering & panicle initiation",
        "disease_risk": "Blast fungus risk rises sharply above 85% humidity",
        "note": "Similar to Paddy. Zinc deficiency common in rice — consider ZnSO4 at 25 kg/ha.",
    },
    "Cotton": {
        "N": (20, 65, 100), "P": (10, 40, 60), "K": (8, 30, 50),
        "moisture": (40, 65), "temp": (22, 38),
        "fertilizer": "MOP (Muriate of Potash) is critical for cotton fibre quality",
        "split": "25% at sowing, 25% at squaring, 25% at flowering, 25% at boll formation",
        "disease_risk": "High moisture promotes boll rot. Ensure field drainage.",
        "note": "Cotton requires potassium as much as nitrogen for fibre strength. Never skip K fertilizer.",
    },
    "Sugarcane": {
        "N": (20, 70, 110), "P": (10, 40, 55), "K": (10, 50, 80),
        "moisture": (50, 75), "temp": (25, 38),
        "fertilizer": "NPK 15-15-15 complex fertilizer at planting, Urea top-dressing",
        "split": "1/3 at planting, 1/3 at 45 days, 1/3 at 90 days",
        "disease_risk": "Red rot disease risk increases in waterlogged soils",
        "note": "Sugarcane is a long-duration crop (12 months). Potassium drives sucrose accumulation — critical near harvest.",
    },
    "Millets": {
        "N": (10, 35, 60), "P": (5, 20, 35), "K": (4, 15, 25),
        "moisture": (30, 55), "temp": (26, 36),
        "fertilizer": "DAP (18-46-0) at sowing + small Urea top-dress",
        "split": "50% at sowing, 50% at 25-30 days",
        "disease_risk": "Downy mildew risk in humid conditions",
        "note": "Millets are drought-tolerant. Over-fertilizing causes excessive vegetative growth at the cost of grain.",
    },
    "Barley": {
        "N": (20, 65, 95), "P": (10, 35, 55), "K": (5, 20, 35),
        "moisture": (35, 55), "temp": (10, 24),
        "fertilizer": "Urea + DAP blend",
        "split": "60% at basal, 40% at first irrigation (20-25 days)",
        "disease_risk": "Loose smut and powdery mildew in cool humid conditions",
        "note": "Barley for malting requires moderate N. Excess N raises protein, lowering malting quality.",
    },
    "Pulses": {
        "N": (0, 15, 30), "P": (10, 40, 60), "K": (5, 20, 35),
        "moisture": (35, 60), "temp": (18, 30),
        "fertilizer": "DAP at sowing for P and K. Minimal N — crop fixes own nitrogen",
        "split": "Apply only starter N (10-15 kg/ha) at sowing. No top-dress needed.",
        "disease_risk": "Root rot in waterlogged conditions. Ensure well-drained soil.",
        "note": "Pulses (legumes) fix atmospheric nitrogen via Rhizobium. Excess N inhibits nodule formation — apply very little.",
    },
    "Oil seeds": {
        "N": (10, 40, 65), "P": (10, 35, 55), "K": (5, 20, 35),
        "moisture": (35, 60), "temp": (20, 32),
        "fertilizer": "NPK 12-32-16 complex at sowing, Urea top-dress at branching",
        "split": "50% at sowing, 50% at branching stage",
        "disease_risk": "Alternaria leaf blight in humid conditions",
        "note": "Sulphur is critical for oilseeds — consider Ammonium Sulphate instead of plain Urea for combined N+S.",
    },
    "Ground Nuts": {
        "N": (5, 20, 35), "P": (15, 45, 65), "K": (10, 30, 50),
        "moisture": (40, 65), "temp": (22, 35),
        "fertilizer": "DAP + Gypsum (CaSO4) at pegging stage is essential",
        "split": "Apply DAP at sowing, Gypsum at 40 days (pegging)",
        "disease_risk": "Aflatoxin contamination risk in drought stress — maintain moisture",
        "note": "Groundnut is a legume — needs very little N. Calcium via Gypsum at pegging is the most critical input.",
    },
    "Tobacco": {
        "N": (20, 60, 90), "P": (10, 40, 60), "K": (15, 60, 90),
        "moisture": (40, 65), "temp": (20, 32),
        "fertilizer": "Potassium Nitrate (KNO3) preferred — chloride-free K sources only",
        "split": "1/3 at transplanting, 1/3 at 3 weeks, 1/3 at 6 weeks",
        "disease_risk": "Mosaic virus in aphid-prone conditions. Monitor insects.",
        "note": "Tobacco quality depends heavily on K:N ratio. High K improves burning quality. Never use MOP (chloride damages leaf).",
    },
}

SOIL_KNOWLEDGE = {
    "Sandy": {
        "desc": "Sandy soil has low water and nutrient retention. Fertilizers leach quickly.",
        "advice": "Apply fertilizers in smaller, more frequent doses. Consider drip fertigation. Organic matter additions (compost) critical.",
        "organic": "Add farmyard manure (FYM) at 10-15 tonnes/ha to improve water holding.",
    },
    "Red": {
        "desc": "Red soil is low in nitrogen and organic matter but moderate in drainage.",
        "advice": "Iron and phosphorous fixation is common. Use acidulated phosphate fertilizers. Regular liming may be needed.",
        "organic": "Green manure crops like Dhaincha before planting improve N naturally.",
    },
    "Loamy": {
        "desc": "Loamy soil is ideal — good drainage, good water retention, good nutrient holding.",
        "advice": "Standard fertilizer schedules work well. Maintain organic matter above 1.5%.",
        "organic": "Annual FYM application of 5-8 tonnes/ha maintains soil structure.",
    },
    "Clayey": {
        "desc": "Clayey soil retains nutrients and water well but can waterlog and compact.",
        "advice": "Reduce fertilizer dose by 10-15% — nutrients stay available longer. Ensure drainage channels. Avoid over-irrigation.",
        "organic": "Incorporate crop residues to improve aeration and prevent compaction.",
    },
    "Black": {
        "desc": "Black cotton soil (Vertisol) is naturally rich in Ca, Mg, K. High shrink-swell.",
        "advice": "Reduce N dose by 15-20% — natural fertility is high. Avoid cultivation when wet. Good for cotton and soybean.",
        "organic": "Minimal organic matter needed — soil self-mulches. Focus on drainage management.",
    },
}

# ── OCR Extraction endpoint ─────────────────────────────────────────────────
@app.route("/extract", methods=["POST"])
def extract_data():
    try:
        file = request.files["pdf"]
        file_path = file.filename
        file.save(file_path)
        extracted_data = extract_soil_data(file_path)
        return jsonify(extracted_data)
    except Exception as e:
        return jsonify({"error": str(e)})


# ── Prediction endpoint ─────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        crop_type = data.get("cropType", "Wheat")
        soil_type = data.get("soilType", "Loamy")
        temp      = float(data.get("temperature", 28))
        humidity  = float(data.get("humidity", 60))
        moisture  = float(data.get("moisture", 45))
        nitrogen  = float(data.get("nitrogen", 20))
        potassium = float(data.get("potassium", 10))
        phosphorous = float(data.get("phosphorous", 15))

        # ── Encode ────────────────────────────────────────────────────────
        known_soils = list(soil_encoder.classes_)
        known_crops = list(crop_encoder.classes_)

        soil_input = soil_type if soil_type in known_soils else "Loamy"
        crop_input = crop_type if crop_type in known_crops else "Wheat"

        soil_enc = soil_encoder.transform([soil_input])[0]
        crop_enc = crop_encoder.transform([crop_input])[0]

        input_df = pd.DataFrame([{
            "Temparature": temp,
            "Humidity ":   humidity,
            "Moisture":    moisture,
            "Soil Type":   soil_enc,
            "Crop Type":   crop_enc,
            "Nitrogen":    nitrogen,
            "Potassium":   potassium,
            "Phosphorous": phosphorous,
        }])

        scaled_data  = scaler.transform(input_df)
        svr_raw      = float(svr_model.predict(scaled_data)[0])
        nn_raw       = float(nn_model.predict(scaled_data)[0])

        # Clamp — dose can't be negative or > 180 kg/ha
        svr_prediction = round(max(0.0, min(180.0, svr_raw)), 2)
        nn_prediction  = round(max(0.0, min(180.0, nn_raw)),  2)

        # Final dose = weighted average (NN 65%, SVR 35%) + round to 1 dp
        final_dose = round(0.65 * nn_prediction + 0.35 * svr_prediction, 1)

        # ── Fetch knowledge base ──────────────────────────────────────────
        ck = CROP_KNOWLEDGE.get(crop_type, CROP_KNOWLEDGE["Wheat"])
        sk = SOIL_KNOWLEDGE.get(soil_type, SOIL_KNOWLEDGE["Loamy"])

        N_min, N_opt, N_max = ck["N"]
        P_min, P_opt, P_max = ck["P"]
        K_min, K_opt, K_max = ck["K"]
        m_min, m_max        = ck["moisture"]
        t_min, t_max        = ck["temp"]

        # ── Build intelligent recommendations ────────────────────────────
        recs = []

        # 1. Overall dose context
        if final_dose < 10:
            recs.append(
                f"Soil nitrogen is close to optimal for {crop_type}. "
                f"Only a starter dose of {final_dose} kg/ha is needed. "
                f"Excess N will cause excessive vegetative growth."
            )
        elif final_dose < 40:
            recs.append(
                f"{crop_type} on {soil_type} soil needs a moderate nitrogen application "
                f"of {final_dose} kg/ha. {ck['split']}."
            )
        elif final_dose < 90:
            recs.append(
                f"{crop_type} has a significant nitrogen deficit. "
                f"Apply {final_dose} kg/ha using {ck['fertilizer']}. "
                f"{ck['split']}."
            )
        else:
            recs.append(
                f"High nitrogen demand detected for {crop_type} on {soil_type} soil. "
                f"Recommended dose is {final_dose} kg/ha — apply in splits to prevent loss. "
                f"{ck['split']}."
            )

        # 2. Current nitrogen status
        if nitrogen < N_min:
            recs.append(
                f"⚠️ Soil nitrogen ({nitrogen} kg/ha) is BELOW the minimum required range "
                f"({N_min}–{N_opt} kg/ha) for {crop_type}. "
                f"Deficiency will cause yellowing of lower leaves and stunted growth. "
                f"Apply {ck['fertilizer']} immediately."
            )
        elif nitrogen > N_max:
            recs.append(
                f"⚠️ Soil nitrogen ({nitrogen} kg/ha) EXCEEDS the safe maximum ({N_max} kg/ha) "
                f"for {crop_type}. Over-application causes excessive leaf growth, lodging, "
                f"delayed maturity and groundwater contamination. Skip nitrogen this cycle."
            )
        else:
            recs.append(
                f"✅ Current soil nitrogen ({nitrogen} kg/ha) is within the acceptable range "
                f"for {crop_type} ({N_min}–{N_max} kg/ha). Maintain this level with targeted top-dressing."
            )

        # 3. Phosphorous analysis
        if phosphorous < P_min:
            recs.append(
                f"Phosphorous deficiency detected ({phosphorous} kg/ha vs optimal {P_opt} kg/ha "
                f"for {crop_type}). Apply DAP (18-46-0) or SSP at basal dose. "
                f"Low P causes poor root development and delayed flowering."
            )
        elif phosphorous > P_max:
            recs.append(
                f"Phosphorous is excessive ({phosphorous} kg/ha). This locks out Zinc and Iron. "
                f"Skip P fertilizers this season. Consider a soil test before the next crop."
            )
        else:
            recs.append(
                f"Phosphorous levels are adequate ({phosphorous} kg/ha) for {crop_type}. "
                f"A maintenance dose of {round(P_opt * 0.3)} kg/ha at sowing will sustain productivity."
            )

        # 4. Potassium analysis
        if potassium < K_min:
            recs.append(
                f"Potassium is low ({potassium} kg/ha) for {crop_type} — optimal is {K_opt} kg/ha. "
                f"Apply MOP (60% K2O) at {round(K_opt * 0.5)} kg/ha. "
                f"Low K reduces disease resistance and grain/fruit quality."
            )
        elif potassium > K_max:
            recs.append(
                f"Potassium level ({potassium} kg/ha) is above optimal for {crop_type}. "
                f"Excess K can antagonise Magnesium and Calcium uptake. Reduce K input next season."
            )
        else:
            recs.append(
                f"Potassium is in the optimal range ({potassium} kg/ha) for {crop_type}. "
                f"Maintain with {round(K_opt * 0.25)} kg/ha MOP at mid-season."
            )

        # 5. Soil-specific advice
        recs.append(f"🌱 Soil ({soil_type}): {sk['desc']} {sk['advice']}")

        # 6. Moisture analysis
        if moisture < m_min:
            recs.append(
                f"💧 Soil moisture ({moisture}%) is BELOW the optimal range ({m_min}–{m_max}%) "
                f"for {crop_type}. Irrigate immediately — dry soil reduces fertilizer uptake by up to 40%. "
                f"Apply drip or furrow irrigation before fertilizer application."
            )
        elif moisture > m_max:
            recs.append(
                f"⚠️ Soil moisture ({moisture}%) EXCEEDS the safe range for {crop_type} ({m_min}–{m_max}%). "
                f"Waterlogging promotes denitrification — nitrogen escapes as gas. "
                f"Delay fertilizer application until soil drains. Open drainage channels."
            )
        else:
            recs.append(
                f"✅ Soil moisture ({moisture}%) is ideal for {crop_type} nutrient uptake. "
                f"Good conditions for fertilizer application."
            )

        # 7. Temperature analysis
        if temp > t_max + 3:
            recs.append(
                f"🌡️ Temperature ({temp}°C) exceeds the comfort zone for {crop_type} ({t_min}–{t_max}°C). "
                f"Heat stress reduces nitrogen use efficiency. Irrigate during evening hours. "
                f"Consider mulching to reduce soil temperature."
            )
        elif temp < t_min - 3:
            recs.append(
                f"🌡️ Low temperature ({temp}°C) below optimal for {crop_type} ({t_min}–{t_max}°C). "
                f"Cold slows microbial activity and nutrient release. Delay top-dressing until "
                f"temperature rises above {t_min}°C."
            )
        else:
            recs.append(
                f"✅ Temperature ({temp}°C) is within the optimal range for {crop_type} growth. "
                f"Good conditions for nutrient uptake."
            )

        # 8. Humidity / disease risk
        if humidity > 80:
            recs.append(
                f"⚠️ High humidity ({humidity}%). {ck['disease_risk']}. "
                f"Consider preventive fungicide application and ensure crop canopy airflow."
            )
        elif humidity < 45:
            recs.append(
                f"Low humidity ({humidity}%) increases transpiration stress on {crop_type}. "
                f"Ensure regular irrigation and consider anti-transpirant spray in extreme cases."
            )
        else:
            recs.append(
                f"Humidity ({humidity}%) is within a healthy range. Monitor weekly for early disease signs."
            )

        # 9. Crop-specific expert note
        recs.append(f"📋 Expert Note: {ck['note']}")

        # 10. Organic matter recommendation
        recs.append(f"🌿 Organic Farming Tip: {sk['organic']}")

        # ── Generate AI PDF report ────────────────────────────────────────
        farmer_name = data.get("farmerName", "Farmer")
        report_path = generate_ai_report({
            "farmer_name":      farmer_name,
            "crop_type":        crop_type,
            "soil_type":        soil_type,
            "temperature":      temp,
            "humidity":         humidity,
            "moisture":         moisture,
            "nitrogen":         nitrogen,
            "phosphorous":      phosphorous,
            "potassium":        potassium,
            "recommended_dose": final_dose,
            "svr_prediction":   svr_prediction,
            "nn_prediction":    nn_prediction,
            "recommendations":  recs,
            "fertilizer":       ck["fertilizer"],
            "split_plan":       ck["split"],
            "soil_advice":      sk["advice"],
            "disease_risk":     ck["disease_risk"],
            "expert_note":      ck["note"],
            "N_optimal":        N_opt,
            "P_optimal":        P_opt,
            "K_optimal":        K_opt,
        })

        return jsonify({
            "svr_prediction":           svr_prediction,
            "nn_prediction":            nn_prediction,
            "recommended_nitrogen_dose": final_dose,
            "recommendations":          recs,
            "report_path":              report_path,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)})


# ═══════════════════════════════════════════════════════════════════════════
# FERTILIZER ADVISORY ENGINE  —  5-step professional recommendation
# ═══════════════════════════════════════════════════════════════════════════

# ── 1. Authoritative N-P-K requirements per crop per growth stage (kg/ha) ──
#    Source: ICAR (Indian Council of Agricultural Research) crop-wise
#    fertilizer recommendations + FAO crop nutrition guidelines.
ADVISORY_DB = {
    "Wheat": {
        "stages": ["Land Preparation", "Sowing", "Tillering (21 days)", "Jointing (42 days)", "Heading"],
        "requirements": {
            # (N_total, P_total, K_total) kg/ha for the full season
            # split fractions per stage: N, P, K
            "Land Preparation": {"N": 0,    "P": 0,    "K": 0,    "note": "Deep plough 20-25 cm. Level field."},
            "Sowing":           {"N": 0.50, "P": 1.00, "K": 1.00, "note": "Apply full P & K + 50% N as basal at sowing."},
            "Tillering (21 days)": {"N": 0.25, "P": 0, "K": 0,   "note": "Top-dress 25% N at first irrigation (Crown Root Initiation)."},
            "Jointing (42 days)": {"N": 0.25,  "P": 0, "K": 0,   "note": "Final 25% N top-dress. Avoid late application — reduces grain quality."},
            "Heading":          {"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Monitor for rust and aphids."},
        },
        "season_total": {"N": 120, "P": 60, "K": 40},   # kg/ha full season
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-IIWBR (Indian Institute of Wheat and Barley Research)",
        "authority_url": "https://www.iiwbr.icar.gov.in/",
    },
    "Paddy": {
        "stages": ["Nursery", "Transplanting", "Tillering (15 days)", "Panicle Initiation", "Grain Filling"],
        "requirements": {
            "Nursery":              {"N": 0,    "P": 0,    "K": 0,    "note": "Raise nursery. Apply 10 kg N/ha in nursery bed."},
            "Transplanting":        {"N": 0.33, "P": 1.00, "K": 1.00, "note": "1/3 N + full P + full K at transplanting as basal."},
            "Tillering (15 days)":  {"N": 0.33, "P": 0,    "K": 0,    "note": "1/3 N top-dress at active tillering (15-20 DAT)."},
            "Panicle Initiation":   {"N": 0.34, "P": 0,    "K": 0,    "note": "Final 1/3 N at panicle initiation. Critical stage."},
            "Grain Filling":        {"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Maintain 5 cm water level."},
        },
        "season_total": {"N": 100, "P": 50, "K": 50},
        "pH_range": (5.5, 7.0),
        "authority": "ICAR-NRRI (National Rice Research Institute)",
        "authority_url": "https://www.nrri.nic.in/",
    },
    "Rice": {
        "stages": ["Nursery", "Transplanting", "Tillering (15 days)", "Panicle Initiation", "Grain Filling"],
        "requirements": {
            "Nursery":              {"N": 0,    "P": 0,    "K": 0,    "note": "Prepare nursery bed. Pre-germinate seeds."},
            "Transplanting":        {"N": 0.33, "P": 1.00, "K": 1.00, "note": "Basal dose — 1/3 N, full P and K."},
            "Tillering (15 days)":  {"N": 0.33, "P": 0,    "K": 0,    "note": "1/3 N top-dress at tillering. Apply in standing water."},
            "Panicle Initiation":   {"N": 0.34, "P": 0,    "K": 0,    "note": "Final 1/3 N. Do not apply late — causes lodging."},
            "Grain Filling":        {"N": 0,    "P": 0,    "K": 0,    "note": "Drain field 10 days before harvest."},
        },
        "season_total": {"N": 90,  "P": 45, "K": 45},
        "pH_range": (5.5, 7.0),
        "authority": "ICAR-NRRI (National Rice Research Institute)",
        "authority_url": "https://www.nrri.nic.in/",
    },
    "Maize": {
        "stages": ["Land Preparation", "Sowing", "Knee-High (30 days)", "Tasselling (55 days)", "Grain Filling"],
        "requirements": {
            "Land Preparation":   {"N": 0,    "P": 0,    "K": 0,    "note": "Deep plough. Apply 10-15 t/ha FYM."},
            "Sowing":             {"N": 0.33, "P": 1.00, "K": 1.00, "note": "1/3 N + full P + full K as basal at sowing."},
            "Knee-High (30 days)":{"N": 0.33, "P": 0,    "K": 0,    "note": "1/3 N side-dress. Critical for ear size."},
            "Tasselling (55 days)":{"N": 0.34,"P": 0,    "K": 0,    "note": "Final 1/3 N. Ensure adequate moisture for uptake."},
            "Grain Filling":      {"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Maintain moisture."},
        },
        "season_total": {"N": 150, "P": 70, "K": 60},
        "pH_range": (5.8, 7.0),
        "authority": "ICAR-IIMR (Indian Institute of Maize Research)",
        "authority_url": "https://www.iimr.icar.gov.in/",
    },
    "Cotton": {
        "stages": ["Land Preparation", "Sowing", "Squaring (30 days)", "Flowering (60 days)", "Boll Formation (90 days)"],
        "requirements": {
            "Land Preparation":      {"N": 0,    "P": 0,    "K": 0,    "note": "Deep plough. Cotton prefers well-drained soil."},
            "Sowing":                {"N": 0.25, "P": 1.00, "K": 1.00, "note": "25% N + full P + full K at sowing."},
            "Squaring (30 days)":    {"N": 0.25, "P": 0,    "K": 0,    "note": "25% N top-dress. Monitor for jassids."},
            "Flowering (60 days)":   {"N": 0.25, "P": 0,    "K": 0,    "note": "25% N. Critical for boll setting. Apply K if deficient."},
            "Boll Formation (90 days)":{"N":0.25,"P": 0,    "K": 0,    "note": "Final 25% N. Stop irrigation 3 weeks before harvest."},
        },
        "season_total": {"N": 100, "P": 50, "K": 50},
        "pH_range": (6.0, 8.0),
        "authority": "ICAR-CICR (Central Institute for Cotton Research)",
        "authority_url": "https://www.cicr.org.in/",
    },
    "Sugarcane": {
        "stages": ["Land Preparation", "Planting", "45 Days", "90 Days", "Grand Growth (5-9 months)"],
        "requirements": {
            "Land Preparation":         {"N": 0,    "P": 0,    "K": 0,    "note": "Deep plough 45-50 cm. Apply 25 t/ha compost."},
            "Planting":                 {"N": 0.33, "P": 1.00, "K": 1.00, "note": "1/3 N + full P + full K in furrows at planting."},
            "45 Days":                  {"N": 0.33, "P": 0,    "K": 0,    "note": "1/3 N top-dress. Earth-up rows."},
            "90 Days":                  {"N": 0.34, "P": 0,    "K": 0,    "note": "Final 1/3 N + supplemental K if needed."},
            "Grand Growth (5-9 months)":{"N": 0,    "P": 0,    "K": 0,    "note": "Irrigation management critical. No fertilizer."},
        },
        "season_total": {"N": 250, "P": 85, "K": 115},
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-SBI (Sugarcane Breeding Institute)",
        "authority_url": "https://www.sugarcane.res.in/",
    },
    "Millets": {
        "stages": ["Land Preparation", "Sowing", "Tillering (25 days)", "Panicle Emergence"],
        "requirements": {
            "Land Preparation":   {"N": 0,    "P": 0,    "K": 0,    "note": "Shallow plough. Millets need good drainage."},
            "Sowing":             {"N": 0.50, "P": 1.00, "K": 1.00, "note": "50% N + full P + full K at sowing."},
            "Tillering (25 days)":{"N": 0.50, "P": 0,    "K": 0,    "note": "Remaining 50% N top-dress."},
            "Panicle Emergence":  {"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Monitor for shoot fly."},
        },
        "season_total": {"N": 60,  "P": 30, "K": 20},
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-IIMR (Indian Institute of Millets Research)",
        "authority_url": "https://www.millets.res.in/",
    },
    "Barley": {
        "stages": ["Land Preparation", "Sowing", "Tillering (21 days)", "Jointing (40 days)"],
        "requirements": {
            "Land Preparation":   {"N": 0,    "P": 0,    "K": 0,    "note": "Prepare fine seedbed. Barley needs firm seedbed."},
            "Sowing":             {"N": 0.60, "P": 1.00, "K": 1.00, "note": "60% N + full P + full K at sowing."},
            "Tillering (21 days)":{"N": 0.40, "P": 0,    "K": 0,    "note": "40% N top-dress at first irrigation."},
            "Jointing (40 days)": {"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Monitor for loose smut."},
        },
        "season_total": {"N": 80,  "P": 40, "K": 30},
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-IIWBR (Indian Institute of Wheat and Barley Research)",
        "authority_url": "https://www.iiwbr.icar.gov.in/",
    },
    "Pulses": {
        "stages": ["Land Preparation", "Sowing", "Flowering (35 days)", "Pod Development"],
        "requirements": {
            "Land Preparation":  {"N": 0,    "P": 0,    "K": 0,    "note": "Rhizobium inoculant seed treatment is critical."},
            "Sowing":            {"N": 0,    "P": 1.00, "K": 1.00, "note": "Starter dose only — 15-20 kg N/ha. Full P and K."},
            "Flowering (35 days)":{"N": 0,   "P": 0,    "K": 0,    "note": "No nitrogen. Legumes fix own N. Monitor pod borer."},
            "Pod Development":   {"N": 0,    "P": 0,    "K": 0,    "note": "Foliar spray of 2% DAP at pod fill if needed."},
        },
        "season_total": {"N": 20,  "P": 50, "K": 30},
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-IIPR (Indian Institute of Pulses Research)",
        "authority_url": "https://www.iipr.res.in/",
    },
    "Ground Nuts": {
        "stages": ["Land Preparation", "Sowing", "Flowering (30 days)", "Pegging (40 days)", "Pod Development"],
        "requirements": {
            "Land Preparation":  {"N": 0,    "P": 0,    "K": 0,    "note": "Incorporate gypsum 500 kg/ha at land prep."},
            "Sowing":            {"N": 0,    "P": 1.00, "K": 1.00, "note": "Starter 15-20 kg N/ha + full P + full K. Rhizobium inoculant."},
            "Flowering (30 days)":{"N": 0,   "P": 0,    "K": 0,    "note": "No N. Begin monitoring for tikka disease."},
            "Pegging (40 days)": {"N": 0,    "P": 0,    "K": 0,    "note": "CRITICAL — apply Gypsum 250 kg/ha. Calcium for pod fill."},
            "Pod Development":   {"N": 0,    "P": 0,    "K": 0,    "note": "Maintain soil moisture for pod fill. No lodging."},
        },
        "season_total": {"N": 20,  "P": 60, "K": 40},
        "pH_range": (6.0, 7.0),
        "authority": "ICAR-NRCG (National Research Centre for Groundnut)",
        "authority_url": "https://www.nrcg.res.in/",
    },
    "Oil seeds": {
        "stages": ["Land Preparation", "Sowing", "Branching (25 days)", "Flowering (45 days)"],
        "requirements": {
            "Land Preparation":   {"N": 0,    "P": 0,    "K": 0,    "note": "Fine seedbed. Apply sulphur 30 kg/ha (oilseeds need S)."},
            "Sowing":             {"N": 0.50, "P": 1.00, "K": 1.00, "note": "50% N + full P + full K. Use Ammonium Sulphate for N+S."},
            "Branching (25 days)":{"N": 0.50, "P": 0,    "K": 0,    "note": "50% N top-dress. Boron spray (0.2% Borax) at branching."},
            "Flowering (45 days)":{"N": 0,    "P": 0,    "K": 0,    "note": "No fertilizer. Ensure bee activity for pollination."},
        },
        "season_total": {"N": 60,  "P": 40, "K": 30},
        "pH_range": (6.0, 7.5),
        "authority": "ICAR-IIOR (Indian Institute of Oilseeds Research)",
        "authority_url": "https://www.iiorindia.org/",
    },
    "Tobacco": {
        "stages": ["Nursery", "Transplanting", "3 Weeks After Transplant", "6 Weeks After Transplant"],
        "requirements": {
            "Nursery":                      {"N": 0,    "P": 0,    "K": 0,    "note": "Nursery bed preparation. Soil sterilization."},
            "Transplanting":                {"N": 0.33, "P": 1.00, "K": 1.00, "note": "1/3 N + full P + full K at transplanting."},
            "3 Weeks After Transplant":     {"N": 0.33, "P": 0,    "K": 0,    "note": "1/3 N. Use KNO3 — chloride damages leaf quality."},
            "6 Weeks After Transplant":     {"N": 0.34, "P": 0,    "K": 0,    "note": "Final 1/3 N. Stop fertilizer at topping."},
        },
        "season_total": {"N": 90,  "P": 40, "K": 90},
        "pH_range": (5.5, 6.5),
        "authority": "ICAR-CTRI (Central Tobacco Research Institute)",
        "authority_url": "https://www.ctri.icar.gov.in/",
    },
}

# ── 2. Fertilizer products database — real products available in India ──────
#    N%, P2O5%, K2O%  (standard nutrient composition)
FERTILIZER_PRODUCTS = {
    "Urea (46-0-0)": {
        "N": 46.0, "P": 0.0, "K": 0.0,
        "price_per_bag": 266,   # MRP per 45 kg bag (govt. price 2024)
        "bag_size_kg": 45,
        "description": "Most common nitrogen fertilizer. 46% N. Apply in 2-3 splits.",
        "search_name": "Urea fertilizer 45kg",
    },
    "DAP (18-46-0)": {
        "N": 18.0, "P": 46.0, "K": 0.0,
        "price_per_bag": 1350,  # MRP per 50 kg bag
        "bag_size_kg": 50,
        "description": "Di-Ammonium Phosphate. Best basal phosphorous source. Also provides N.",
        "search_name": "DAP fertilizer 50kg",
    },
    "MOP (0-0-60)": {
        "N": 0.0, "P": 0.0, "K": 60.0,
        "price_per_bag": 900,   # MRP per 50 kg bag
        "bag_size_kg": 50,
        "description": "Muriate of Potash. 60% K2O. Primary potassium source. Avoid for tobacco.",
        "search_name": "MOP potash fertilizer 50kg",
    },
    "NPK 15-15-15": {
        "N": 15.0, "P": 15.0, "K": 15.0,
        "price_per_bag": 1470,  # MRP per 50 kg bag
        "bag_size_kg": 50,
        "description": "Balanced complex fertilizer. Good for basal application on most crops.",
        "search_name": "NPK 15-15-15 complex fertilizer 50kg",
    },
    "SSP (0-16-0)": {
        "N": 0.0, "P": 16.0, "K": 0.0,
        "price_per_bag": 420,   # MRP per 50 kg bag
        "bag_size_kg": 50,
        "description": "Single Super Phosphate. Also provides Calcium and Sulphur (11%). Cheapest P source.",
        "search_name": "SSP single super phosphate 50kg",
    },
    "Ammonium Sulphate (21-0-0+24S)": {
        "N": 21.0, "P": 0.0, "K": 0.0,
        "price_per_bag": 700,
        "bag_size_kg": 50,
        "description": "Provides both N (21%) and Sulphur (24%). Ideal for oilseeds and pulses.",
        "search_name": "Ammonium sulphate fertilizer 50kg",
    },
    "SOP (0-0-50) Sulphate of Potash": {
        "N": 0.0, "P": 0.0, "K": 50.0,
        "price_per_bag": 1800,
        "bag_size_kg": 50,
        "description": "Chloride-free potassium. Essential for tobacco, fruits and vegetables.",
        "search_name": "SOP sulphate of potash fertilizer 50kg",
    },
    "Neem Coated Urea (46-0-0)": {
        "N": 46.0, "P": 0.0, "K": 0.0,
        "price_per_bag": 295,
        "bag_size_kg": 45,
        "description": "Slow-release urea. Reduces N loss by 10-15%. Mandatory for all govt. schemes.",
        "search_name": "Neem coated urea fertilizer 45kg",
    },
    "Gypsum (CaSO4)": {
        "N": 0.0, "P": 0.0, "K": 0.0,
        "price_per_bag": 250,
        "bag_size_kg": 50,
        "description": "Calcium + Sulphur source. Critical for groundnut pegging stage. Improves soil structure.",
        "search_name": "Gypsum agricultural fertilizer 50kg",
    },
}

# ── 3. pH adjustment logic ──────────────────────────────────────────────────
def get_ph_recommendation(ph, crop):
    ideal_lo, ideal_hi = ADVISORY_DB.get(crop, {}).get("pH_range", (6.0, 7.5))
    if ph < ideal_lo - 0.5:
        lime_qty = round((ideal_lo - ph) * 1000, 0)  # kg/ha rough estimate
        return {
            "status": "TOO_ACIDIC",
            "action": f"Soil is too acidic (pH {ph}) for {crop} (ideal {ideal_lo}–{ideal_hi}). "
                      f"Apply Agricultural Lime (CaCO3) at approximately {lime_qty} kg/ha. "
                      f"Re-test after 4-6 weeks.",
            "amendment": f"Agricultural Lime ~{lime_qty} kg/ha",
        }
    elif ph > ideal_hi + 0.5:
        sulphur_qty = round((ph - ideal_hi) * 200, 0)
        return {
            "status": "TOO_ALKALINE",
            "action": f"Soil is too alkaline (pH {ph}) for {crop} (ideal {ideal_lo}–{ideal_hi}). "
                      f"Apply elemental Sulphur at approximately {sulphur_qty} kg/ha. "
                      f"Or use acidifying fertilizers like Ammonium Sulphate.",
            "amendment": f"Elemental Sulphur ~{sulphur_qty} kg/ha",
        }
    else:
        return {
            "status": "OPTIMAL",
            "action": f"Soil pH ({ph}) is within the ideal range for {crop} ({ideal_lo}–{ideal_hi}). "
                      f"No pH amendment needed.",
            "amendment": None,
        }

# ── 4. Fertilizer product selector based on crop ────────────────────────────
def select_products_for_crop(crop, N_needed, P_needed, K_needed):
    """Returns list of recommended products with quantities and costs."""
    products = []

    # Nitrogen source
    if crop == "Tobacco":
        n_product = "SOP (0-0-50) Sulphate of Potash"   # Tobacco needs chloride-free K
        n_fert    = "SOP (0-0-50) Sulphate of Potash"
        urea_fert = "Neem Coated Urea (46-0-0)"
    elif crop in ["Oil seeds"]:
        urea_fert = "Ammonium Sulphate (21-0-0+24S)"    # Oilseeds need Sulphur
    else:
        urea_fert = "Neem Coated Urea (46-0-0)"

    # N from Urea/AS
    if N_needed > 0:
        fert_info  = FERTILIZER_PRODUCTS[urea_fert]
        n_pct      = fert_info["N"] / 100
        kg_product = round(N_needed / n_pct, 1)
        bags       = round(kg_product / fert_info["bag_size_kg"], 2)
        cost       = round(bags * fert_info["price_per_bag"], 0)
        products.append({
            "product":      urea_fert,
            "nutrient":     "Nitrogen",
            "nutrient_needed_kg_ha": round(N_needed, 1),
            "product_qty_kg_ha":     kg_product,
            "bags":         bags,
            "bag_size":     fert_info["bag_size_kg"],
            "cost_per_ha":  cost,
            "description":  fert_info["description"],
            "search_name":  fert_info["search_name"],
            "N_pct": fert_info["N"], "P_pct": fert_info["P"], "K_pct": fert_info["K"],
        })

    # P from DAP (provides both P and some N — subtract N from urea)
    if P_needed > 0:
        dap_info   = FERTILIZER_PRODUCTS["DAP (18-46-0)"]
        p_pct      = dap_info["P"] / 100
        kg_dap     = round(P_needed / (0.46), 1)   # P2O5 conversion: P kg/ha ÷ 0.46
        bags       = round(kg_dap / dap_info["bag_size_kg"], 2)
        cost       = round(bags * dap_info["price_per_bag"], 0)
        dap_n_contribution = round(kg_dap * (dap_info["N"] / 100), 1)
        products.append({
            "product":      "DAP (18-46-0)",
            "nutrient":     "Phosphorous",
            "nutrient_needed_kg_ha": round(P_needed, 1),
            "product_qty_kg_ha":     kg_dap,
            "bags":         bags,
            "bag_size":     dap_info["bag_size_kg"],
            "cost_per_ha":  cost,
            "description":  dap_info["description"],
            "search_name":  dap_info["search_name"],
            "note":         f"DAP also contributes {dap_n_contribution} kg N/ha — reduce Urea by this amount.",
            "N_pct": dap_info["N"], "P_pct": dap_info["P"], "K_pct": dap_info["K"],
        })

    # K from MOP (or SOP for tobacco)
    if K_needed > 0:
        if crop == "Tobacco":
            k_product_name = "SOP (0-0-50) Sulphate of Potash"
        else:
            k_product_name = "MOP (0-0-60)"
        k_info     = FERTILIZER_PRODUCTS[k_product_name]
        kg_mop     = round(K_needed / (0.60 if "MOP" in k_product_name else 0.50), 1)
        bags       = round(kg_mop / k_info["bag_size_kg"], 2)
        cost       = round(bags * k_info["price_per_bag"], 0)
        products.append({
            "product":      k_product_name,
            "nutrient":     "Potassium",
            "nutrient_needed_kg_ha": round(K_needed, 1),
            "product_qty_kg_ha":     kg_mop,
            "bags":         bags,
            "bag_size":     k_info["bag_size_kg"],
            "cost_per_ha":  cost,
            "description":  k_info["description"],
            "search_name":  k_info["search_name"],
            "N_pct": k_info["N"], "P_pct": k_info["P"], "K_pct": k_info["K"],
        })

    # Groundnut special — Gypsum at pegging
    if crop == "Ground Nuts":
        g_info = FERTILIZER_PRODUCTS["Gypsum (CaSO4)"]
        products.append({
            "product":      "Gypsum (CaSO4)",
            "nutrient":     "Calcium + Sulphur",
            "nutrient_needed_kg_ha": 500,
            "product_qty_kg_ha":     500,
            "bags":         10,
            "bag_size":     50,
            "cost_per_ha":  round(10 * g_info["price_per_bag"], 0),
            "description":  g_info["description"],
            "search_name":  g_info["search_name"],
            "note":         "Apply 500 kg/ha Gypsum at pegging stage (40 days). Essential for pod calcium.",
            "N_pct": 0, "P_pct": 0, "K_pct": 0,
        })

    return products

# ── Buy links to real Indian fertilizer e-commerce portals ──────────────────
def get_buy_links(search_name, product_name):
    q = search_name.replace(" ", "+")
    q2 = search_name.replace(" ", "%20")
    return [
        {
            "store": "BigHaat",
            "url": f"https://www.bighaat.com/search?q={q}",
            "logo": "🌾",
            "desc": "India's largest agri input marketplace",
        },
        {
            "store": "AgroStar",
            "url": f"https://www.agrostar.in/search?q={q}",
            "logo": "⭐",
            "desc": "Trusted by 7 million farmers",
        },
        {
            "store": "Krishiseva",
            "url": f"https://krishiseva.com/?s={q2}",
            "logo": "🌱",
            "desc": "Agri inputs at farm prices",
        },
        {
            "store": "DeHaat",
            "url": f"https://dehaat.com/search/{q2}",
            "logo": "🚜",
            "desc": "Direct to farmer agri services",
        },
        {
            "store": "IFFCO eBazar",
            "url": f"https://www.iffcoebazar.in/search?q={q}",
            "logo": "🏭",
            "desc": "IFFCO cooperative — subsidised prices",
        },
    ]


@app.route("/fertilizer-advisor", methods=["POST"])
def fertilizer_advisor():
    try:
        data = request.json

        crop        = data.get("crop", "Wheat")
        stage       = data.get("stage", "Sowing")
        soil_type   = data.get("soilType", "Loamy")
        ph          = float(data.get("pH", 6.5))
        current_N   = float(data.get("nitrogen", 0))
        current_P   = float(data.get("phosphorous", 0))
        current_K   = float(data.get("potassium", 0))
        farm_size   = float(data.get("farmSize", 1))   # in acres

        # ── STEP 1: Get crop info & growth stage ────────────────────────
        crop_db = ADVISORY_DB.get(crop, ADVISORY_DB["Wheat"])
        stages  = crop_db["stages"]
        stage_req = crop_db["requirements"].get(stage, {})

        # ── STEP 2: Soil test analysis + pH ─────────────────────────────
        ph_rec  = get_ph_recommendation(ph, crop)
        season_N = crop_db["season_total"]["N"]
        season_P = crop_db["season_total"]["P"]
        season_K = crop_db["season_total"]["K"]

        # Fraction of season dose for this stage
        stage_N_frac = stage_req.get("N", 0)
        stage_P_frac = stage_req.get("P", 0)
        stage_K_frac = stage_req.get("K", 0)

        required_N_this_stage = round(season_N * stage_N_frac, 1)
        required_P_this_stage = round(season_P * stage_P_frac, 1)
        required_K_this_stage = round(season_K * stage_K_frac, 1)

        # ── Adjust for what's already in soil ───────────────────────────
        # Soil credit: apply 50% credit for existing nutrients
        credit_N = min(current_N * 0.5, required_N_this_stage)
        credit_P = min(current_P * 0.5, required_P_this_stage)
        credit_K = min(current_K * 0.5, required_K_this_stage)

        adjusted_N = max(0, round(required_N_this_stage - credit_N, 1))
        adjusted_P = max(0, round(required_P_this_stage - credit_P, 1))
        adjusted_K = max(0, round(required_K_this_stage - credit_K, 1))

        # ── STEP 3: Authoritative recommendation ────────────────────────
        authority     = crop_db["authority"]
        authority_url = crop_db["authority_url"]
        stage_note    = stage_req.get("note", "")

        # ── STEP 4: Convert to product quantities ────────────────────────
        products = select_products_for_crop(crop, adjusted_N, adjusted_P, adjusted_K)

        # Scale to farm size (1 acre = 0.4047 ha)
        farm_ha = farm_size * 0.4047
        total_cost = 0
        products_with_links = []
        for p in products:
            cost_farm     = round(p["cost_per_ha"] * farm_ha, 0)
            qty_farm      = round(p["product_qty_kg_ha"] * farm_ha, 1)
            bags_farm     = round(qty_farm / p["bag_size"], 2)
            total_cost   += cost_farm
            buy_links     = get_buy_links(p["search_name"], p["product"])
            products_with_links.append({
                **p,
                "qty_for_farm_kg":   qty_farm,
                "bags_for_farm":     bags_farm,
                "cost_for_farm_inr": cost_farm,
                "buy_links":         buy_links,
            })

        # ── STEP 5: Full schedule for all stages ─────────────────────────
        full_schedule = []
        for s in stages:
            sr   = crop_db["requirements"].get(s, {})
            s_N  = round(season_N * sr.get("N", 0), 1)
            s_P  = round(season_P * sr.get("P", 0), 1)
            s_K  = round(season_K * sr.get("K", 0), 1)
            full_schedule.append({
                "stage":  s,
                "N":      s_N,
                "P":      s_P,
                "K":      s_K,
                "note":   sr.get("note", ""),
                "current": s == stage,
            })

        return jsonify({
            # STEP 1
            "crop":           crop,
            "stage":          stage,
            "all_stages":     stages,
            # STEP 2
            "soil_ph":        ph,
            "ph_status":      ph_rec["status"],
            "ph_action":      ph_rec["action"],
            "ph_amendment":   ph_rec["amendment"],
            "soil_inputs":    {"N": current_N, "P": current_P, "K": current_K},
            # STEP 3 — authoritative source
            "authority":      authority,
            "authority_url":  authority_url,
            "season_total":   crop_db["season_total"],
            "stage_required": {
                "N": required_N_this_stage,
                "P": required_P_this_stage,
                "K": required_K_this_stage,
            },
            "soil_credit":    {"N": round(credit_N,1), "P": round(credit_P,1), "K": round(credit_K,1)},
            "adjusted_dose":  {"N": adjusted_N, "P": adjusted_P, "K": adjusted_K},
            "stage_note":     stage_note,
            # STEP 4 — products + cost
            "products":       products_with_links,
            "total_cost_per_ha":  round(sum(p["cost_per_ha"] for p in products), 0),
            "total_cost_farm":    round(total_cost, 0),
            "farm_size_acres":    farm_size,
            "farm_size_ha":       round(farm_ha, 3),
            # STEP 5 — full schedule
            "full_schedule":  full_schedule,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(debug=False, host="0.0.0.0", port=port)
