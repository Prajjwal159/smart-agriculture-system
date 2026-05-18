const express = require("express");
const Farmer = require("../models/Farmer");
const router = express.Router();

const {
  registerFarmer,
  loginFarmer,
} = require("../controllers/authController");


// REGISTER
router.post("/register", registerFarmer);


// LOGIN
router.post("/login", loginFarmer);

router.get("/farmers", async (req, res) => {

  try {

    const farmers = await Farmer.find();

    res.json(farmers);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
});


module.exports = router;