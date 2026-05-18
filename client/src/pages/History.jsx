import { useEffect, useState } from "react";
import axios from "axios";

function History() {

  const [reports, setReports] = useState([]);

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  useEffect(() => {

    fetchReports();

  }, []);

  const fetchReports = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/reports"
      );

      // FILTER ONLY CURRENT FARMER REPORTS
      const filteredReports = response.data.filter(
        (report) => report.farmerId === farmer._id
      );

      setReports(filteredReports);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="bg-[#f4fff7] min-h-screen p-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-5xl font-bold text-green-900">
            Upload History
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            View all uploaded soil analysis reports
          </p>

        </div>

        {/* REPORTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {reports.map((report) => (

            <div
              key={report._id}
              className="bg-white p-8 rounded-[30px] shadow-xl hover:shadow-2xl transition-all duration-300"
            >

              {/* TOP */}
              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold text-green-800">
                    Soil Report
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {report.reportName}
                  </p>

                </div>

                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                  PDF
                </div>

              </div>

              {/* DATE */}
              <div className="mt-6">

                <p className="text-gray-600">
                  Uploaded On
                </p>

                <h3 className="text-lg font-bold mt-1">
                  {new Date(report.createdAt).toLocaleDateString()}
                </h3>

              </div>

              {/* AI RESULTS */}
<div className="mt-6 grid grid-cols-2 gap-4">

  <div className="bg-green-50 p-4 rounded-2xl">

    <p className="text-gray-500 text-sm">
      Recommended Dose
    </p>

    <h2 className="text-2xl font-bold text-green-700 mt-2">
      {report.recommendedNitrogenDose}
    </h2>

  </div>

  <div className="bg-blue-50 p-4 rounded-2xl">

    <p className="text-gray-500 text-sm">
      Moisture
    </p>

    <h2 className="text-2xl font-bold text-blue-700 mt-2">
      {report.moisture}%
    </h2>

  </div>

</div>


{/* AI RECOMMENDATION */}
<div className="bg-gray-50 p-5 rounded-2xl mt-6">

  <h2 className="font-bold text-green-800 mb-3">
    AI Recommendation
  </h2>

  <p className="text-gray-700 leading-7">
    <ul className="space-y-3">

  {report.recommendations?.map((item, index) => (

    <li
      key={index}
      className="bg-green-50 p-4 rounded-2xl"
    >
      ✅ {item}
    </li>

  ))}

</ul>
  </p>

</div>

              {/* BUTTONS */}
              <div className="flex gap-4 mt-8">

                <a
                  href={`http://localhost:5000/uploads/${report.pdfFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-green-700 text-white text-center py-3 rounded-2xl font-semibold hover:bg-green-800"
                >
                  View PDF
                </a>

                <a
                  href={`http://localhost:5000/uploads/${report.pdfFile}`}
                  download
                  className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-2xl font-semibold hover:bg-gray-300"
                >
                  Download
                </a>

              </div>

            </div>

          ))}

        </div>

        {/* EMPTY STATE */}
        {reports.length === 0 && (

          <div className="bg-white p-12 rounded-[30px] shadow-xl text-center">

            <h1 className="text-3xl font-bold text-green-800">
              No Reports Uploaded Yet
            </h1>

            <p className="text-gray-500 mt-4">
              Upload your first soil report to begin AI analysis.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default History;