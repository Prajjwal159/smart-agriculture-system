import pandas as pd

from sklearn.model_selection import train_test_split

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

from sklearn.svm import SVR

from sklearn.neural_network import MLPRegressor

from sklearn.metrics import mean_absolute_error
from sklearn.metrics import r2_score

import joblib


# LOAD DATASET
df = pd.read_csv("data/Fertilizer Prediction.csv")


# ENCODE CATEGORICAL COLUMNS
label_encoder_soil = LabelEncoder()
label_encoder_crop = LabelEncoder()


df["Soil Type"] = label_encoder_soil.fit_transform(df["Soil Type"])

df["Crop Type"] = label_encoder_crop.fit_transform(df["Crop Type"])


# FEATURES
X = df[
    [
        "Temparature",
        "Humidity ",
        "Moisture",
        "Soil Type",
        "Crop Type",
        "Nitrogen",
        "Potassium",
        "Phosphorous",
    ]
]


# TARGET
# WE WILL PREDICT NITROGEN DOSAGE
y = df["Nitrogen"]


# SPLIT DATA
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)


# SCALE DATA
scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)

X_test = scaler.transform(X_test)


# =========================
# SVR MODEL
# =========================

svr_model = SVR(kernel="rbf")

svr_model.fit(X_train, y_train)

svr_predictions = svr_model.predict(X_test)


# =========================
# NEURAL NETWORK MODEL
# =========================

nn_model = MLPRegressor(
    hidden_layer_sizes=(100, 50),
    max_iter=1000,
    random_state=42,
)

nn_model.fit(X_train, y_train)

nn_predictions = nn_model.predict(X_test)


# =========================
# EVALUATION
# =========================

svr_mae = mean_absolute_error(y_test, svr_predictions)

nn_mae = mean_absolute_error(y_test, nn_predictions)

svr_r2 = r2_score(y_test, svr_predictions)

nn_r2 = r2_score(y_test, nn_predictions)


print("\n===== MODEL COMPARISON =====\n")

print(f"SVR MAE: {svr_mae}")
print(f"SVR R2: {svr_r2}")

print("\n----------------------\n")

print(f"Neural Network MAE: {nn_mae}")
print(f"Neural Network R2: {nn_r2}")


# SAVE MODELS
joblib.dump(svr_model, "models/svr_model.pkl")

joblib.dump(nn_model, "models/nn_model.pkl")

joblib.dump(scaler, "models/scaler.pkl")

joblib.dump(label_encoder_soil, "models/soil_encoder.pkl")

joblib.dump(label_encoder_crop, "models/crop_encoder.pkl")


print("\nMODELS SAVED SUCCESSFULLY")