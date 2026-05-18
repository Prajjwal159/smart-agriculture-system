import { useState } from "react";
import axios from "axios";

import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaLeaf,
  FaCheckCircle,
} from "react-icons/fa";

import { motion } from "framer-motion";

function UploadReport() {

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const uploadReport = async () => {

    if (!file) {
      alert("Please select PDF");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("pdf", file);

      await axios.post(
        "http://localhost:5000/api/reports/upload",
        formData
      );

      setSuccess(true);

      setLoading(false);

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-6 py-10">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden grid md:grid-cols-2"
      >

        {/* LEFT SIDE */}

        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-10 text-white relative overflow-hidden">

          <div className="absolute -top-20 -left-20 w-56 h-56 bg-white/10 rounded-full"></div>

          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full"></div>

          <div className="relative z-10">

            <div className="flex items-center gap-3 mb-8">

              <div className="bg-white text-green-700 p-4 rounded-2xl">
                <FaLeaf size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Smart Agro
                </h1>

                <p className="text-green-100">
                  AI Soil Intelligence
                </p>
              </div>

            </div>

            <h2 className="text-5xl font-bold leading-tight mb-6">
              Upload Your Soil Report
            </h2>

            <p className="text-green-100 text-lg leading-8">
              AI-powered OCR extraction, nitrogen prediction,
              fertilizer optimization, and smart farming
              recommendations in seconds.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">

                <FaCheckCircle className="text-green-300" />

                <p>AI-based soil analysis</p>

              </div>

              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">

                <FaCheckCircle className="text-green-300" />

                <p>OCR nutrient extraction</p>

              </div>

              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">

                <FaCheckCircle className="text-green-300" />

                <p>Automatic fertilizer recommendations</p>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="p-10 flex flex-col justify-center">

          <div className="text-center mb-8">

            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">

              <FaCloudUploadAlt
                size={40}
                className="text-green-700"
              />

            </div>

            <h2 className="text-4xl font-bold text-green-800 mb-2">
              Upload Report
            </h2>

            <p className="text-gray-500">
              Upload soil analysis PDF
            </p>

          </div>

          {/* FILE INPUT */}

          <label className="border-2 border-dashed border-green-300 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-all duration-300">

            <FaFilePdf
              size={50}
              className="text-red-500 mb-4"
            />

            <p className="font-semibold text-gray-700 mb-2">
              {file
                ? file.name
                : "Choose PDF File"}
            </p>

            <p className="text-sm text-gray-400">
              Drag and drop or click to browse
            </p>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

          </label>

          {/* BUTTON */}

          <motion.button

            whileHover={{ scale: 1.03 }}

            whileTap={{ scale: 0.97 }}

            onClick={uploadReport}

            className="mt-8 bg-gradient-to-r from-green-700 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
          >

            {loading
              ? "Analyzing Soil Report..."
              : "Upload & Analyze"}

          </motion.button>

          {/* SUCCESS */}

          {success && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-green-100 text-green-800 p-4 rounded-2xl text-center font-semibold"
            >

              ✅ Soil Report Uploaded Successfully

            </motion.div>

          )}

        </div>

      </motion.div>

    </div>
  );
}

export default UploadReport;