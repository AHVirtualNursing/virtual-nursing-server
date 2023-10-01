const { Long } = require("mongodb");
const mongoose = require("mongoose");

const patientO2IntakeEnum = ["air", "oxygen"];
const patientConsciousnessEnum = ["alert", "cvpu"];

const infoLog = new mongoose.Schema({
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
  }
});

const layoutSchema = new mongoose.Schema({
  i: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  w: {
    type: Number,
    required: true
  },
  h: {
    type: Number,
    required: true
  },
  minW: {
    type: Number,
    required: true
  },
  minH: {
    type: Number,
    required: true
  },
});

const layout = new mongoose.Schema({
  lg: [layoutSchema]
})

const defaultLayout = {
  lg: [
    { i: "rr", x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "hr", x: 4, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "o2", x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "bp", x: 0, y: 1, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "tp", x: 4, y: 1, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "alerts", x: 8, y: 1, w: 4, h: 4, minW: 3, minH: 3 },
  ]
}

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nric: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      required: true,
    },
    infoLogs: {
      type: [infoLog]
    },
    copd: {
      type: Boolean,
      default: false,
    },
    o2Intake: {
      type: String,
      enum: {
        values: patientO2IntakeEnum,
        message: "Invalid patient O2 intake status: {VALUE}",
      },
      default: patientO2IntakeEnum[0],
    },
    consciousness: {
      type: String,
      enum: {
        values: patientConsciousnessEnum,
        message: "Invalid patient consciousness status: {VALUE}",
      },
      default: patientConsciousnessEnum[0],
    },
    temperature: {
      type: Number,
      required: false,
    },
    isDischarged: {
      type: Boolean,
      default: false,
    },
    alerts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alert",
      },
    ],
    alertConfig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AlertConfig",
    },
    reminders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reminder",
      },
    ],
    vital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vital",
    },
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Report",
      },
    ],
    layout: {
      type: layout,
      default: defaultLayout
    }
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);
