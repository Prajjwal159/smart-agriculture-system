const express = require("express");

const axios = require("axios");

const router = express.Router();


// GET WEATHER
router.get("/:city", async (req, res) => {

  try {

    const city = req.params.city;

    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    res.json(response.data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Weather Fetch Failed",
    });

  }
});


module.exports = router;