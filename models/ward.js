const mongoose = require("mongoose");
const wardTypeEnum = ["A1", "B1", "B2", "C"];

const wardSchema = new mongoose.Schema(
  {
    wardNum: {
      type: String,
      required: true,
      unique: true,
    },
    wardType: {
      type: String,
      enum: {
        values: wardTypeEnum,
        message: "Invalid ward type status: {VALUE}",
      },
      required: false,
    },
    numRooms: {
      type: Number,
      required: true,
    },
    smartBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SmartBed",
      },
    ],
    nurses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nurse",
      },
    ],
    beds: [
      {
        type: Number,
      },
    ],
    virtualNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "virtualNurse",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Ward || mongoose.model("Ward", wardSchema);
