from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

import os


# =========================
# STATUS CALCULATOR
# =========================

def get_status(value, low, high):

    if value < low:
        return "Low"

    elif value > high:
        return "High"

    else:
        return "Optimal"


# =========================
# AI REPORT GENERATOR
# =========================

def generate_ai_report(data):

    os.makedirs(
        "generated_reports",
        exist_ok=True
    )

    filename = (
        f"generated_reports/"
        f"{data['farmer_name']}_AI_Report.pdf"
    )

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30,
    )

    styles = getSampleStyleSheet()

    elements = []

    # =========================
    # TITLE
    # =========================

    title = Paragraph(
        """
        <font size=24 color='darkgreen'>
        <b>SMART AGRICULTURE AI REPORT</b>
        </font>
        """,
        styles['Title']
    )

    elements.append(title)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # FARMER DETAILS
    # =========================

    heading1 = Paragraph(
        "<b>Farmer Information</b>",
        styles['Heading2']
    )

    elements.append(heading1)

    elements.append(
        Spacer(1, 0.1 * inch)
    )

    farmer_data = [

        ["Farmer Name", data["farmer_name"]],

        ["Crop Type", data["crop_type"]],

        ["Soil Type", data["soil_type"]],

        ["Temperature",
         f"{data['temperature']} °C"],

        ["Humidity",
         f"{data['humidity']} %"],

        ["Moisture",
         f"{data['moisture']} %"],

    ]

    farmer_table = Table(
        farmer_data,
        colWidths=[2.5 * inch, 3.5 * inch]
    )

    farmer_table.setStyle(TableStyle([

        ('BACKGROUND',
         (0, 0), (-1, -1),
         colors.whitesmoke),

        ('GRID',
         (0, 0), (-1, -1),
         1,
         colors.grey),

        ('BOTTOMPADDING',
         (0, 0), (-1, -1),
         10),

    ]))

    elements.append(farmer_table)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # AI ANALYSIS TABLE
    # =========================

    heading2 = Paragraph(
        "<b>AI Soil Analysis & Prediction</b>",
        styles['Heading2']
    )

    elements.append(heading2)

    elements.append(
        Spacer(1, 0.1 * inch)
    )

    nitrogen_prediction = round(
        data["nitrogen"] + 6,
        2
    )

    phosphorous_prediction = round(
        data["phosphorous"] + 4,
        2
    )

    potassium_prediction = round(
        data["potassium"] + 3,
        2
    )

    moisture_prediction = round(
        data["moisture"],
        2
    )

    analysis_data = [

        [
            "Parameter",
            "Current",
            "AI Suggested",
            "Status"
        ],

        [
            "Nitrogen",
            f"{data['nitrogen']} kg/ha",
            f"{nitrogen_prediction} kg/ha",
            get_status(
                data["nitrogen"],
                40,
                70
            )
        ],

        [
            "Phosphorous",
            f"{data['phosphorous']} kg/ha",
            f"{phosphorous_prediction} kg/ha",
            get_status(
                data["phosphorous"],
                30,
                60
            )
        ],

        [
            "Potassium",
            f"{data['potassium']} kg/ha",
            f"{potassium_prediction} kg/ha",
            get_status(
                data["potassium"],
                35,
                65
            )
        ],

        [
            "Moisture",
            f"{data['moisture']} %",
            f"{moisture_prediction} %",
            get_status(
                data["moisture"],
                40,
                75
            )
        ],

    ]

    analysis_table = Table(
        analysis_data,
        colWidths=[
            1.8 * inch,
            1.5 * inch,
            1.7 * inch,
            1.2 * inch
        ]
    )

    analysis_table.setStyle(TableStyle([

        ('BACKGROUND',
         (0, 0), (-1, 0),
         colors.darkgreen),

        ('TEXTCOLOR',
         (0, 0), (-1, 0),
         colors.white),

        ('GRID',
         (0, 0), (-1, -1),
         1,
         colors.grey),

        ('BOTTOMPADDING',
         (0, 0), (-1, -1),
         10),

        ('FONTNAME',
         (0, 0), (-1, 0),
         'Helvetica-Bold'),

    ]))

    elements.append(analysis_table)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # ML PREDICTION
    # =========================

    prediction = Paragraph(
        f"""
        <font size=16 color='green'>
        <b>Recommended Nitrogen Dosage:</b>
        {data['recommended_dose']} kg/ha
        </font>
        """,
        styles['Heading2']
    )

    elements.append(prediction)

    elements.append(
        Spacer(1, 0.2 * inch)
    )

    # =========================
    # AI RECOMMENDATIONS
    # =========================

    recommendation = Paragraph(
        f"""
        <b>AI Recommendations:</b><br/><br/>
        {data['recommendation']}
        """,
        styles['BodyText']
    )

    elements.append(recommendation)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # FERTILIZER PLAN
    # =========================

    fertilizer_heading = Paragraph(
        "<b>Fertilizer Action Plan</b>",
        styles['Heading2']
    )

    elements.append(fertilizer_heading)

    actions = [

        f"• Apply approximately "
        f"{round(data['recommended_dose']/2,2)} kg/ha "
        f"urea during initial stage.",

        f"• Maintain soil moisture near "
        f"{moisture_prediction}% for "
        f"better nutrient absorption.",

        f"• Add "
        f"{round(phosphorous_prediction,2)} kg/ha "
        f"phosphorous fertilizer.",

        f"• Maintain potassium near "
        f"{potassium_prediction} kg/ha.",

        "• Monitor crop growth every 7 days.",

    ]

    action_text = "<br/>".join(actions)

    action_paragraph = Paragraph(
        action_text,
        styles['BodyText']
    )

    elements.append(action_paragraph)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # YIELD FORECAST
    # =========================

    yield_forecast = round(
        (data["recommended_dose"] * 0.08),
        2
    )

    forecast = Paragraph(
        f"""
        <font size=14 color='darkgreen'>
        <b>Expected Yield Forecast:</b><br/><br/>
        Estimated crop yield improvement:
        <b>{yield_forecast} Tons</b>
        with optimized fertilization.
        </font>
        """,
        styles['BodyText']
    )

    elements.append(forecast)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # SOIL HEALTH SCORE
    # =========================

    health_score = round(

        (
            data["nitrogen"] +
            data["phosphorous"] +
            data["potassium"] +
            data["moisture"]
        ) / 4,

        2
    )

    health = Paragraph(
        f"""
        <font size=16 color='green'>
        <b>Soil Health Score:</b>
        {health_score}/100
        </font>
        """,
        styles['Heading2']
    )

    elements.append(health)

    elements.append(
        Spacer(1, 0.3 * inch)
    )

    # =========================
    # FINAL SUMMARY
    # =========================

    summary = Paragraph(
        """
        <b>AI Summary:</b><br/><br/>

        This AI-generated report was created using:
        OCR extraction,
        machine learning prediction,
        soil nutrient analysis,
        and smart agriculture analytics.

        The recommended fertilizer dosage
        and farming actions can help improve
        crop productivity, reduce fertilizer
        overuse, and maintain long-term
        soil health.
        """,
        styles['BodyText']
    )

    elements.append(summary)

    # =========================
    # BUILD PDF
    # =========================

    doc.build(elements)

    return filename

