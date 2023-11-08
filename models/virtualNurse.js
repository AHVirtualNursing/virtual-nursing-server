const mongoose = require("mongoose");
const User = require("./user");

const virtualNurseSchema = new mongoose.Schema(
  {
    wards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ward",
        default: null,
      },
    ],
    cardLayout: {
      allVitals: {
        type: Boolean,
        default: true
      },
      hr: {
        type: Boolean,
        default: true
      },
      rr: {
        type: Boolean,
        default: true
      },
      spo2: {
        type: Boolean,
        default: true
      },
      bp: {
        type: Boolean,
        default: true
      },
      temp: {
        type: Boolean,
        default: true
      },
      news2: {
        type: Boolean,
        default: true
      },
      allBedStatuses: {
        type: Boolean,
        default: true
      },
      rail: {
        type: Boolean,
        default: true
      },
      warnings: {
        type: Boolean,
        default: true
      },
      weight: {
        type: Boolean,
        default: true
      },
      fallRisk: {
        type: Boolean,
        default: true
      }
    },
  },
  {
    timestamps: true,
  }
);

virtualNurseSchema.add(User.schema);

module.exports = mongoose.model(
  "VirtualNurse",
  virtualNurseSchema,
  "virtual_nurses"
);
