"""
generate_test_reports.py
========================
Generates 10 raw soil lab PDFs with VARIED, EXTREME scenarios covering:
  - Critical N deficiency         → triggers "apply immediately" alerts
  - Excess nitrogen               → triggers "skip fertilizer" warning
  - P & K severely deficient      → triggers DAP + MOP alerts
  - Waterlogged / high moisture   → triggers drainage alerts
  - Very dry / drought stress     → triggers irrigation alerts
  - Acidic soil (low pH)          → triggers lime recommendation
  - Alkaline soil (high pH)       → triggers sulphur recommendation
  - Good balanced soil            → shows maintenance plan
  - Legume / pulses               → shows minimal N as expected
  - Sandy soil arid region        → shows split-dose leaching warning

OCR IMPORTANT: The OCR uses regex to find:
  Nitrogen     followed by a number
  Phosphorous  followed by a number
  Potassium    followed by a number
  Moisture     followed by a number
The key-value lines are printed in a dedicated SOIL VALUES section
so OCR can reliably extract them.

Run:  python generate_test_reports.py
"""

import os, datetime
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

os.makedirs("sample_soil_reports", exist_ok=True)

BLACK = colors.black
WHITE = colors.white
LGREY = colors.HexColor("#f2f2f2")

# ── 10 scenarios — varied and extreme ─────────────────────────────────────
REPORTS = [
    {
        "filename":   "sample_soil_reports/01_Wheat_Critical_Nitrogen_Deficiency.pdf",
        "lab_no":     "KVK-PB-2024-0041",
        "farmer":     "Gurpreet Singh",
        "village":    "Moga",
        "district":   "Moga",
        "state":      "Punjab",
        "survey_no":  "Field 3B",
        "crop":       "Wheat",
        "season":     "Rabi 2024-25",
        "texture":    "Loamy",
        "lab":        "Punjab Agricultural University Soil Lab, Ludhiana",
        # OCR-readable values
        "Nitrogen":     4,      # CRITICAL — far below 280-560 kg/ha range
        "Phosphorous":  18,     # Low
        "Potassium":    95,     # Low
        "Moisture":     35,     # Below optimal
        "ph":           6.8,
        "ec":           0.30,
        "organic_matter": 0.38,
        "sulphur":      9,
        "zinc":         0.3,
        "notes": "CRITICAL: Extremely low nitrogen. Field has not received any fertilizer for 2 seasons. "
                 "Organic matter very low. Immediate nitrogen supplementation essential before sowing.",
    },
    {
        "filename":   "sample_soil_reports/02_Rice_Nitrogen_Excess_Toxicity.pdf",
        "lab_no":     "ICAR-WB-2024-0092",
        "farmer":     "Suresh Mondal",
        "village":    "Bardhaman",
        "district":   "East Bardhaman",
        "state":      "West Bengal",
        "survey_no":  "Plot 7A",
        "crop":       "Rice",
        "season":     "Kharif 2024",
        "texture":    "Clayey",
        "lab":        "ICAR-NRRI Soil Lab, Cuttack",
        "Nitrogen":     95,     # EXCESS — far above safe range for rice
        "Phosphorous":  48,     # High
        "Potassium":    220,    # High
        "Moisture":     82,     # Waterlogged
        "ph":           6.0,
        "ec":           0.55,
        "organic_matter": 1.90,
        "sulphur":      22,
        "zinc":         1.1,
        "notes": "WARNING: Nitrogen levels are dangerously high. Previous over-application detected. "
                 "High moisture indicates waterlogging risk. Drainage improvement required immediately.",
    },
    {
        "filename":   "sample_soil_reports/03_Maize_Severe_PK_Deficiency.pdf",
        "lab_no":     "KSDA-KA-2024-0093",
        "farmer":     "Ravi Kumar",
        "village":    "Hubli",
        "district":   "Dharwad",
        "state":      "Karnataka",
        "survey_no":  "Survey No. 142/2",
        "crop":       "Maize",
        "season":     "Kharif 2024",
        "texture":    "Red Loamy",
        "lab":        "University of Agricultural Sciences Soil Lab, Dharwad",
        "Nitrogen":     25,     # Very low for maize
        "Phosphorous":  3,      # CRITICAL deficiency
        "Potassium":    2,      # CRITICAL deficiency
        "Moisture":     48,     # Slightly below optimal
        "ph":           5.4,    # Acidic — needs lime
        "ec":           0.18,
        "organic_matter": 0.42,
        "sulphur":      6,
        "zinc":         0.2,
        "notes": "CRITICAL: Severe phosphorous and potassium deficiency. Soil pH is acidic (5.4) — "
                 "lime application at 2 tonnes/ha needed before fertilizer. All three primary nutrients deficient.",
    },
    {
        "filename":   "sample_soil_reports/04_Cotton_Waterlogged_HighMoisture.pdf",
        "lab_no":     "VNMKV-MH-2024-0256",
        "farmer":     "Ramesh Patil",
        "village":    "Akola",
        "district":   "Akola",
        "state":      "Maharashtra",
        "survey_no":  "Gat No. 88",
        "crop":       "Cotton",
        "season":     "Kharif 2024",
        "texture":    "Black (Vertisol)",
        "lab":        "VNMKV Soil Testing Lab, Parbhani",
        "Nitrogen":     18,     # Low for cotton
        "Phosphorous":  14,     # Below optimal
        "Potassium":    38,     # Adequate for cotton
        "Moisture":     88,     # WATERLOGGED — dangerously high
        "ph":           7.6,
        "ec":           0.48,
        "organic_matter": 0.92,
        "sulphur":      14,
        "zinc":         0.6,
        "notes": "ALERT: Soil moisture is at 88% — severe waterlogging detected after excessive irrigation. "
                 "Boll rot risk is very high. Drainage channels must be opened immediately. "
                 "DO NOT apply fertilizer until moisture drops below 65%.",
    },
    {
        "filename":   "sample_soil_reports/05_Sugarcane_Acidic_Soil_LowPH.pdf",
        "lab_no":     "BHU-UP-2024-0312",
        "farmer":     "Dinesh Yadav",
        "village":    "Muzaffarnagar",
        "district":   "Muzaffarnagar",
        "state":      "Uttar Pradesh",
        "survey_no":  "Khasra No. 334",
        "crop":       "Sugarcane",
        "season":     "Annual 2024",
        "texture":    "Sandy Loam",
        "lab":        "BHU Institute of Agricultural Sciences, Varanasi",
        "Nitrogen":     20,     # Low
        "Phosphorous":  5,      # Very low
        "Potassium":    42,     # Low for sugarcane
        "Moisture":     38,     # Below optimal
        "ph":           4.8,    # SEVERELY ACIDIC
        "ec":           0.15,
        "organic_matter": 0.31,
        "sulphur":      5,
        "zinc":         0.2,
        "notes": "CRITICAL pH: Soil is severely acidic at 4.8. Nutrient uptake is severely impaired at this pH. "
                 "Apply Agricultural Lime at 3-4 tonnes/ha and incorporate 6 months before planting. "
                 "All nutrients show low values due to pH lock-out effect.",
    },
    {
        "filename":   "sample_soil_reports/06_Pulses_LowN_Balanced.pdf",
        "lab_no":     "JNKVV-MP-2024-0078",
        "farmer":     "Kamla Bai",
        "village":    "Vidisha",
        "district":   "Vidisha",
        "state":      "Madhya Pradesh",
        "survey_no":  "Plot B-12",
        "crop":       "Pulses",
        "season":     "Rabi 2024-25",
        "texture":    "Medium Black",
        "lab":        "JNKVV Soil Testing Lab, Jabalpur",
        "Nitrogen":     14,     # Low but expected for legume
        "Phosphorous":  38,     # Good for pulses
        "Potassium":    148,    # Good
        "Moisture":     52,     # Ideal
        "ph":           7.2,
        "ec":           0.29,
        "organic_matter": 0.88,
        "sulphur":      16,
        "zinc":         0.7,
        "notes": "Legume crop — low nitrogen is expected as pulses fix atmospheric N via Rhizobium. "
                 "Phosphorous and potassium are adequate. Rhizobium seed inoculation strongly recommended. "
                 "Starter nitrogen of 15-20 kg/ha only at sowing.",
    },
    {
        "filename":   "sample_soil_reports/07_Rice_Drought_VeryLowMoisture.pdf",
        "lab_no":     "OUAT-OD-2024-0199",
        "farmer":     "Pradeep Sahoo",
        "village":    "Bhubaneswar Block 4",
        "district":   "Khurda",
        "state":      "Odisha",
        "survey_no":  "Field No. 23-C",
        "crop":       "Rice",
        "season":     "Kharif 2024",
        "texture":    "Clayey",
        "lab":        "OUAT Soil Lab, Bhubaneswar",
        "Nitrogen":     12,     # Low
        "Phosphorous":  10,     # Very low
        "Potassium":    62,     # Below optimal for rice
        "Moisture":     18,     # CRITICALLY DRY for rice (needs 55-85%)
        "ph":           5.8,    # Slightly acidic
        "ec":           0.19,
        "organic_matter": 1.10,
        "sulphur":      9,
        "zinc":         0.2,
        "notes": "DROUGHT STRESS: Soil moisture is critically low at 18% for a rice crop that requires 55-85%. "
                 "Immediate irrigation essential before any fertilizer application. "
                 "Zinc deficiency detected — ZnSO4 at 25 kg/ha required.",
    },
    {
        "filename":   "sample_soil_reports/08_Millets_Sandy_Arid_AllLow.pdf",
        "lab_no":     "SKNAU-RJ-2024-0044",
        "farmer":     "Bhura Lal Meena",
        "village":    "Sikar",
        "district":   "Sikar",
        "state":      "Rajasthan",
        "survey_no":  "Khasra 55/B",
        "crop":       "Millets",
        "season":     "Kharif 2024",
        "texture":    "Sandy",
        "lab":        "SKNAU Soil Lab, Bikaner",
        "Nitrogen":     3,      # Extremely low
        "Phosphorous":  4,      # Extremely low
        "Potassium":    38,     # Low
        "Moisture":     14,     # Extremely dry (arid zone)
        "ph":           8.2,    # Alkaline
        "ec":           0.11,
        "organic_matter": 0.18,
        "sulphur":      4,
        "zinc":         0.1,
        "notes": "ARID ZONE: Sandy soil with extremely low organic matter and all nutrients depleted. "
                 "Alkaline pH at 8.2 reduces phosphorous availability. Micronutrient deficiency (Zn, Fe) very likely. "
                 "Drip irrigation with fertigation is the only practical approach for this field.",
    },
    {
        "filename":   "sample_soil_reports/09_Groundnut_AlkalineSoil_HighPH.pdf",
        "lab_no":     "ANGRAU-AP-2024-0311",
        "farmer":     "Venkata Reddy",
        "village":    "Kurnool",
        "district":   "Kurnool",
        "state":      "Andhra Pradesh",
        "survey_no":  "S.No. 78/3A",
        "crop":       "Ground Nuts",
        "season":     "Kharif 2024",
        "texture":    "Red Sandy Loam",
        "lab":        "ANGRAU Soil Lab, Guntur",
        "Nitrogen":     8,      # Low (legume — as expected)
        "Phosphorous":  12,     # Low
        "Potassium":    4,      # CRITICAL deficiency
        "Moisture":     58,     # Adequate
        "ph":           8.6,    # STRONGLY ALKALINE
        "ec":           0.38,
        "organic_matter": 0.52,
        "sulphur":      8,
        "zinc":         0.5,
        "notes": "ALKALINE SOIL: pH 8.6 is strongly alkaline — reduces iron, zinc, manganese availability. "
                 "Potassium is critically low — Gypsum at pegging (500 kg/ha) is essential. "
                 "Apply Elemental Sulphur at 300 kg/ha to reduce pH before next season.",
    },
    {
        "filename":   "sample_soil_reports/10_Barley_WellBalanced_Maintenance.pdf",
        "lab_no":     "HPU-HP-2024-0029",
        "farmer":     "Rajinder Thakur",
        "village":    "Shimla Rural",
        "district":   "Shimla",
        "state":      "Himachal Pradesh",
        "survey_no":  "Khata No. 12",
        "crop":       "Barley",
        "season":     "Rabi 2024-25",
        "texture":    "Loamy",
        "lab":        "HPU Soil Science Dept, Palampur",
        "Nitrogen":     38,     # Good — within optimal
        "Phosphorous":  28,     # Good — within optimal
        "Potassium":    155,    # Good
        "Moisture":     48,     # Good
        "ph":           6.6,    # Ideal
        "ec":           0.31,
        "organic_matter": 1.12,
        "sulphur":      14,
        "zinc":         0.8,
        "notes": "WELL-BALANCED SOIL: All primary nutrients within optimal range. "
                 "Good organic matter content. Suitable for malting barley — "
                 "avoid excess nitrogen to maintain low grain protein for malting quality. "
                 "Maintenance fertilization only recommended.",
    },
]

