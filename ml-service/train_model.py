"""
train_model.py  —  Smart Agriculture ML Training
Generates a realistic 1500-row agronomic dataset and trains SVR + MLP models.

Agronomic basis (N requirement kg/ha):
  Wheat        : 80-120  (high N)
  Rice/Paddy   : 60-100
  Maize        : 100-140 (highest N)
  Sugarcane    : 50-90
  Cotton       : 50-80
  Millets      : 30-60   (low N)
  Barley       : 60-90
  Pulses       : 10-30   (fix their own N)
  Oil seeds    : 30-60
  Ground Nuts  : 15-35   (legume, low N)
  Tobacco      : 50-90

Soil modifiers (% of base N dose):
  Sandy   : +15%  (leaches fast, apply more)
  Red     : +10%
  Loamy   :   0%  (ideal, baseline)
  Clayey  : -10%  (retains well)
  Black   : -15%  (richest, needs least)

The target column is Fertilizer_N_Dose (continuous, kg/ha).
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVR
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

np.random.seed(42)
N_ROWS = 1500

# ── Agronomic N-dose ranges (min, max) kg/ha ──────────────────────────────
CROP_N = {
    "Wheat":       (80,  120),
    "Paddy":       (60,  100),
    "Rice":        (55,   95),
    "Maize":       (100, 140),
    "Sugarcane":   (50,   90),
    "Cotton":      (50,   80),
    "Millets":     (30,   60),
    "Barley":      (60,   90),
    "Pulses":      (10,   30),
    "Oil seeds":   (30,   60),
    "Ground Nuts": (15,   35),
    "Tobacco":     (50,   90),
}

SOIL_MODIFIER = {
    "Sandy":  0.15,
    "Red":    0.10,
    "Loamy":  0.00,
    "Clayey": -0.10,
    "Black":  -0.15,
}

# ── Temperature and humidity ranges per crop (realistic) ──────────────────
CROP_CLIMATE = {
    "Wheat":       {"temp": (15, 25), "hum": (50, 70)},
    "Paddy":       {"temp": (25, 35), "hum": (70, 90)},
    "Rice":        {"temp": (24, 34), "hum": (70, 90)},
    "Maize":       {"temp": (20, 32), "hum": (55, 75)},
    "Sugarcane":   {"temp": (28, 38), "hum": (60, 85)},
    "Cotton":      {"temp": (25, 38), "hum": (50, 70)},
    "Millets":     {"temp": (26, 36), "hum": (40, 65)},
    "Barley":      {"temp": (12, 24), "hum": (45, 65)},
    "Pulses":      {"temp": (20, 30), "hum": (50, 70)},
    "Oil seeds":   {"temp": (20, 32), "hum": (45, 68)},
    "Ground Nuts": {"temp": (25, 35), "hum": (55, 75)},
    "Tobacco":     {"temp": (22, 32), "hum": (55, 75)},
}

CROPS  = list(CROP_N.keys())
SOILS  = list(SOIL_MODIFIER.keys())

rows = []
per_combo = N_ROWS // (len(CROPS) * len(SOILS))  # ~25 rows per combo

for crop in CROPS:
    lo, hi   = CROP_N[crop]
    clim     = CROP_CLIMATE[crop]
    for soil in SOILS:
        mod = SOIL_MODIFIER[soil]
        for _ in range(per_combo + 5):          # slight overcount, trimmed later
            # Current soil N (what sensor reads)
            current_N = np.random.randint(4, 45)
            K         = np.random.randint(0, 20)
            P         = np.random.randint(0, 45)
            moisture  = np.random.randint(25, 70)
            temp      = np.random.randint(*clim["temp"])
            humidity  = np.random.randint(*clim["hum"])

            # Base required dose from agronomic range
            base_dose = np.random.uniform(lo, hi)

            # Soil modifier
            base_dose *= (1 + mod)

            # Subtract existing soil N (don't over-apply)
            deficit = base_dose - current_N
            # Add noise to simulate field variability (±8%)
            deficit += np.random.normal(0, base_dose * 0.08)

            # Moisture effect: waterlogged soil → reduce dose
            if moisture > 60:
                deficit *= 0.88
            elif moisture < 30:
                deficit *= 1.10

            # Temperature effect: high heat → slight extra N needed
            if temp > 34:
                deficit *= 1.05

            # Clamp to sensible range 0–160 kg/ha
            dose = float(np.clip(deficit, 0, 160))

            rows.append({
                "Temparature": temp,
                "Humidity ":   humidity,
                "Moisture":    moisture,
                "Soil Type":   soil,
                "Crop Type":   crop,
                "Nitrogen":    current_N,
                "Potassium":   K,
                "Phosphorous": P,
                "N_Dose":      round(dose, 2),
            })

df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
df = df.head(N_ROWS)

print(f"Dataset shape: {df.shape}")
print("\nN_Dose stats:")
print(df["N_Dose"].describe().round(2))
print("\nMean N_Dose by crop:")
print(df.groupby("Crop Type")["N_Dose"].mean().round(1).sort_values(ascending=False))
print("\nMean N_Dose by soil:")
print(df.groupby("Soil Type")["N_Dose"].mean().round(1).sort_values(ascending=False))

# ── Encode categoricals ───────────────────────────────────────────────────
soil_enc = LabelEncoder()
crop_enc = LabelEncoder()
df["Soil Type"] = soil_enc.fit_transform(df["Soil Type"])
df["Crop Type"] = crop_enc.fit_transform(df["Crop Type"])

X = df[["Temparature","Humidity ","Moisture","Soil Type","Crop Type",
        "Nitrogen","Potassium","Phosphorous"]]
y = df["N_Dose"]

# ── Train / test split ────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

scaler  = StandardScaler()
Xtr_sc  = scaler.fit_transform(X_train)
Xte_sc  = scaler.transform(X_test)

# ── SVR ───────────────────────────────────────────────────────────────────
print("\nTraining SVR...")
svr = SVR(kernel="rbf", C=100, gamma=0.1, epsilon=0.5)
svr.fit(Xtr_sc, y_train)
svr_pred = svr.predict(Xte_sc)
print(f"  SVR  MAE={mean_absolute_error(y_test,svr_pred):.2f}  R²={r2_score(y_test,svr_pred):.4f}")

# ── Neural Network ────────────────────────────────────────────────────────
print("Training Neural Network...")
nn = MLPRegressor(
    hidden_layer_sizes=(256, 128, 64),
    activation="relu",
    solver="adam",
    learning_rate_init=0.001,
    max_iter=2000,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=30,
    random_state=42,
)
nn.fit(Xtr_sc, y_train)
nn_pred = nn.predict(Xte_sc)
print(f"  NN   MAE={mean_absolute_error(y_test,nn_pred):.2f}  R²={r2_score(y_test,nn_pred):.4f}")

# ── Save ──────────────────────────────────────────────────────────────────
joblib.dump(svr,      "models/svr_model.pkl")
joblib.dump(nn,       "models/nn_model.pkl")
joblib.dump(scaler,   "models/scaler.pkl")
joblib.dump(soil_enc, "models/soil_encoder.pkl")
joblib.dump(crop_enc, "models/crop_encoder.pkl")

print("\n✅ All models saved to models/")

# ── Sanity check ──────────────────────────────────────────────────────────
print("\n=== SANITY CHECK — different crop/soil combos ===")
checks = [
    ("Maize",    "Sandy",  4,  0,  0, 28, 58, 45),
    ("Pulses",   "Black",  30, 5, 10, 25, 52, 30),
    ("Wheat",    "Loamy",  10, 2, 15, 20, 60, 40),
    ("Paddy",    "Clayey", 20, 0,  5, 30, 78, 50),
    ("Cotton",   "Red",    8,  7, 20, 32, 62, 38),
    ("Millets",  "Sandy",  5,  0,  8, 30, 50, 35),
    ("Sugarcane","Black",  15, 3, 25, 34, 70, 55),
]
for crop,soil,N,K,P,temp,hum,mois in checks:
    s = soil_enc.transform([soil])[0]
    c = crop_enc.transform([crop])[0]
    inp = pd.DataFrame([{
        "Temparature":temp,"Humidity ":hum,"Moisture":mois,
        "Soil Type":s,"Crop Type":c,
        "Nitrogen":N,"Potassium":K,"Phosphorous":P
    }])
    sc  = scaler.transform(inp)
    svr_v = round(float(svr.predict(sc)[0]),1)
    nn_v  = round(float(nn.predict(sc)[0]),1)
    print(f"  {crop:12s} / {soil:7s}  N={N:2d}  →  SVR={svr_v:6.1f}  NN={nn_v:6.1f}")
