import { useState } from "react";

import axios from "axios";

function Prediction() {

  const [formData, setFormData] = useState({

    temperature: "",
    humidity: "",
    moisture: "",

    soilType: "Sandy",

    cropType: "Wheat",

    nitrogen: "",
    potassium: "",
    phosphorous: "",

  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handlePredict = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(response.data);

    } catch (error) {

      console.log(error);

      alert("Prediction Failed");

    }
  };

  return (
    <div className="min-h-screen bg-[#f4fff7] p-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-5xl font-bold text-green-900">
            AI Fertilizer Prediction
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            Predict optimal nitrogen dosage using AI models
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* FORM */}
          <div className="bg-white p-10 rounded-[30px] shadow-2xl">

            <form
              onSubmit={handlePredict}
              className="space-y-5"
            >

              <input
                type="number"
                name="temperature"
                placeholder="Temperature"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                name="humidity"
                placeholder="Humidity"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                name="moisture"
                placeholder="Moisture"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <select
                name="soilType"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              >

                <option>Sandy</option>
                <option>Loamy</option>
                <option>Black</option>
                <option>Red</option>
                <option>Clayey</option>

              </select>

              <select
                name="cropType"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              >

                <option>Wheat</option>
                <option>Rice</option>
                <option>Maize</option>
                <option>Sugarcane</option>
                <option>Cotton</option>

              </select>

              <input
                type="number"
                name="nitrogen"
                placeholder="Nitrogen"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                name="potassium"
                placeholder="Potassium"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                name="phosphorous"
                placeholder="Phosphorous"
                onChange={handleChange}
                className="w-full border p-4 rounded-2xl"
              />

              <button className="w-full bg-green-700 text-white p-4 rounded-2xl text-lg font-bold hover:bg-green-800">

                Predict Nitrogen Dosage

              </button>

            </form>

          </div>

          {/* RESULT */}
          <div className="space-y-8">

            {result && (

              <>
                <div className="bg-gradient-to-r from-green-700 to-green-500 text-white p-10 rounded-[30px] shadow-2xl">

                  <h2 className="text-3xl font-bold mb-6">
                    Recommended Nitrogen Dosage
                  </h2>

                  <h1 className="text-6xl font-bold">
                    {result.recommended_nitrogen_dose}
                  </h1>

                  <p className="mt-4 text-xl">
                    kg/ha
                  </p>

                </div>

                <div className="bg-white p-8 rounded-[30px] shadow-xl">

                  <h2 className="text-2xl font-bold text-green-800 mb-5">
                    Model Comparison
                  </h2>

                  <div className="space-y-4">

                    <div className="flex justify-between">
                      <span>SVR Prediction</span>
                      <span className="font-bold">
                        {result.svr_prediction}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Neural Network Prediction</span>
                      <span className="font-bold">
                        {result.nn_prediction}
                      </span>
                    </div>

                  </div>

                </div>

                <div className="bg-white p-8 rounded-[30px] shadow-xl">

                  <h2 className="text-2xl font-bold text-green-800 mb-5">
                    AI Recommendation
                  </h2>

                  <p className="text-gray-700 leading-8 text-lg">
                    {result.recommendation}
                  </p>

                </div>
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Prediction;