const mongoose = require("mongoose");

const ChatMessage = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    alert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
      required: false,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: false,
    }
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    virtualNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "virtualNurse",
      required: true,
    },
    bedsideNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nurse",
      required: true,
    },
    messages: {
      type: [ChatMessage],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
