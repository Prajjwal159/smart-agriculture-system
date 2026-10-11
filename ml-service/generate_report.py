"""
generate_report.py
Professional black-and-white soil test & fertilizer recommendation report.
Layout modelled on institutional agronomic soil test reports (ICAR / UMN style).
Zero background colours — pure monochrome for print quality.
"""

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter          # letter = standard agri report size
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import os, datetime

# ── Pure monochrome palette ────────────────────────────────────────────────
BLACK   = colors.black
WHITE   = colors.white
GREY_LT = colors.HexColor("#f0f0f0")   # very light fill for alternating rows
GREY_MD = colors.HexColor("#d0d0d0")   # header rule / thin line
GREY_DK = colors.HexColor("#404040")   # section headings
NONE    = colors.white                  # "transparent" for cells

# ── Helper: nutrient status text (no colour — text only) ──────────────────
def n_status(val, lo, hi):
    if val < lo:  return "Low"
    if val > hi:  return "High"
    return "Optimum"

def m_status(val, lo, hi):
    if val < lo:  return "Dry"
    if val > hi:  return "Excess"
    return "Adequate"

# ── Physical fertilizer quantity from N-dose ───────────────────────────────
def fert_qty(dose, fert_name):
    table = {
        "Urea":  ("Urea (46% N)",        dose / 0.46),
        "DAP":   ("DAP (18-46-0)",       dose / 0.18),
        "CAN":   ("CAN (27% N)",          dose / 0.27),
        "NPK":   ("NPK 15-15-15",         dose / 0.15),
        "Ammo":  ("Ammonium Sulphate",     dose / 0.21),
        "Potash":("Potassium Nitrate",     dose / 0.13),
    }
    for key, (name, qty) in table.items():
        if key.lower() in fert_name.lower():
            return name, round(qty, 1)
    return fert_name, round(dose / 0.46, 1)   # default urea equivalent

# ── Optimal ranges by crop ─────────────────────────────────────────────────
OPTIMAL = {
    "Maize":       {"N":(40,160),"P":(20,80), "K":(10,60),"M":(45,65)},
    "Wheat":       {"N":(30,130),"P":(15,70), "K":(8,50), "M":(40,60)},
    "Paddy":       {"N":(25,120),"P":(10,60), "K":(5,40), "M":(55,85)},
    "Rice":        {"N":(25,110),"P":(10,55), "K":(5,38), "M":(55,85)},
    "Cotton":      {"N":(20,100),"P":(10,60), "K":(8,50), "M":(40,65)},
    "Sugarcane":   {"N":(20,110),"P":(10,55), "K":(10,80),"M":(50,75)},
    "Millets":     {"N":(10,60), "P":(5,35),  "K":(4,25), "M":(30,55)},
    "Barley":      {"N":(20,95), "P":(10,55), "K":(5,35), "M":(35,55)},
    "Pulses":      {"N":(0,30),  "P":(10,60), "K":(5,35), "M":(35,60)},
    "Oil seeds":   {"N":(10,65), "P":(10,55), "K":(5,35), "M":(35,60)},
    "Ground Nuts": {"N":(5,35),  "P":(15,65), "K":(10,50),"M":(40,65)},
    "Tobacco":     {"N":(20,90), "P":(10,60), "K":(15,90),"M":(40,65)},
}