# ── PDF builder ────────────────────────────────────────────────────────────
def build_pdf(r):
    doc = SimpleDocTemplate(
        r["filename"],
        pagesize=letter,
        rightMargin=0.75*inch, leftMargin=0.75*inch,
        topMargin=0.6*inch,    bottomMargin=0.6*inch,
    )
    W = doc.width
    styles = getSampleStyleSheet()

    def sty(name, **kw):
        return ParagraphStyle(name, parent=styles["Normal"], **kw)

    INST   = sty("I",  fontSize=13, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=17)
    DEPT   = sty("D",  fontSize=8.5,fontName="Helvetica",      alignment=TA_CENTER, leading=12,
                 textColor=colors.HexColor("#444"))
    RTITLE = sty("RT", fontSize=17, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=22)
    SEC    = sty("S",  fontSize=10, fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=3)
    BODY   = sty("B",  fontSize=8.5,fontName="Helvetica",      leading=13)
    NOTE   = sty("N",  fontSize=8,  fontName="Helvetica-Oblique", leading=12,
                 textColor=colors.HexColor("#444"))
    FOOTER = sty("F",  fontSize=7.5,fontName="Helvetica-Oblique", alignment=TA_CENTER,
                 textColor=colors.HexColor("#666"))
    # Big readable value style — makes OCR more reliable
    BIG    = sty("Big",fontSize=11, fontName="Helvetica-Bold", leading=16)

    def tbl(data, widths, alt=True):
        t = Table(data, colWidths=widths)
        cmds = [
            ("FONTSIZE",      (0,0),(-1,-1), 8.5),
            ("FONTNAME",      (0,0),(-1,-1), "Helvetica"),
            ("TOPPADDING",    (0,0),(-1,-1), 4),
            ("BOTTOMPADDING", (0,0),(-1,-1), 4),
            ("LEFTPADDING",   (0,0),(-1,-1), 6),
            ("RIGHTPADDING",  (0,0),(-1,-1), 6),
            ("GRID",          (0,0),(-1,-1), 0.4, BLACK),
            ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
            ("FONTNAME",      (0,0),(-1,0), "Helvetica-Bold"),
            ("BACKGROUND",    (0,0),(-1,0), LGREY),
            ("LINEBELOW",     (0,0),(-1,0), 0.8, BLACK),
        ]
        if alt:
            for i in range(1, len(data)):
                if i % 2 == 0:
                    cmds.append(("BACKGROUND",(0,i),(-1,i), LGREY))
        t.setStyle(TableStyle(cmds))
        return t

    today = datetime.datetime.now().strftime("%d-%b-%Y")
    el    = []

    # ── HEADER ────────────────────────────────────────────────────────────
    el.append(Paragraph("Government of India  —  Soil Health Card Programme", DEPT))
    el.append(Spacer(1, 3))
    el.append(Paragraph(r["lab"], INST))
    el.append(Spacer(1, 3))
    el.append(Paragraph("SOIL TEST REPORT", RTITLE))
    el.append(HRFlowable(width="100%", thickness=1.5, color=BLACK, spaceBefore=5, spaceAfter=5))

    # Meta line
    meta = [[f"Lab No.: {r['lab_no']}", f"Date Reported: {today}", f"Crop: {r['crop']}"]]
    mt = Table(meta, colWidths=[W*0.38, W*0.32, W*0.30])
    mt.setStyle(TableStyle([
        ("FONTNAME", (0,0),(-1,-1),"Helvetica-Bold"),
        ("FONTSIZE", (0,0),(-1,-1), 8.5),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),2),
        ("BOTTOMPADDING",(0,0),(-1,-1),2),
        ("ALIGN",(2,0),(2,0),"RIGHT"),
    ]))
    el.append(mt)
    el.append(HRFlowable(width="100%", thickness=0.5, color=BLACK, spaceBefore=4, spaceAfter=6))

    # ── A. FARMER & FIELD ─────────────────────────────────────────────────
    el.append(Paragraph("A.  FARMER AND FIELD INFORMATION", SEC))
    fd = [
        ["Farmer Name",  r["farmer"],   "Lab Report No.", r["lab_no"]],
        ["Village",      r["village"],  "District",       r["district"]],
        ["State",        r["state"],    "Survey / Khasra",r["survey_no"]],
        ["Crop Season",  r["season"],   "Recommended Crop",r["crop"]],
        ["Sample Depth", "0–20 cm",     "Soil Texture",   r["texture"]],
    ]
    el.append(tbl(
        [["Field","Details","Field","Details"]] + fd,
        [W*0.18, W*0.30, W*0.20, W*0.32]
    ))
    el.append(Spacer(1, 8))

    # ── B. SOIL VALUES (OCR-readable section) ─────────────────────────────
    # These labels MUST match OCR regex: Nitrogen, Phosphorous, Potassium, Moisture
    el.append(Paragraph("B.  SOIL TEST RESULTS — PRIMARY NUTRIENTS", SEC))
    el.append(Paragraph(
        "Available nutrient values measured in kg/ha (Nitrogen, Phosphorous, Potassium) "
        "and % (Moisture). These values are used for fertilizer calculation.",
        sty("hint", fontSize=7.5, fontName="Helvetica-Oblique",
            textColor=colors.HexColor("#555"), leading=11, spaceAfter=4)
    ))

    # Large readable key-value block — OCR regex targets these lines
    el.append(Paragraph(f"Nitrogen        :  {r['Nitrogen']}  kg/ha", BIG))
    el.append(Paragraph(f"Phosphorous     :  {r['Phosphorous']}  kg/ha", BIG))
    el.append(Paragraph(f"Potassium       :  {r['Potassium']}  kg/ha", BIG))
    el.append(Paragraph(f"Moisture        :  {r['Moisture']}  %", BIG))
    el.append(Spacer(1, 8))

    # Full table with ratings
    def rate_n(v):
        if v < 10: return "CRITICAL — Very Low"
        if v < 20: return "Low"
        if v < 50: return "Moderate"
        if v < 80: return "Adequate"
        return "HIGH / Excess"

    def rate_p(v):
        if v < 5:  return "CRITICAL — Very Low"
        if v < 15: return "Low"
        if v < 35: return "Moderate"
        if v < 60: return "Adequate"
        return "HIGH"

    def rate_k(v):
        if v < 10:  return "CRITICAL — Very Low"
        if v < 80:  return "Low"
        if v < 160: return "Moderate"
        if v < 280: return "Adequate"
        return "HIGH"

    def rate_m(v):
        if v < 20: return "CRITICAL — Extremely Dry"
        if v < 35: return "Dry / Low"
        if v < 55: return "Moderate"
        if v < 80: return "Adequate / Moist"
        return "EXCESS — Waterlogged"

    def rate_ph(v):
        if v < 5.0: return "Strongly Acidic"
        if v < 6.0: return "Acidic"
        if v <= 7.5: return "Neutral (Optimal)"
        if v <= 8.5: return "Alkaline"
        return "Strongly Alkaline"

    primary = [
        ["Parameter", "Measured Value", "Unit", "ICAR Range", "Field Rating"],
        ["pH (soil reaction)",    str(r["ph"]),           "—",      "6.0–7.5",   rate_ph(r["ph"])],
        ["EC",                    str(r["ec"]),            "dS/m",   "< 1.0",     "Normal" if r["ec"]<1.0 else "High Salinity"],
        ["Organic Matter",        str(r["organic_matter"]),"%",     "0.75–1.5",  "Low" if r["organic_matter"]<0.5 else "Medium" if r["organic_matter"]<1.5 else "High"],
        ["Nitrogen (N)",          str(r["Nitrogen"]),      "kg/ha",  "10–80",     rate_n(r["Nitrogen"])],
        ["Phosphorous (P)",       str(r["Phosphorous"]),   "kg/ha",  "10–60",     rate_p(r["Phosphorous"])],
        ["Potassium (K)",         str(r["Potassium"]),     "kg/ha",  "80–280",    rate_k(r["Potassium"])],
        ["Soil Moisture",         str(r["Moisture"]),      "%",      "Varies",    rate_m(r["Moisture"])],
        ["Sulphur (S)",           str(r["sulphur"]),       "ppm",    "> 10 ppm",  "Low" if r["sulphur"]<10 else "Adequate"],
        ["Zinc (Zn)",             str(r["zinc"]),          "ppm",    "> 0.6 ppm", "Deficient" if r["zinc"]<0.6 else "Adequate"],
    ]
    el.append(tbl(primary, [W*0.28, W*0.15, W*0.09, W*0.22, W*0.26]))
    el.append(Spacer(1, 8))

    # ── C. FIELD NOTES ────────────────────────────────────────────────────
    el.append(Paragraph("C.  FIELD OBSERVATIONS & SPECIAL NOTES", SEC))
    el.append(Paragraph(r["notes"], BODY))
    el.append(Spacer(1, 8))

    # ── D. ICAR INTERPRETATION SCALE ──────────────────────────────────────
    el.append(Paragraph("D.  ICAR INTERPRETATION SCALE", SEC))
    guide = [
        ["Parameter",          "Critical / Low",    "Moderate",      "Adequate / High"],
        ["Nitrogen (kg/ha)",   "< 20",              "20–50",         "> 50"],
        ["Phosphorous (kg/ha)","< 10",              "10–35",         "> 35"],
        ["Potassium (kg/ha)",  "< 80",              "80–160",        "> 160"],
        ["Organic Matter (%)", "< 0.5",             "0.5–1.5",       "> 1.5"],
        ["Moisture (%)",       "< 25 (Dry)",        "25–55",         "55–80 (Moist) / >80 Waterlogged"],
        ["Soil pH",            "< 5.5 (Acidic)",    "5.5–7.0 (Good)","7.0–8.5 (Alkaline) / >8.5 Too Alkaline"],
    ]
    el.append(tbl(guide, [W*0.27, W*0.24, W*0.22, W*0.27]))
    el.append(Spacer(1, 8))

    # ── E. LAB DECLARATION ────────────────────────────────────────────────
    el.append(Paragraph("E.  LABORATORY DECLARATION", SEC))
    decl = (
        f"This soil test report is prepared based on laboratory analysis of the soil sample "
        f"submitted by {r['farmer']} from {r['village']}, {r['district']}, {r['state']}. "
        f"The results represent the nutrient status of the sampled field at the time of collection. "
        f"Fertilizer recommendations are NOT included in this report. "
        f"For crop-specific fertilizer recommendations, please consult your Krishi Vigyan Kendra (KVK) "
        f"or use an AI-powered advisory system with this report."
    )
    el.append(Paragraph(decl, BODY))
    el.append(Spacer(1, 14))

    sig = Table([[
        Paragraph(f"___________________________\nSoil Analyst\n{r['lab']}", NOTE),
        Paragraph(f"___________________________\nDate: {today}\nReport No.: {r['lab_no']}", NOTE),
    ]], colWidths=[W*0.55, W*0.45])
    sig.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"BOTTOM"),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),0),
        ("BOTTOMPADDING",(0,0),(-1,-1),0),
    ]))
    el.append(sig)

    # ── FOOTER ────────────────────────────────────────────────────────────
    el.append(Spacer(1, 14))
    el.append(HRFlowable(width="100%", thickness=0.8, color=BLACK, spaceAfter=4))
    el.append(Paragraph(
        f"Soil Health Card Programme — Govt. of India  |  Lab: {r['lab']}  "
        f"|  Report No. {r['lab_no']}  |  Raw soil data only — no fertilizer recommendations included.",
        FOOTER
    ))

    doc.build(el)


