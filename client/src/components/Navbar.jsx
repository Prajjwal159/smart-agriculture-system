import { FaBell } from "react-icons/fa";

function Navbar() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  return (
    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-4xl font-bold text-green-900">
          Smart Agriculture Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, {farmer?.name}
        </p>

      </div>

      <div className="flex items-center gap-5">

        <div className="bg-white p-4 rounded-2xl shadow-lg cursor-pointer">
          <FaBell className="text-green-700" />
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-2xl shadow-xl">

          🌾 AI Smart Farming

        </div>

      </div>

    </div>
  );
}

export default Navbar;