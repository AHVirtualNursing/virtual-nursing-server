const mongoose = require("mongoose");
const { VitalsReading } = require("./vital");

const alertStatusEnum = ["open", "handling", "complete"];

const followUpLog = new mongoose.Schema({
  respRate: {
    type: Number,
    required: false,
  },
  heartRate: {
    type: Number,
    required: false,
  },
  bloodPressureSys: {
    type: Number,
    required: false,
  },
  bloodPressureDia: {
    type: Number,
    required: false,
  },
  spO2: {
    type: Number,
    required: false,
  },
  temperature: {
    type: Number,
    required: false,
  },
  datetime: {
    type: String,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
});

const alertSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: alertStatusEnum,
        message: "Invalid alert status: {VALUE}",
      },
      default: "open",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    sentBy: {
      type: String,
    },
    handledBy: {
      type: String,
    },
    followUps: {
      type: [followUpLog],
    },
    vitalsReading: {
      type:[VitalsReading]
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Alert || mongoose.model("Alert", alertSchema);
