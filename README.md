# 🌱 Smart Agriculture System using AI/ML

## AI-Based Fertilizer Dosage Optimization & Smart Farming Assistance Platform

---

# 📖 About The Project

Smart Agriculture System is an AI-powered farming assistance platform that helps farmers:

✅ Analyze soil reports automatically  
✅ Predict fertilizer dosage using Machine Learning  
✅ Generate smart farming recommendations  
✅ Monitor soil health  
✅ View advanced dashboard analytics  
✅ Generate downloadable AI reports  
✅ Receive weather-based farming suggestions  

The platform combines:

- Artificial Intelligence
- Machine Learning
- OCR (Optical Character Recognition)
- Weather Intelligence
- Dashboard Analytics
- AI Farming Assistant
- PDF Report Generation
- Full Stack Web Development

---

# ❗ Problem Statement

Many farmers apply fertilizers without scientific analysis.

This causes:

❌ Over-fertilization  
❌ Soil degradation  
❌ Crop damage  
❌ Reduced productivity  
❌ Increased farming cost  
❌ Environmental pollution  

Farmers also face difficulties in:

- understanding soil reports
- optimizing nitrogen dosage
- monitoring soil nutrients
- predicting crop yield
- getting farming recommendations

---

# 💡 Solution Approach

This project solves the above problems using AI and Machine Learning.

The system:

✅ Extracts soil nutrient values from uploaded PDFs  
✅ Uses ML models to predict nitrogen dosage  
✅ Generates intelligent farming recommendations  
✅ Provides weather-based insights  
✅ Displays analytics in a modern dashboard  
✅ Stores farmer history and reports  

---

# 🚀 Main Features

---

## 🔐 Authentication System

- Farmer Registration
- Farmer Login
- JWT Authentication
- Protected Routes
- Logout System

---

## 📄 Soil Report Upload System

- Upload soil analysis PDFs
- OCR extraction
- Nutrient value detection
- MongoDB storage
- Report history

---

## 🤖 AI/ML Prediction Engine

- Nitrogen dosage prediction
- Fertilizer optimization
- Smart recommendation engine
- Soil nutrient analysis

### ML Models Used

| Model | Purpose |
|---|---|
| SVR | Nitrogen Prediction |
| Neural Network | Advanced Prediction |

---

## 📊 Premium Dashboard Analytics

- Soil health score
- Nitrogen trends
- Yield forecast
- Rainfall analysis
- Smart farming insights
- Interactive charts
- Live activity feed

---

## 🌦 Weather Intelligence

- Live weather data
- Rainfall prediction
- Humidity monitoring
- Smart irrigation recommendations

---

## 🤖 AI Farming Assistant

- Crop guidance
- Fertilizer suggestions
- Farming tips
- Smart agriculture assistance

---

## 📑 AI Generated Reports

Automatically generates downloadable AI reports including:

✅ Soil analysis  
✅ Nitrogen prediction  
✅ AI recommendations  
✅ Irrigation suggestions  
✅ Soil health score  
✅ Yield forecast  

---

# 🛠️ Technologies Used

---

## FRONTEND

| Technology | Purpose |
|---|---|
| React JS | Frontend |
| Tailwind CSS | UI Design |
| Framer Motion | Animations |
| Axios | API Calls |
| React Router DOM | Routing |
| Recharts | Analytics Charts |
| React Icons | Premium Icons |

---

## BACKEND

| Technology | Purpose |
|---|---|
| Node.js | Backend Runtime |
| Express.js | API Server |
| MongoDB | Database |
| Mongoose | Database ODM |
| JWT | Authentication |
| Multer | File Upload |
| bcryptjs | Password Encryption |

---

## AI / ML SERVICE

| Technology | Purpose |
|---|---|
| Python Flask | ML Backend |
| Scikit-learn | Machine Learning |
| pandas | Data Processing |
| pdfplumber | OCR Extraction |
| ReportLab | PDF Generation |
| joblib | Model Loading |

---

## APIs Used

| API | Purpose |
|---|---|
| OpenAI API | AI Chatbot |
| OpenWeather API | Weather Data |

---

# 🏗️ System Architecture

```txt
Farmer Uploads Soil Report PDF
            ↓
Node.js Backend Receives File
            ↓
OCR Extracts Soil Nutrient Values
            ↓
ML Models Predict Nitrogen Dosage
            ↓
AI Recommendation Engine Runs
            ↓
MongoDB Stores Report Data
            ↓
Dashboard Displays Analytics
            ↓
AI Report PDF Generated
```

---

# 📂 Project Folder Structure

```txt
smart-agriculture-system
│
├── client
├── server
└── ml-service
```

---

# 📂 Frontend Structure

