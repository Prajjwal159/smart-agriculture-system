function ProfileCard() {

  const farmer = JSON.parse(localStorage.getItem("farmer"));

  return (
    <div className="bg-white p-7 rounded-[30px] shadow-xl">

      <div className="flex items-center gap-5">

        <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold">
          {farmer?.name?.charAt(0)}
        </div>

        <div>

          <h1 className="text-2xl font-bold text-green-900">
            {farmer?.name}
          </h1>

          <p className="text-gray-500">
            {farmer?.district}, {farmer?.state}
          </p>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="bg-green-50 p-4 rounded-2xl">
          <h2 className="text-gray-500">
            Farm Size
          </h2>

          <p className="text-xl font-bold text-green-800 mt-2">
            {farmer?.farmSize} Acres
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-2xl">
          <h2 className="text-gray-500">
            Crop Type
          </h2>

          <p className="text-xl font-bold text-green-800 mt-2">
            {farmer?.cropType}
          </p>
        </div>

      </div>

    </div>
  );
}

export default ProfileCard;