import { motion } from "framer-motion";

function LiveActivityFeed() {

  const activities = [

    {
      title: "OCR Analysis Completed",
      description:
        "Soil report processed successfully.",
      time: "2 min ago",
      icon: "📄",
      color: "bg-green-100",
    },

    {
      title: "Nitrogen Increased",
      description:
        "Nitrogen level increased by 4%.",
      time: "10 min ago",
      icon: "🧪",
      color: "bg-yellow-100",
    },

    {
      title: "Rain Detected Near Farm",
      description:
        "Heavy rainfall expected tomorrow.",
      time: "18 min ago",
      icon: "🌧️",
      color: "bg-blue-100",
    },

    {
      title: "AI Recommendation Updated",
      description:
        "Irrigation requirement changed.",
      time: "30 min ago",
      icon: "🤖",
      color: "bg-purple-100",
    },

    {
      title: "Moisture Stabilized",
      description:
        "Soil moisture reached optimal level.",
      time: "45 min ago",
      icon: "💧",
      color: "bg-cyan-100",
    },

  ];

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
      border
      border-green-100
      p-7
      overflow-hidden
      "
    >

      {/* HEADER */}

      <div className="
      flex
      items-center
      justify-between
      mb-8
      ">

        <div>

          <h1 className="
          text-3xl
          font-bold
          text-green-900
          ">

            Live Activity Feed

          </h1>

          <p className="
          text-gray-500
          mt-2
          ">

            Real-time AI farming updates

          </p>

        </div>

        {/* LIVE BADGE */}

        <div className="
        flex
        items-center
        gap-3
        bg-green-50
        px-5
        py-3
        rounded-2xl
        border
        border-green-100
        ">

          <div className="
          w-3
          h-3
          rounded-full
          bg-green-500
          animate-pulse
          "></div>

          <span className="
          font-semibold
          text-green-700
          ">

            LIVE

          </span>

        </div>

      </div>

      {/* FEED */}

      <div className="
      space-y-5
      max-h-[500px]
      overflow-y-auto
      pr-2
      ">

        {activities.map((item, index) => (

          <motion.div

            key={index}

            initial={{
              opacity: 0,
              x: -20,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            transition={{
              delay: index * 0.1,
            }}

            whileHover={{
              x: 5,
            }}

            className="
            flex
            items-start
            gap-5
            p-5
            rounded-[25px]
            border
            border-gray-100
            hover:border-green-200
            hover:bg-green-50/50
            transition-all
            duration-300
            "
          >

            {/* ICON */}

            <div className={`
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            text-2xl
            ${item.color}
            `}>

              {item.icon}

            </div>

            {/* CONTENT */}

            <div className="flex-1">

              <div className="
              flex
              justify-between
              items-start
              gap-4
              ">

                <div>

                  <h2 className="
                  font-bold
                  text-lg
                  text-gray-800
                  ">

                    {item.title}

                  </h2>

                  <p className="
                  text-gray-500
                  mt-2
                  leading-7
                  ">

                    {item.description}

                  </p>

                </div>

                {/* TIME */}

                <div className="
                text-sm
                text-gray-400
                whitespace-nowrap
                ">

                  {item.time}

                </div>

              </div>

            </div>

          </motion.div>

        ))}

      </div>

    </motion.div>
  );
}

export default LiveActivityFeed;