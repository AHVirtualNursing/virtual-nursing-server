const mongoose = require("mongoose");
const User = require("./user");

const webUserSchema = new mongoose.Schema({}, { timestamps: true });

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
      exit: {
        type: Boolean,
        default: true
      },
      lowestPosition: {
        type: Boolean,
        default: true
      },
      brake: {
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

webUserSchema.add(User.schema);
virtualNurseSchema.add(User.schema);

const itAdmin = mongoose.model("itAdmin", webUserSchema, "it_admins");

const virtualNurse = mongoose.model(
  "virtualNurse",
  virtualNurseSchema,
  "virtual_nurses"
);

module.exports = {
  itAdmin,
  virtualNurse,
};
