const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    isComplete: {
      type: Boolean,
      default: false,
      required: true,
    },
    picture: {
      type: String,
      default: null,
      required: false,
    },
    createdBy: {
      type: String,
      default: null,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    interval: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Reminder =  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

module.exports = {
  Reminder,
  reminderSchema
}
