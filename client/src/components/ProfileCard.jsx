function ProfileCard() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  return (
    <div className="bg-white p-5 rounded-2xl shadow border border-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {farmer?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-base font-bold text-green-900">{farmer?.name}</h1>
          <p className="text-gray-400 text-xs mt-0.5">{farmer?.district}, {farmer?.state}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-green-50 p-3 rounded-xl">
          <p className="text-gray-400 text-xs">Farm Size</p>
          <p className="text-base font-bold text-green-800 mt-1">{farmer?.farmSize} Acres</p>
        </div>
        <div className="bg-green-50 p-3 rounded-xl">
          <p className="text-gray-400 text-xs">Crop Type</p>
          <p className="text-base font-bold text-green-800 mt-1">{farmer?.cropType}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
