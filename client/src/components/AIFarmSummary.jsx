import { motion } from "framer-motion";

function AIFarmSummary() {

  const farmer = JSON.parse(
    localStorage.getItem("farmer")
  );

  const hour = new Date().getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour < 18) {
    greeting = "Good Afternoon 🌤️";
  }

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      className="
      bg-white
      rounded-[35px]
      shadow-xl
      p-8
      border
      border-green-100
      mt-8
      overflow-hidden
      relative
      "
    >

      {/* BACKGROUND GLOW */}

      <div className="
      absolute
      top-0
      right-0
      w-72
      h-72
      bg-green-100
      rounded-full
      blur-3xl
      opacity-30
      -mr-24
      -mt-24
      "></div>

      {/* HEADER */}

      <div className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-between
      gap-6
      relative
      z-10
      ">

        {/* LEFT */}

        <div>

          <h1 className="
          text-4xl
          font-bold
          text-green-900
          ">

            {greeting}

          </h1>

          <p className="
          text-gray-500
          mt-2
          text-lg
          ">

            AI Daily Farm Summary

          </p>

          <div className="mt-5">

            <h2 className="
            text-2xl
            font-bold
            text-gray-800
            ">

              {farmer?.name} 🌾

            </h2>

            <p className="
            text-gray-600
            mt-4
            leading-8
            max-w-3xl
            ">

              Soil moisture is currently
              optimal at <b>61%</b>.

              Nitrogen levels are slightly
              high and should be monitored.

              Rain probability is
              <b> 68%</b> tomorrow.

              Expected crop yield improvement:
              <b> +12%</b>.

            </p>

          </div>

        </div>

        {/* AI SCORE */}

        <div className="
        bg-gradient-to-br
        from-green-600
        to-emerald-500
        text-white
        rounded-[30px]
        p-6
        min-w-[180px]
        shadow-2xl
        ">

          <p className="text-white/80">
            AI Confidence
          </p>

          <h1 className="
          text-5xl
          font-bold
          mt-3
          ">

            92%

          </h1>

          <p className="
          mt-3
          text-sm
          text-green-100
          ">

            Smart prediction accuracy
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="
      grid
      grid-cols-2
      lg:grid-cols-4
      gap-6
      mt-10
      relative
      z-10
      ">

        <div className="
        bg-green-50
        p-6
        rounded-[25px]
        border
        border-green-100
        ">

          <p className="text-gray-500">
            Soil Health
          </p>

          <h1 className="
          text-4xl
          font-bold
          text-green-700
          mt-3
          ">

            84

          </h1>

        </div>

        <div className="
        bg-blue-50
        p-6
        rounded-[25px]
        border
        border-blue-100
        ">

          <p className="text-gray-500">
            Moisture
          </p>

          <h1 className="
          text-4xl
          font-bold
          text-blue-700
          mt-3
          ">

            61%

          </h1>

        </div>

        <div className="
        bg-orange-50
        p-6
        rounded-[25px]
        border
        border-orange-100
        ">

          <p className="text-gray-500">
            Rain Risk
          </p>

          <h1 className="
          text-4xl
          font-bold
          text-orange-600
          mt-3
          ">

            68%

          </h1>

        </div>

        <div className="
        bg-purple-50
        p-6
        rounded-[25px]
        border
        border-purple-100
        ">

          <p className="text-gray-500">
            Yield Growth
          </p>

          <h1 className="
          text-4xl
          font-bold
          text-purple-700
          mt-3
          ">

            +12%

          </h1>

        </div>

      </div>

      {/* ALERTS */}

      <div className="
      mt-10
      relative
      z-10
      ">

        <div className="
        flex
        items-center
        justify-between
        mb-5
        ">

          <h1 className="
          text-2xl
          font-bold
          text-green-900
          ">

            Smart AI Alerts

          </h1>

          <div className="
          bg-red-100
          text-red-600
          px-4
          py-2
          rounded-xl
          text-sm
          font-semibold
          ">

            3 Active Alerts

          </div>

        </div>

        <div className="space-y-4">

          <div className="
          bg-yellow-50
          border
          border-yellow-100
          p-5
          rounded-2xl
          flex
          items-center
          gap-4
          ">

            <div className="
            w-12
            h-12
            rounded-xl
            bg-yellow-100
            flex
            items-center
            justify-center
            text-xl
            ">

              🌧️

            </div>

            <div>

              <h2 className="
              font-bold
              text-gray-800
              ">

                Rain Expected Tomorrow

              </h2>

              <p className="
              text-gray-500
              mt-1
              ">

                Avoid fertilizer application
                during rainfall.

              </p>

            </div>

          </div>

          <div className="
          bg-blue-50
          border
          border-blue-100
          p-5
          rounded-2xl
          flex
          items-center
          gap-4
          ">

            <div className="
            w-12
            h-12
            rounded-xl
            bg-blue-100
            flex
            items-center
            justify-center
            text-xl
            ">

              💧

            </div>

            <div>

              <h2 className="
              font-bold
              text-gray-800
              ">

                Irrigation Stable

              </h2>

              <p className="
              text-gray-500
              mt-1
              ">

                Soil moisture is healthy
                for crop growth.

              </p>

            </div>

          </div>

          <div className="
          bg-green-50
          border
          border-green-100
          p-5
          rounded-2xl
          flex
          items-center
          gap-4
          ">

            <div className="
            w-12
            h-12
            rounded-xl
            bg-green-100
            flex
            items-center
            justify-center
            text-xl
            ">

              🌱

            </div>

            <div>

              <h2 className="
              font-bold
              text-gray-800
              ">

                Nitrogen Monitoring

              </h2>

              <p className="
              text-gray-500
              mt-1
              ">

                Nitrogen slightly high.
                Reduce urea this week.

              </p>

            </div>

          </div>

        </div>

      </div>

    </motion.div>
  );
}

export default AIFarmSummary;