const { Long } = require("mongodb");
const mongoose = require("mongoose");

const patientO2IntakeEnum = ["air", "oxygen"];
const patientConsciousnessEnum = ["alert", "cvpu"];

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nric: {
      type:String,
      required: true
    },
    picture: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      required: true,
    },
    addInfo: {
      type: String,
      required: false,
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
    },
    consciousness: {
      type: String,
      enum: {
        values: patientConsciousnessEnum,
        message: "Invalid patient consciousness status: {VALUE}",
      },
      required: false,
    },
    temperature: {
        type: Number,
        required: false,
    },
    news2Score: {
      type: Object,
      required: false,
    },
    alerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert"
    }],
    reminders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder"
    }],
    isDischarged: {
      type: Boolean,
      default: false
    },
    vital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vital"
    }
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);
