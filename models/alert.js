const mongoose = require("mongoose");


const alertStatusEnum = ["open", "handling", "complete"]

const AlertVitals = new mongoose.Schema({
  reading: {
    type: Number,
    required: true,
  },
  vital:{
    type: String,
    required: true
  }
});

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

const NoteLog = new mongoose.Schema({
  info: {
    type: String,
    required: true,
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
      type: [NoteLog],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    handledBy: {
      type: String,
    },
    followUps: {
      type: [followUpLog],
    },
    alertVitals: {
      type:[AlertVitals]
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Alert || mongoose.model("Alert", alertSchema);