# ── Main ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 65)
    print("  Generating 10 Soil Lab PDFs — Varied Extreme Scenarios")
    print("=" * 65)
    print()

    descriptions = [
        ("Critical Nitrogen Deficiency",        "Wheat  / Punjab   / N=4   — fire immediate N alert"),
        ("Nitrogen Excess + Waterlogging",       "Rice   / W.Bengal / N=95  — skip N + drainage alert"),
        ("Severe P & K Deficiency + Acidic pH",  "Maize  / Karnataka/ P=3 K=2 pH=5.4 — lime + DAP + MOP"),
        ("Waterlogged Soil High Moisture",       "Cotton / MH       / Moisture=88% — do not apply now"),
        ("Severely Acidic Soil pH=4.8",          "Sugar  / UP       / pH=4.8 — lime critical"),
        ("Pulses Low N (expected for legume)",   "Pulses / MP       / N=14  — minimal N as expected"),
        ("Drought Stress Very Low Moisture",     "Rice   / Odisha   / Moisture=18% — irrigate first"),
        ("Sandy Arid All Nutrients Depleted",    "Millets/ Rajasthan/ all very low — drip fertigation"),
        ("Alkaline Soil pH=8.6 + Low K",        "GNut   / AP       / pH=8.6 + K=4 — sulphur + gypsum"),
        ("Well Balanced Maintenance Only",       "Barley / HP       / all adequate — maintenance dose"),
    ]

    for i, (r, (title, desc)) in enumerate(zip(REPORTS, descriptions), 1):
        print(f"[{i:02d}/10]  {title}")
        print(f"        {desc}")
        build_pdf(r)
        print(f"        → {r['filename']}")
        print()

    print("=" * 65)
    print("  All 10 PDFs saved in:  ml-service/sample_soil_reports/")
    print()
    print("  SCENARIO GUIDE:")
    print("  01 — Critical N deficiency     → big urea alert")
    print("  02 — Excess N + waterlogged    → skip fertilizer warning")
    print("  03 — P=3, K=2, pH=5.4         → lime + DAP + MOP alerts")
    print("  04 — Moisture=88%             → drainage alert, no fertilizer")
    print("  05 — pH=4.8 severely acidic   → lime 3-4 t/ha critical")
    print("  06 — Pulses N=14              → only starter N (legume)")
    print("  07 — Moisture=18% drought     → irrigate before fertilizer")
    print("  08 — All nutrients near zero  → complete fertilizer plan")
    print("  09 — pH=8.6, K=4             → sulphur + gypsum + MOP")
    print("  10 — All balanced            → maintenance dose only")
    print("=" * 65)