```txt
client
│
├── src
│   ├── components
│   ├── pages
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

# 📂 Backend Structure

```txt
server
│
├── config
├── controllers
├── middleware
├── models
├── routes
├── uploads
│
├── server.js
├── package.json
└── .env
```

---

# 📂 ML Service Structure

```txt
ml-service
│
├── models
├── generated_reports
├── app.py
├── ocr.py
├── train_model.py
└── generate_report.py
```

---

# 💻 System Requirements

Before running the project install:

✅ Node.js  
✅ Python 3.10+  
✅ MongoDB Atlas or MongoDB Compass  
✅ Git  
✅ VS Code  

---

# ⚙️ COMPLETE INSTALLATION GUIDE

---

# STEP 1 — Clone Repository

Open terminal:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Go inside project:

```bash
cd smart-agriculture-system
```

---

# STEP 2 — FRONTEND SETUP

## Open Terminal 1

Go inside frontend folder:

```bash
cd client
```

---

## Install Frontend Dependencies

```bash
npm install
```

---

## Install Required Packages

```bash
npm install axios react-router-dom react-icons framer-motion recharts
```

---

## Run Frontend

```bash
npm run dev
```

---

## Frontend Runs On

```txt
http://localhost:5173
```

---

# STEP 3 — BACKEND SETUP

## Open Terminal 2

Go inside backend folder:

```bash
cd server
```

---

## Install Backend Dependencies

```bash
npm install
```

---

## Install Required Packages

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer axios openai form-data nodemon
```

---

## Create Environment File

Create file:

```txt
server/.env
```

---

## Add Environment Variables

```env
MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_key

WEATHER_API_KEY=your_weather_key
```

---

## Run Backend

```bash
npm run dev
```

---

## Backend Runs On

```txt
http://localhost:5000
```

---

# STEP 4 — ML SERVICE SETUP

## Open Terminal 3

Go inside ML folder:

```bash
cd ml-service
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
```

---

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

---

## Install Python Dependencies

```bash
pip install flask flask-cors pandas scikit-learn joblib pdfplumber reportlab
```

---

## Run ML Service

```bash
python app.py
```

---

## ML Service Runs On

```txt
http://localhost:8000
```

---

# 🔥 IMPORTANT

ALL 3 TERMINALS MUST RUN TOGETHER

| Terminal | Folder | Command |
|---|---|---|
| Terminal 1 | client | npm run dev |
| Terminal 2 | server | npm run dev |
| Terminal 3 | ml-service | python app.py |

---

# 🔄 Complete Workflow

```txt
Farmer Registers
        ↓
Farmer Logs In
        ↓
Dashboard Opens
        ↓
Farmer Uploads Soil Report PDF
        ↓
OCR Extracts Soil Nutrients
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

# 🧠 OCR System

Library Used:

```python
pdfplumber
```

Extracts:

✅ Nitrogen  
✅ Potassium  
✅ Phosphorous  
✅ Moisture  

from uploaded soil report PDFs.

---

# 📈 AI Recommendation Engine

Recommendations are generated based on:

- Nitrogen level
- Moisture level
- Temperature
- Humidity
- Potassium level
- Phosphorous level

Example:

```txt
• Increase irrigation frequency
• Reduce nitrogen fertilizer
• Add potassium-rich fertilizer
• Prevent fungal disease risk
```

---

# 🌍 Main APIs

| API | Endpoint |
|---|---|
| OCR API | POST /extract |
| Prediction API | POST /predict |
| Chatbot API | POST /api/chatbot |
| Weather API | GET /api/weather/:city |

---

# 📄 Main Pages

| Page | Purpose |
|---|---|
| Login | Farmer Authentication |
| Register | Farmer Registration |
| Dashboard | Analytics & Insights |
| Upload Report | Upload Soil PDF |
| Prediction | AI Prediction Results |
| History | Farmer Upload History |
| Analytics | Advanced Analytics |
| Chatbot | AI Farming Assistant |

---

# ✅ Advantages of the System

✅ Reduces fertilizer overuse  
✅ Improves crop productivity  
✅ Automates soil analysis  
✅ Provides smart farming guidance  
✅ Reduces farming costs  
✅ Helps precision agriculture  
✅ Modernizes farming workflow  

---

# 🚀 Future Enhancements

Future improvements may include:

✅ SMS Notifications  
✅ Email Alerts  
✅ IoT Sensor Integration  
✅ Mobile Application  
✅ Satellite Monitoring  
✅ Drone Analysis  
✅ Multi-language Support  
✅ AI Disease Detection  

---

# 🚨 Common Errors & Solutions

---

## ERROR

```txt
ECONNREFUSED 127.0.0.1:8000
```

### Solution

ML service is not running.

Run:

```bash
cd ml-service
python app.py
```

---

## ERROR

```txt
OpenAI Missing Credentials
```

### Solution

Add:

```env
OPENAI_API_KEY=your_key
```

inside:

```txt
server/.env
```

---

## ERROR

```txt
MongoDB Connection Failed
```

### Solution

Check:

```env
MONGO_URI
```

inside `.env`.

---

# 🏁 Final Conclusion

This project successfully combines:

✅ Artificial Intelligence  
✅ Machine Learning  
✅ OCR Extraction  
✅ Dashboard Analytics  
✅ Weather Intelligence  
✅ Smart Recommendations  
✅ Full Stack Development  

to create a complete AI-powered Smart Agriculture Decision Support System.

The platform helps farmers:

✅ Optimize fertilizer usage  
✅ Improve crop productivity  
✅ Analyze soil health  
✅ Receive AI recommendations  
✅ Make data-driven farming decisions  

This project demonstrates the real-world application of AI and Machine Learning in modern precision agriculture and smart farming systems.
