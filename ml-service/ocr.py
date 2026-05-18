import pdfplumber
import re


def extract_soil_data(pdf_path):

    extracted_text = ""

    # READ PDF
    with pdfplumber.open(pdf_path) as pdf:

        for page in pdf.pages:

            text = page.extract_text()

            if text:
                extracted_text += text


    # EXTRACT VALUES USING REGEX
    nitrogen = re.search(r'Nitrogen.*?(\d+)', extracted_text)
    phosphorous = re.search(r'Phosphorous.*?(\d+)', extracted_text)
    potassium = re.search(r'Potassium.*?(\d+)', extracted_text)
    moisture = re.search(r'Moisture.*?(\d+)', extracted_text)


    data = {
        "nitrogen": int(nitrogen.group(1)) if nitrogen else 0,
        "phosphorous": int(phosphorous.group(1)) if phosphorous else 0,
        "potassium": int(potassium.group(1)) if potassium else 0,
        "moisture": int(moisture.group(1)) if moisture else 0,
    }

    return data