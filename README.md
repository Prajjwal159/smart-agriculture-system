# 🌱 Smart Agriculture System using AI/ML

# AI-Based Fertilizer Dosage Optimization & Smart Farming Assistance Platform

---

# 📌 Project Overview

The Smart Agriculture System is an AI-powered farming assistance platform developed to help farmers analyze soil health, predict optimal fertilizer dosage, improve crop productivity, and receive intelligent farming recommendations.

The system combines:

* Artificial Intelligence
* Machine Learning
* OCR (Optical Character Recognition)
* Weather Intelligence
* Dashboard Analytics
* AI Chatbot Assistance
* PDF Report Generation
* MongoDB Storage
* Full Stack Web Development

---

# 📌 Problem Statement

Farmers often apply fertilizers without proper scientific analysis.

This leads to:

* Over-fertilization
* Soil degradation
* Crop damage
* Increased farming costs
* Reduced crop productivity
* Environmental pollution

This project solves these problems using AI and Machine Learning by predicting the optimal nitrogen fertilizer dosage based on:

* Soil nutrients
* Soil type
* Crop type
* Moisture
* Temperature
* Humidity
* Weather conditions

The system also generates smart farming recommendations and AI-generated agriculture reports.

---

# 📌 Main Objectives

The main objectives of this project are:

* Predict nitrogen dosage using AI/ML
* Optimize fertilizer usage
* Reduce fertilizer overuse
* Improve crop productivity
* Analyze uploaded soil reports automatically
* Generate AI-based farming recommendations
* Provide weather-based farming suggestions
* Maintain farmer history and analytics
* Generate downloadable AI reports

---

# 📌 Main Features

## 🔐 Authentication System

* Farmer Registration
* Farmer Login
* JWT Authentication
* Protected Routes
* Logout System

---

## 📄 Soil Report Upload System

* Upload soil analysis PDF reports
* Store uploaded reports
* OCR extraction of nutrient values
* MongoDB storage

---

## 🤖 AI/ML Prediction Engine

* Support Vector Regression (SVR)
* Neural Network Regressor
* Nitrogen dosage optimization
* Fertilizer recommendation engine

---

## 📊 Dashboard Analytics

* Soil health graphs
* Nitrogen trend analysis
* Yield prediction charts
* Farmer analytics
* AI insights cards

---

## 🌦 Weather Intelligence

* Weather forecasts
* Rainfall predictions
* Temperature analysis
* Smart irrigation recommendations

---

## 🤖 AI Chatbot Assistant

* Crop guidance
* Fertilizer suggestions
* Disease prevention tips
* Smart farming assistance

---

## 📑 AI Generated Agriculture Reports

* Soil nutrient analysis
* Nitrogen dosage prediction
* Smart farming actions
* AI-generated recommendations
* Downloadable PDF reports

---

# 📌 Technologies Used

# Frontend

* React JS
* Tailwind CSS
* Framer Motion
* Axios
* React Router DOM
* Recharts
* React Icons

---

# Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* bcryptjs

---

# AI/ML Service

* Python
* Flask
* Scikit-learn
* pandas
* joblib
* pdfplumber
* ReportLab

---

# APIs Used

* OpenAI API
* OpenWeather API

---

# 📌 Project Architecture

```txt
Farmer Uploads Soil Report PDF
            ↓
Node.js Backend Receives File
            ↓
OCR Extracts Soil Data
            ↓
ML Models Predict Nitrogen Dosage
            ↓
AI Recommendation Engine Runs
            ↓
MongoDB Stores Data
            ↓
Dashboard Displays Analytics
            ↓
AI Report PDF Generated
```

---

# 📌 Complete Folder Structure

```txt
smart-agriculture-system
│
├── client
│
├── server
│
└── ml-service
```

---

# 📌 Frontend Structure

```txt
client
│
├── src
│   │
│   ├── components
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── Charts.jsx
│   │
│   ├── pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UploadReport.jsx
│   │   ├── Prediction.jsx
│   │   ├── History.jsx
│   │   ├── Chatbot.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

# 📌 Backend Structure

```txt
server
│
├── config
│
├── controllers
│
├── middleware
│
├── models
│   ├── Farmer.js
│   └── SoilReport.js
│
├── routes
│   ├── authRoutes.js
│   ├── reportRoutes.js
│   ├── chatbotRoutes.js
│   └── weatherRoutes.js
│
├── uploads
│
├── .env.example
├── server.js
└── package.json
```

---

# 📌 ML Service Structure

```txt
ml-service
│
├── data
│
├── models
│   ├── svr_model.pkl
│   ├── nn_model.pkl
│   ├── scaler.pkl
│   ├── soil_encoder.pkl
│   └── crop_encoder.pkl
│
├── generated_reports
│
├── app.py
├── ocr.py
├── train_model.py
└── generate_report.py
```

---

# 📌 System Requirements

Before running the project, install:

## Required Software

* Node.js
* Python 3.10+
* MongoDB Compass OR MongoDB Atlas
* VS Code
* Git

---

# 📌 Step-by-Step Installation Guide

# STEP 1 — Clone Repository

Open terminal:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Then:

```bash
cd smart-agriculture-system
```

---

# 📌 STEP 2 — FRONTEND SETUP

# Open Terminal Inside:

```txt
client
```

---

# Install Frontend Dependencies

```bash
npm install
```

---

# Install Required Packages

```bash
npm install axios react-router-dom react-icons framer-motion recharts
```

---

# Run Frontend

```bash
npm run dev
```

---

# Frontend Runs On:

```txt
http://localhost:5173
```

---

# 📌 STEP 3 — BACKEND SETUP

# Open New Terminal Inside:

```txt
server
```

---

# Install Backend Dependencies

```bash
npm install
```

---

# Install Required Packages

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer axios openai form-data nodemon
```

