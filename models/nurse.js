const mongoose = require("mongoose");
const User = require("./user");

const nurseStatusEnum = ["normal", "head"];

const nurseSchema = new mongoose.Schema(
  {
    smartBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SmartBed",
      },
    ],
    nurseStatus: {
      type: String,
      enum: {
        values: nurseStatusEnum,
        message: "Invalid nurse status: {VALUE}",
      },
      default: "normal",
      required: true,
    },
    headNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nurse",
      default: null,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      default: null,
    },
    mobilePushNotificationToken: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

nurseSchema.add(User.schema);
const Nurse = mongoose.models.Nurse || mongoose.model("Nurse", nurseSchema);

module.exports = {Nurse, nurseStatusEnum}
