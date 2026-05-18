const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
        type: String,
        default: "farmer",
    },

    village: String,
    district: String,
    state: String,

    farmSize: Number,

    cropType: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Farmer", farmerSchema);