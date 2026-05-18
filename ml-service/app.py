from flask import Flask, request, jsonify
from flask_cors import CORS

from ocr import extract_soil_data
from generate_report import generate_ai_report

import joblib
import pandas as pd


app = Flask(__name__)

CORS(app)


# =========================
# LOAD MODELS
# =========================

svr_model = joblib.load("models/svr_model.pkl")

nn_model = joblib.load("models/nn_model.pkl")

scaler = joblib.load("models/scaler.pkl")

soil_encoder = joblib.load("models/soil_encoder.pkl")

crop_encoder = joblib.load("models/crop_encoder.pkl")


# =========================
# OCR EXTRACTION API
# =========================

@app.route("/extract", methods=["POST"])
def extract_data():

    try:

        file = request.files["pdf"]

        file_path = file.filename

        file.save(file_path)

        extracted_data = extract_soil_data(file_path)

        return jsonify(extracted_data)

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# =========================
# PREDICTION API
# =========================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        # =========================
        # ENCODE VALUES
        # =========================

        soil_type = soil_encoder.transform(
            [data["soilType"]]
        )[0]

        crop_type = crop_encoder.transform(
            [data["cropType"]]
        )[0]


        # =========================
        # CREATE DATAFRAME
        # =========================

        input_data = pd.DataFrame([{
            "Temparature": data["temperature"],
            "Humidity ": data["humidity"],
            "Moisture": data["moisture"],
            "Soil Type": soil_type,
            "Crop Type": crop_type,
            "Nitrogen": data["nitrogen"],
            "Potassium": data["potassium"],
            "Phosphorous": data["phosphorous"],
        }])


        # =========================
        # SCALE DATA
        # =========================

        scaled_data = scaler.transform(input_data)


        # =========================
        # PREDICTIONS
        # =========================

        svr_prediction = svr_model.predict(
            scaled_data
        )[0]

        nn_prediction = nn_model.predict(
            scaled_data
        )[0]


        # =========================
        # FINAL PREDICTION
        # =========================

        final_prediction = round(
            float(nn_prediction), 2
        )


        # =========================
        # SMART AI RECOMMENDATIONS
        # =========================

        recommendations = []


        # NITROGEN ANALYSIS

        if final_prediction < 30:

            recommendations.append(
                "Nitrogen level is low. Increase nitrogen fertilizer moderately."
            )

            recommendations.append(
                "Apply urea in split doses for better absorption."
            )

        elif final_prediction < 60:

            recommendations.append(
                "Nitrogen level is balanced. Maintain current fertilization."
            )

            recommendations.append(
                "Monitor crop growth weekly for nutrient deficiency symptoms."
            )

        else:

            recommendations.append(
                "Nitrogen level is high. Reduce fertilizer application to avoid overuse."
            )

            recommendations.append(
                "Avoid additional urea application this week."
            )


        # MOISTURE ANALYSIS

        if data["moisture"] < 30:

            recommendations.append(
                "Soil moisture is low. Increase irrigation frequency."
            )

        elif data["moisture"] > 70:

            recommendations.append(
                "High soil moisture detected. Prevent waterlogging."
            )


        # TEMPERATURE ANALYSIS

        if data["temperature"] > 35:

            recommendations.append(
                "High temperature detected. Irrigate crops during evening hours."
            )


        # HUMIDITY ANALYSIS

        if data["humidity"] > 80:

            recommendations.append(
                "High humidity may increase fungal disease risk."
            )


        # POTASSIUM ANALYSIS

        if data["potassium"] < 40:

            recommendations.append(
                "Potassium levels are low. Add potassium-rich fertilizer."
            )


        # PHOSPHOROUS ANALYSIS

        if data["phosphorous"] < 30:

            recommendations.append(
                "Phosphorous deficiency detected. Use DAP fertilizer carefully."
            )


        # =========================
        # GENERATE AI PDF REPORT
        # =========================

        farmer_name = data.get(
            "farmerName",
            "Farmer"
        )

        report_path = generate_ai_report({

            "farmer_name": farmer_name,

            "crop_type": data["cropType"],

            "soil_type": data["soilType"],

            "temperature": data["temperature"],

            "humidity": data["humidity"],

            "moisture": data["moisture"],

            "nitrogen": data["nitrogen"],

            "phosphorous": data["phosphorous"],

            "potassium": data["potassium"],

            "recommended_dose": final_prediction,

            "recommendation": "<br/>".join(
                recommendations
            ),

        })


        # =========================
        # RETURN RESPONSE
        # =========================

        return jsonify({

            "svr_prediction": round(
                float(svr_prediction), 2
            ),

            "nn_prediction": round(
                float(nn_prediction), 2
            ),

            "recommended_nitrogen_dose":
                final_prediction,

            "recommendations":
                recommendations,

            "report_path":
                report_path,

        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        })


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(debug=True, port=8000)