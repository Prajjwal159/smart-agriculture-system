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


def generate_ai_report(data):

    os.makedirs("generated_reports", exist_ok=True)

    filename = f"generated_reports/{data['farmer_name']}_AI_Report.pdf"

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    elements = []

    # =========================
    # TITLE
    # =========================

    title = Paragraph(
        "<b>SMART AGRICULTURE AI REPORT</b>",
        styles['Title']
    )

    elements.append(title)

    elements.append(Spacer(1, 0.3 * inch))

    # =========================
    # FARMER DETAILS
    # =========================

    farmer_data = [

        ["Farmer Name", data["farmer_name"]],

        ["Crop Type", data["crop_type"]],

        ["Soil Type", data["soil_type"]],

        ["Temperature", f"{data['temperature']} °C"],

        ["Humidity", f"{data['humidity']} %"],

        ["Moisture", f"{data['moisture']} %"],

    ]

    farmer_table = Table(
        farmer_data,
        colWidths=[2.5 * inch, 3.5 * inch]
    )

    farmer_table.setStyle(TableStyle([

        ('GRID', (0, 0), (-1, -1), 1, colors.grey),

        ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),

        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),

    ]))

    elements.append(farmer_table)

    elements.append(Spacer(1, 0.3 * inch))

    # =========================
    # SOIL ANALYSIS
    # =========================

    soil_data = [

        ["Parameter", "Value", "Status"],

        ["Nitrogen", data["nitrogen"], "Moderate"],

        ["Phosphorous", data["phosphorous"], "Low"],

        ["Potassium", data["potassium"], "Good"],

        ["Moisture", data["moisture"], "Optimal"],

    ]

    soil_table = Table(
        soil_data,
        colWidths=[2.5 * inch, 2 * inch, 2 * inch]
    )

    soil_table.setStyle(TableStyle([

        ('BACKGROUND', (0, 0), (-1, 0), colors.green),

        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),

        ('GRID', (0, 0), (-1, -1), 1, colors.grey),

        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),

    ]))

    elements.append(soil_table)

    elements.append(Spacer(1, 0.3 * inch))

    # =========================
    # ML PREDICTION
    # =========================

    prediction = Paragraph(
        f"""
        <b>Recommended Nitrogen Dosage:</b>
        {data['recommended_dose']} kg/ha
        """,
        styles['Heading2']
    )

    elements.append(prediction)

    elements.append(Spacer(1, 0.2 * inch))

    # =========================
    # AI RECOMMENDATION
    # =========================

    recommendation = Paragraph(
        f"""
        <b>AI Recommendation:</b><br/><br/>
        {data['recommendation']}
        """,
        styles['BodyText']
    )

    

    elements.append(recommendation)

    elements.append(Spacer(1, 0.3 * inch))


    # =========================
    # SMART FARMING ACTIONS
    # =========================

    actions = [

        "• Maintain proper irrigation schedule",

        "• Monitor soil moisture weekly",

        "• Avoid excessive nitrogen application",

        "• Use organic compost for better soil health",

        "• Monitor rainfall before fertilizer application",

    ]

    action_text = "<br/>".join(actions)

    action_paragraph = Paragraph(
        f"""
        <b>Smart Farming Actions:</b><br/><br/>
        {action_text}
        """,
        styles['BodyText']
    )

    elements.append(action_paragraph)

    elements.append(Spacer(1, 0.3 * inch))

    

    # =========================
    # FINAL SUMMARY
    # =========================

    summary = Paragraph(
        """
        <b>AI Summary:</b><br/><br/>
        This report was generated using AI-powered
        soil analysis, OCR extraction, machine learning
        prediction models, and smart agriculture analytics.
        Following these recommendations can improve crop
        productivity and reduce fertilizer overuse.
        """,
        styles['BodyText']
    )

    elements.append(summary)

    

    # BUILD PDF
    doc.build(elements)

    return filename