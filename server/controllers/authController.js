const Farmer = require("../models/Farmer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
const registerFarmer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      village,
      district,
      state,
      farmSize,
      cropType,
    } = req.body;

    // check existing user
    const existingFarmer = await Farmer.findOne({ email });

    if (existingFarmer) {
      return res.status(400).json({
        message: "Farmer already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create farmer
    const farmer = await Farmer.create({
      name,
      email,
      password: hashedPassword,
      village,
      district,
      state,
      farmSize,
      cropType,
    });

    res.status(201).json({
      message: "Registration successful",
      farmer,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// LOGIN
const loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const farmer = await Farmer.findOne({ email });

    if (!farmer) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, farmer.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: farmer._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      farmer,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


module.exports = {
  registerFarmer,
  loginFarmer,
};