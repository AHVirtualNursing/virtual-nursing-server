const mongoose = require("mongoose");
const Device = require("./device");

const bedStatusEnum = ["occupied", "vacant"];
const bedPositionEnum = ["upright", "incline", "flat"]



const smartBedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    bedNum: {
      type: String,
      required: false,
    },
    roomNum: {
      type: String,
      required: false,
    },
    bedStatus: {
      type: String,
      enum: {
        values: bedStatusEnum,
        message: "Invalid bed status: {VALUE}",
      },
      default: "vacant",
      required: false,
    },
    bedPosition: {
      type: String,
      enum: {
        values: bedPositionEnum,
        message: "Invalid bed position: {VALUE}",
      },
      default: "flat",
      required: true,
    },
    isRightUpperRail: {
      type: Boolean,
      default: true,
      required: true
    },
    isRightLowerRail: {
      type: Boolean,
      default: true,
      required: true
    },
    isLeftUpperRail: {
      type: Boolean,
      default: true,
      required: true
    },
    isLeftLowerRail: {
      type: Boolean,
      default: true,
      required: true
    },
    isBrakeSet: {
      type: Boolean,
      default: true,
      required: true,
    },
    isLowestPosition: {
      type: Boolean,
      default: false,
      required: true,
    },
    isBedAlarmTriggered: {
      type: Boolean,
      default: false,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: false,
    },
    nurses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nurse",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

smartBedSchema.add(Device.schema);

module.exports =
  mongoose.models.SmartBed || mongoose.model("SmartBed", smartBedSchema);