# ── Main generator ─────────────────────────────────────────────────────────
def generate_ai_report(data):
    os.makedirs("generated_reports", exist_ok=True)
    safe  = str(data.get("farmer_name","Farmer")).replace(" ","_").replace("/","")
    fname = f"generated_reports/{safe}_AI_Report.pdf"

    doc = SimpleDocTemplate(
        fname,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch,
    )
    W = doc.width   # usable page width

    styles = getSampleStyleSheet()

    # ── Style definitions ──────────────────────────────────────────────────
    def sty(name, **kw):
        base = kw.pop("parent", styles["Normal"])
        return ParagraphStyle(name, parent=base, **kw)

    INST_TITLE = sty("InstTitle",
        fontSize=15, fontName="Helvetica-Bold",
        alignment=TA_CENTER, textColor=BLACK, spaceAfter=0, leading=18)

    INST_SUB = sty("InstSub",
        fontSize=9, fontName="Helvetica",
        alignment=TA_CENTER, textColor=BLACK, spaceAfter=0, leading=12)

    RPT_TITLE = sty("RptTitle",
        fontSize=18, fontName="Helvetica-Bold",
        alignment=TA_CENTER, textColor=BLACK, spaceAfter=2, leading=22)

    SECTION = sty("Sec",
        fontSize=10, fontName="Helvetica-Bold",
        textColor=BLACK, spaceBefore=10, spaceAfter=3, leading=14,
        borderPad=0)

    BODY = sty("Bdy",
        fontSize=9, fontName="Helvetica",
        textColor=BLACK, leading=13, spaceAfter=3)

    BODY_BOLD = sty("BdyBold",
        fontSize=9, fontName="Helvetica-Bold",
        textColor=BLACK, leading=13)

    SMALL = sty("Sm",
        fontSize=8, fontName="Helvetica",
        textColor=GREY_DK, leading=11)

    SMALL_ITALIC = sty("SmI",
        fontSize=8, fontName="Helvetica-Oblique",
        textColor=GREY_DK, leading=11)

    FOOTER_STY = sty("Ftr",
        fontSize=7.5, fontName="Helvetica-Oblique",
        alignment=TA_CENTER, textColor=GREY_DK, leading=11)

    NOTE_STY = sty("Note",
        fontSize=8.5, fontName="Helvetica",
        textColor=BLACK, leading=13, leftIndent=12, spaceAfter=4)

    # ── Data extraction ────────────────────────────────────────────────────
    farmer    = data.get("farmer_name",  "—")
    crop      = data.get("crop_type",    "—")
    soil      = data.get("soil_type",    "—")
    temp      = data.get("temperature",  "—")
    hum       = data.get("humidity",     "—")
    N_val     = float(data.get("nitrogen",    0))
    P_val     = float(data.get("phosphorous", 0))
    K_val     = float(data.get("potassium",   0))
    M_val     = float(data.get("moisture",    0))
    dose      = float(data.get("recommended_dose", 0))
    svr       = float(data.get("svr_prediction",  0))
    nn        = float(data.get("nn_prediction",   0))
    fertilizer= data.get("fertilizer",  "Urea")
    split     = data.get("split_plan",  "Apply in splits.")
    recs      = data.get("recommendations", [])
    disease   = data.get("disease_risk", "Monitor regularly.")
    expert    = data.get("expert_note",  "Follow standard practices.")
    N_opt     = float(data.get("N_optimal", 80))
    P_opt     = float(data.get("P_optimal", 40))
    K_opt     = float(data.get("K_optimal", 25))
    today     = datetime.datetime.now().strftime("%B %d, %Y")
    rpt_no    = datetime.datetime.now().strftime("%Y%m%d%H%M")

    cr = OPTIMAL.get(crop, {"N":(10,120),"P":(10,60),"K":(5,40),"M":(30,80)})

    N_st = n_status(N_val, cr["N"][0], cr["N"][1])
    P_st = n_status(P_val, cr["P"][0], cr["P"][1])
    K_st = n_status(K_val, cr["K"][0], cr["K"][1])
    M_st = m_status(M_val, cr["M"][0], cr["M"][1])

    fert_name, fert_kg = fert_qty(dose, fertilizer)

    # Yield / health
    n_sc = min(100, max(0, 100 * N_val / max(N_opt,1)))
    p_sc = min(100, max(0, 100 * P_val / max(P_opt,1)))
    k_sc = min(100, max(0, 100 * K_val / max(K_opt,1)))
    m_mid= (cr["M"][0]+cr["M"][1])/2
    m_sc = max(0, 100 - abs(M_val - m_mid)*2)
    health= round(n_sc*0.35 + p_sc*0.25 + k_sc*0.20 + m_sc*0.20, 1)
    ygain = round(min(35, max(0,(N_opt-N_val)/max(N_opt,1))*40), 1)
    hlabel= "Good" if health>=60 else ("Fair" if health>=40 else "Poor")

    # ── Common table style helper ─────────────────────────────────────────
    def base_ts(header_row=True):
        cmds = [
            ("FONTSIZE",      (0,0), (-1,-1), 8.5),
            ("FONTNAME",      (0,0), (-1,-1), "Helvetica"),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 5),
            ("RIGHTPADDING",  (0,0), (-1,-1), 5),
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
            ("GRID",          (0,0), (-1,-1), 0.4, BLACK),
        ]
        if header_row:
            cmds += [
                ("FONTNAME",  (0,0), (-1,0), "Helvetica-Bold"),
                ("BACKGROUND",(0,0), (-1,0), GREY_LT),
                ("LINEBELOW", (0,0), (-1,0), 1, BLACK),
            ]
        return cmds

    elems = []

    # ══════════════════════════════════════════════════════════════════════
    # PAGE HEADER — institutional two-column style
    # ══════════════════════════════════════════════════════════════════════
    left_header = [
        Paragraph("Smart Agriculture AI System", INST_TITLE),
        Paragraph("AI-Powered Soil Analysis Laboratory", INST_SUB),
        Paragraph("Department of Precision Agriculture &amp; Crop Science", INST_SUB),
        Paragraph("ICAR Guidelines  |  FAO Crop Nutrition Standards", INST_SUB),
    ]
    right_header = [
        Paragraph("SOIL TEST REPORT", RPT_TITLE),
        Spacer(1, 4),
        Paragraph(f"<b>Report No.:</b>  {rpt_no}", SMALL),
        Paragraph(f"<b>Date Received:</b>  {today}", SMALL),
        Paragraph(f"<b>Date Reported:</b>  {today}", SMALL),
    ]

    hdr_table = Table(
        [[left_header, right_header]],
        colWidths=[W*0.55, W*0.45],
    )
    hdr_table.setStyle(TableStyle([
        ("VALIGN",      (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING",(0,0), (-1,-1), 0),
        ("TOPPADDING",  (0,0), (-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ("LINEAFTER",   (0,0), (0,0),   0.6, BLACK),
        ("LEFTPADDING", (1,0), (1,0),   10),
    ]))
    elems.append(hdr_table)
    elems.append(HRFlowable(width="100%", thickness=1.5, color=BLACK, spaceAfter=6, spaceBefore=4))

    # ── Farmer / field address block ───────────────────────────────────────
    addr_left  = Paragraph(f"<b>{farmer.upper()}</b><br/>{crop} Farm", BODY)
    addr_right = Paragraph(
        f"Crop: <b>{crop}</b> &nbsp;&nbsp; Soil: <b>{soil}</b> &nbsp;&nbsp; "
        f"Temp: <b>{temp}°C</b> &nbsp;&nbsp; Humidity: <b>{hum}%</b>",
        BODY)
    addr_tbl = Table([[addr_left, addr_right]], colWidths=[W*0.45, W*0.55])
    addr_tbl.setStyle(TableStyle([
        ("VALIGN",      (0,0),(-1,-1),"TOP"),
        ("LEFTPADDING", (0,0),(-1,-1), 0),
        ("RIGHTPADDING",(0,0),(-1,-1), 0),
        ("TOPPADDING",  (0,0),(-1,-1), 2),
        ("BOTTOMPADDING",(0,0),(-1,-1),2),
    ]))
    elems.append(addr_tbl)
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceBefore=5, spaceAfter=8))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION A — SOIL TEST RESULTS  (matches UMN report grid exactly)
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Paragraph("SOIL TEST RESULTS", SECTION))

    soil_rows = [
        # header
        ["Sample\nNo.", "Soil\nTexture", "Organic\nMatter %",
         "pH", "Nitrogen\n(N) kg/ha", "Phosphorous\n(P) kg/ha",
         "Potassium\n(K) kg/ha", "Moisture\n%"],
        # data
        ["01", soil, "—",
         "—", str(N_val), str(P_val), str(K_val), str(M_val)],
    ]
    soil_tbl = Table(soil_rows,
        colWidths=[W*0.07, W*0.12, W*0.10, W*0.07,
                   W*0.16, W*0.16, W*0.16, W*0.16])
    soil_tbl.setStyle(TableStyle(base_ts() + [
        ("ALIGN",  (0,0),(-1,-1), "CENTER"),
        ("FONTNAME",(0,1),(-1,1), "Helvetica-Bold"),
    ]))
    elems.append(soil_tbl)
    elems.append(Spacer(1, 8))

    # Status interpretation row (matches the High/Low/Problem rating bands in UMN)
    status_rows = [
        ["Parameter", "Measured Value", "Crop Optimal Range", "Interpretation"],
        ["Nitrogen (N)",    f"{N_val} kg/ha", f"{cr['N'][0]}–{cr['N'][1]} kg/ha", N_st],
        ["Phosphorous (P)", f"{P_val} kg/ha", f"{cr['P'][0]}–{cr['P'][1]} kg/ha", P_st],
        ["Potassium (K)",   f"{K_val} kg/ha", f"{cr['K'][0]}–{cr['K'][1]} kg/ha", K_st],
        ["Soil Moisture",   f"{M_val} %",     f"{cr['M'][0]}–{cr['M'][1]} %",     M_st],
    ]
    st_tbl = Table(status_rows, colWidths=[W*0.26, W*0.24, W*0.26, W*0.24])
    st_cmds = base_ts() + [("ALIGN",(1,0),(-1,-1),"CENTER")]
    # Bold the interpretation column
    for row_i, row in enumerate(status_rows[1:], 1):
        st_cmds.append(("FONTNAME",(3,row_i),(3,row_i),"Helvetica-Bold"))
        if row[3] == "Low":
            st_cmds.append(("FONTNAME",(3,row_i),(3,row_i),"Helvetica-BoldOblique"))
        elif row[3] in ("High", "Excess"):
            st_cmds.append(("FONTNAME",(3,row_i),(3,row_i),"Helvetica-BoldOblique"))
    st_tbl.setStyle(TableStyle(st_cmds))
    elems.append(st_tbl)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION B — RECOMMENDATIONS  (exactly like the UMN "RECOMMENDATIONS" band)
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1, 10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("RECOMMENDATIONS", SECTION))

    rec_rows = [
        ["Crop and Yield Goal", "Method", "N  lb/A", "P₂O₅  lb/A", "K₂O  lb/A",
         "Fertilizer", "Dose (kg/ha)"],
        [f"{crop}", "Broadcast",
         str(round(dose * 2.205)),           # kg/ha → lb/A
         str(round(P_opt * 0.8 * 2.205)),
         str(round(K_opt * 0.7 * 2.205)),
         fert_name,
         f"{dose} kg/ha"],
        [f"  (Row/Drill split)", "Row/Drill",
         str(round(dose * 0.4 * 2.205)),
         str(round(P_opt * 0.3 * 2.205)),
         str(round(K_opt * 0.25 * 2.205)),
         "At sowing",
         f"{round(dose*0.4,1)} kg/ha"],
    ]
    rec_tbl = Table(rec_rows, colWidths=[W*0.22,W*0.10,W*0.09,W*0.10,W*0.09,W*0.22,W*0.18])
    rec_tbl.setStyle(TableStyle(base_ts() + [
        ("ALIGN",(1,0),(-1,-1),"CENTER"),
        ("SPAN", (0,1),(0,2)),
        ("FONTNAME",(0,1),(0,2),"Helvetica-Bold"),
    ]))
    elems.append(rec_tbl)

    # Application schedule note
    elems.append(Spacer(1, 4))
    elems.append(Paragraph(
        f"Application Schedule:  {split}",
        sty("SchNote", fontSize=8.5, fontName="Helvetica-Oblique",
            textColor=BLACK, leading=12, leftIndent=4)
    ))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION C — ML PREDICTION (model comparison + physical qty)
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1,10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("ML PREDICTION RESULTS", SECTION))

    ml_rows = [
        ["Model", "Algorithm", "Predicted N-Dose (kg/ha)", "Confidence"],
        ["SVR", "RBF Kernel Support Vector Regression", str(svr), "85 %"],
        ["Neural Network (MLP)", "256 → 128 → 64 hidden layers", str(nn), "92 %"],
        ["Final (Weighted Avg)", "NN×0.65 + SVR×0.35", str(dose), "—"],
    ]
    ml_tbl = Table(ml_rows, colWidths=[W*0.20, W*0.38, W*0.26, W*0.16])
    ml_cmds = base_ts() + [
        ("ALIGN",(2,0),(-1,-1),"CENTER"),
        ("FONTNAME",(0,3),(-1,3),"Helvetica-Bold"),
        ("BACKGROUND",(0,3),(-1,3), GREY_LT),
        ("LINEABOVE",(0,3),(-1,3),0.8, BLACK),
    ]
    ml_tbl.setStyle(TableStyle(ml_cmds))
    elems.append(ml_tbl)

    # Physical product translation
    elems.append(Spacer(1,6))
    phys_rows = [
        ["Nutrient Needed", "Fertilizer Product", "Physical Qty (kg/ha)",
         "Bags (50 kg bags)", "Est. Cost/ha (INR)"],
        ["N  — " + str(dose) + " kg/ha",
         fert_name,
         str(fert_kg),
         str(round(fert_kg/50, 1)),
         "₹" + str(round((fert_kg/50)*295))],   # ~₹295/bag NCU
        ["P  — " + str(round(P_opt*0.8,1)) + " kg/ha",
         "DAP (18-46-0)",
         str(round(P_opt*0.8/0.46,1)),
         str(round(P_opt*0.8/0.46/50,1)),
         "₹" + str(round((P_opt*0.8/0.46/50)*1350))],
        ["K  — " + str(round(K_opt*0.7,1)) + " kg/ha",
         "MOP (0-0-60)",
         str(round(K_opt*0.7/0.60,1)),
         str(round(K_opt*0.7/0.60/50,1)),
         "₹" + str(round((K_opt*0.7/0.60/50)*900))],
    ]
    phys_tbl = Table(phys_rows, colWidths=[W*0.22,W*0.23,W*0.18,W*0.16,W*0.21])
    phys_tbl.setStyle(TableStyle(base_ts() + [
        ("ALIGN",(1,0),(-1,-1),"CENTER"),
        ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ]))
    elems.append(phys_tbl)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION D — SOIL HEALTH & YIELD FORECAST
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1,10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("SOIL HEALTH SCORE &amp; YIELD FORECAST", SECTION))

    sh_rows = [
        ["Metric", "Value", "Basis", "Interpretation"],
        ["Soil Health Score",
         f"{health}/100  ({hlabel})",
         "N×35% + P×25% + K×20% + Moisture×20%",
         "Good ≥60 | Fair 40–59 | Poor <40"],
        ["Expected Yield Gain",
         f"+{ygain}%",
         f"Estimated from N deficit closure ({round(max(0,N_opt-N_val),1)} kg/ha gap)",
         "Achievable with recommended fertilization"],
        ["N Use Efficiency",
         "55–70 %",
         "Typical for split-applied neem-coated urea",
         "Improve with drip fertigation"],
        ["Re-test Recommended",
         "After harvest",
         "Before next sowing season",
         "Submit soil sample to nearest KVK lab"],
    ]
    sh_tbl = Table(sh_rows, colWidths=[W*0.22, W*0.18, W*0.35, W*0.25])
    sh_tbl.setStyle(TableStyle(base_ts() + [
        ("FONTNAME",(1,1),(1,4),"Helvetica-Bold"),
        ("ALIGN",(1,0),(1,-1),"CENTER"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, GREY_LT]),
    ]))
    elems.append(sh_tbl)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION E — AI EXPERT RECOMMENDATIONS  (numbered, exactly like UMN Comments)
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1,10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("AI EXPERT RECOMMENDATIONS", SECTION))

    # Two-column numbered comment layout (matches UMN comments page)
    mid = (len(recs) + 1) // 2
    col_left  = recs[:mid]
    col_right = recs[mid:]

    def format_notes(notes, start_i):
        paras = []
        for j, txt in enumerate(notes, start_i):
            # Strip emoji for clean print
            clean = txt.replace("⚠️","").replace("✅","").replace("📋","").replace("🌿","").strip()
            paras.append(Paragraph(f"<b>{j}.</b>  {clean}", NOTE_STY))
        return paras

    left_notes  = format_notes(col_left,  1)
    right_notes = format_notes(col_right, mid+1)

    # Pad shorter column so table builds cleanly
    while len(left_notes) < len(right_notes):
        left_notes.append(Spacer(1, 1))
    while len(right_notes) < len(left_notes):
        right_notes.append(Spacer(1, 1))

    notes_data = [[left_notes, right_notes]]
    notes_tbl  = Table(notes_data, colWidths=[W*0.50, W*0.50])
    notes_tbl.setStyle(TableStyle([
        ("VALIGN",       (0,0),(-1,-1), "TOP"),
        ("LEFTPADDING",  (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
        ("TOPPADDING",   (0,0),(-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1), 0),
        ("LINEAFTER",    (0,0),(0,0),   0.4, GREY_MD),
        ("LEFTPADDING",  (1,0),(1,0),   10),
    ]))
    elems.append(notes_tbl)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION F — DISEASE RISK & EXPERT NOTE
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1,10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("DISEASE RISK &amp; CROP EXPERT NOTE", SECTION))

    dr_clean = disease.replace("⚠️","").replace("✅","").strip()
    en_clean = expert.replace("📋","").replace("🌿","").strip()

    dr_rows = [
        ["Disease / Pest Risk", dr_clean],
        ["Expert Agronomic Note", en_clean],
    ]
    dr_tbl = Table(dr_rows, colWidths=[W*0.22, W*0.78])
    dr_tbl.setStyle(TableStyle([
        ("FONTNAME",     (0,0),(0,-1),"Helvetica-Bold"),
        ("FONTSIZE",     (0,0),(-1,-1), 8.5),
        ("TOPPADDING",   (0,0),(-1,-1), 5),
        ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ("LEFTPADDING",  (0,0),(-1,-1), 5),
        ("GRID",         (0,0),(-1,-1), 0.4, BLACK),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, GREY_LT]),
        ("VALIGN",       (0,0),(-1,-1),"TOP"),
    ]))
    elems.append(dr_tbl)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION G — FINAL SUMMARY PARAGRAPH
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1,10))
    elems.append(HRFlowable(width="100%", thickness=0.6, color=BLACK, spaceAfter=4))
    elems.append(Paragraph("SUMMARY", SECTION))

    if N_val < cr["N"][0]:
        n_smry = f"Nitrogen ({N_val} kg/ha) is below the minimum threshold for {crop}. Apply {fert_name} at {dose} kg N/ha immediately."
    elif N_val > cr["N"][1]:
        n_smry = f"Nitrogen ({N_val} kg/ha) exceeds the safe limit for {crop}. Skip nitrogen fertilizer this cycle."
    else:
        n_smry = f"Nitrogen ({N_val} kg/ha) is within the acceptable range for {crop}. Maintain with targeted top-dressing."

    if M_val < cr["M"][0]:
        m_smry = "Soil is dry. Irrigate before fertilizer application to ensure uptake."
    elif M_val > cr["M"][1]:
        m_smry = "Excess moisture detected. Delay fertilizer application. Open drainage channels."
    else:
        m_smry = "Soil moisture is adequate for nutrient uptake."

    summary = (
        f"This report was prepared for {farmer} for the {crop} crop on {soil} soil. "
        f"{n_smry}  {m_smry}  "
        f"Recommended N dose: {dose} kg/ha ({fert_name}, {fert_kg} kg/ha physical product). "
        f"Phosphorous: {round(P_opt*0.8,1)} kg/ha as DAP. "
        f"Potassium: {round(K_opt*0.7,1)} kg/ha as MOP. "
        f"Soil Health Score: {health}/100 ({hlabel}). "
        f"Estimated yield improvement with optimised fertilization: +{ygain}%. "
        f"Analysis generated by the Smart Agriculture AI System using SVR and Neural Network "
        f"ML models trained on ICAR agronomic data. "
        f"For field-specific verification, contact your nearest Krishi Vigyan Kendra (KVK)."
    )
    elems.append(Paragraph(summary, BODY))

    # ══════════════════════════════════════════════════════════════════════
    # FOOTER
    # ══════════════════════════════════════════════════════════════════════
    elems.append(Spacer(1, 16))
    elems.append(HRFlowable(width="100%", thickness=0.8, color=BLACK, spaceAfter=4))
    elems.append(Paragraph(
        "Smart Agriculture AI System  —  Powered by ICAR Agronomic Guidelines &amp; ML Models  "
        f"|  Report No. {rpt_no}  |  Generated: {today}  "
        "|  For advisory purposes only — consult a licensed agronomist for field decisions.",
        FOOTER_STY
    ))

    doc.build(elems)
    return fname
