import { useEffect, useState } from "react";

import axios from "axios";

function AdminDashboard() {

  const [farmers, setFarmers] = useState([]);

  const [reports, setReports] = useState([]);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const farmersResponse = await axios.get(
        "http://localhost:5000/api/auth/farmers"
      );

      const reportsResponse = await axios.get(
        "http://localhost:5000/api/reports"
      );

      setFarmers(farmersResponse.data);

      setReports(reportsResponse.data);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div className="min-h-screen bg-[#f4fff7] p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-5xl font-bold text-green-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-3 text-lg">
            Monitor farmers, reports, and AI analytics
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-[30px] shadow-2xl">

            <h2 className="text-xl">
              Total Farmers
            </h2>

            <h1 className="text-5xl font-bold mt-5">
              {farmers.length}
            </h1>

          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-8 rounded-[30px] shadow-2xl">

            <h2 className="text-xl">
              Uploaded Reports
            </h2>

            <h1 className="text-5xl font-bold mt-5">
              {reports.length}
            </h1>

          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-8 rounded-[30px] shadow-2xl">

            <h2 className="text-xl">
              AI Predictions
            </h2>

            <h1 className="text-5xl font-bold mt-5">
              {reports.length}
            </h1>

          </div>

        </div>

        {/* FARMERS TABLE */}
        <div className="bg-white p-8 rounded-[30px] shadow-xl mb-10">

          <h2 className="text-3xl font-bold text-green-900 mb-8">
            Farmers
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-4">
                    Name
                  </th>

                  <th className="text-left py-4">
                    District
                  </th>

                  <th className="text-left py-4">
                    Crop Type
                  </th>

                  <th className="text-left py-4">
                    Farm Size
                  </th>

                </tr>

              </thead>

              <tbody>

                {farmers.map((farmer) => (

                  <tr
                    key={farmer._id}
                    className="border-b"
                  >

                    <td className="py-5">
                      {farmer.name}
                    </td>

                    <td className="py-5">
                      {farmer.district}
                    </td>

                    <td className="py-5">
                      {farmer.cropType}
                    </td>

                    <td className="py-5">
                      {farmer.farmSize}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* REPORTS */}
        <div className="bg-white p-8 rounded-[30px] shadow-xl">

          <h2 className="text-3xl font-bold text-green-900 mb-8">
            AI Report Monitoring
          </h2>

          <div className="space-y-6">

            {reports.map((report) => (

              <div
                key={report._id}
                className="border p-6 rounded-2xl"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-xl font-bold text-green-800">
                      {report.reportName}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      Recommended Dose:
                      {" "}
                      {report.recommendedNitrogenDose}
                    </p>

                  </div>

                  <div className="bg-green-100 text-green-700 px-5 py-3 rounded-2xl">
                    AI Processed
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;