---

# Create Environment File

Create file:

```txt
server/.env
```

Add:

```env
MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_key

WEATHER_API_KEY=your_weather_key
```

---

# Run Backend

```bash
npm run dev
```

---

# Backend Runs On:

```txt
http://localhost:5000
```

---

# 📌 STEP 4 — ML SERVICE SETUP

# Open New Terminal Inside:

```txt
ml-service
```

---

# Create Virtual Environment

## Windows

```bash
python -m venv venv
```

---

# Activate Virtual Environment

## Windows

```bash
venv\Scripts\activate
```

---

# Install Python Dependencies

```bash
pip install flask flask-cors pandas scikit-learn joblib pdfplumber reportlab
```

---

# Run ML Service

```bash
python app.py
```

---

# ML Service Runs On:

```txt
http://localhost:8000
```

---

# 📌 IMPORTANT — ALL 3 TERMINALS MUST RUN

You must run:

| Terminal   | Folder     | Command       |
| ---------- | ---------- | ------------- |
| Terminal 1 | client     | npm run dev   |
| Terminal 2 | server     | npm run dev   |
| Terminal 3 | ml-service | python app.py |

---

# 📌 Complete Workflow

# Farmer Workflow

```txt
Farmer Registers
        ↓
Farmer Logs In
        ↓
Dashboard Opens
        ↓
Farmer Uploads Soil Report PDF
        ↓
OCR Extracts Soil Values
        ↓
ML Models Predict Nitrogen Dosage
        ↓
AI Recommendation Engine Runs
        ↓
MongoDB Stores Data
        ↓
Dashboard Displays Analytics
        ↓
AI Report PDF Generated
```

---

# 📌 Machine Learning Models Used

# 1. Support Vector Regression (SVR)

Purpose:

* Nitrogen prediction
* Nonlinear regression analysis

Kernel Used:

```python
RBF Kernel
```

---

# 2. Neural Network Regressor

Purpose:

* Learn complex farming patterns
* Improve prediction accuracy

Architecture:

```python
MLPRegressor(hidden_layer_sizes=(100, 50))
```

---

# 📌 OCR System

Library Used:

```python
pdfplumber
```

Extracts:

* Nitrogen
* Potassium
* Phosphorous
* Moisture

from uploaded soil report PDFs.

---

# 📌 AI Recommendation Engine

Recommendations are generated based on:

* Nitrogen level
* Moisture level
* Temperature
* Humidity
* Potassium level
* Phosphorous level

Example:

```txt
• Increase irrigation frequency
• Reduce nitrogen fertilizer
• Add potassium-rich fertilizer
• Prevent fungal disease risk
```

---

# 📌 AI Report Generation

Generated AI Reports Include:

* Soil analysis
* Nutrient status
* Nitrogen dosage prediction
* Smart farming actions
* AI recommendations
* Irrigation suggestions
* Final AI summary

Reports are generated automatically after prediction.

---

# 📌 Main APIs

# OCR API

```txt
POST /extract
```

---

# Prediction API

```txt
POST /predict
```

---

# Chatbot API

```txt
POST /api/chatbot
```

---

# Weather API

```txt
GET /api/weather/:city
```

---

# 📌 Main Frontend Pages

| Page            | Purpose                   |
| --------------- | ------------------------- |
| Login           | Farmer Authentication     |
| Register        | Farmer Registration       |
| Dashboard       | Analytics & Insights      |
| Upload Report   | Upload Soil PDF           |
| Prediction      | AI Prediction Results     |
| History         | Farmer Prediction History |
| Chatbot         | AI Farming Assistant      |
| Admin Dashboard | System Analytics          |

---

# 📌 Advantages of the System

* Reduces fertilizer overuse
* Improves crop productivity
* Automates soil analysis
* Provides intelligent farming guidance
* Reduces farming costs
* Helps precision agriculture
* Modernizes traditional farming workflow

---

# 📌 Future Enhancements

Future improvements may include:

* SMS notifications
* Email alerts
* IoT sensor integration
* Mobile application
* Satellite crop monitoring
* Drone-based analysis
* Multi-language support
* Disease detection using images

---

# 📌 Common Errors & Solutions

# ERROR:

```txt
ECONNREFUSED 127.0.0.1:8000
```

# Solution:

Flask ML service is not running.

Run:

```bash
cd ml-service
python app.py
```

---

# ERROR:

```txt
OpenAI Missing Credentials
```

# Solution:

Add:

```env
OPENAI_API_KEY=your_key
```

inside:

```txt
server/.env
```

---

# ERROR:

```txt
MongoDB Connection Failed
```

# Solution:

Verify:

```env
MONGO_URI
```

inside `.env`

---

# 📌 Final Conclusion

This project successfully combines:

* Artificial Intelligence
* Machine Learning
* OCR
* Dashboard Analytics
* Weather Intelligence
* Modern Full Stack Development

to create a complete AI-powered Smart Agriculture Decision Support System.

The platform helps farmers:

* Optimize fertilizer usage
* Improve crop productivity
* Analyze soil health
* Receive AI recommendations
* Make data-driven farming decisions

This project demonstrates real-world application of AI and ML in precision agriculture and smart farming systems.
