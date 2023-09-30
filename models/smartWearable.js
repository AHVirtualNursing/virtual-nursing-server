const mongoose = require("mongoose");

const smartWearableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.smartWearable ||
  mongoose.model("SmartWearable", smartWearableSchema);
