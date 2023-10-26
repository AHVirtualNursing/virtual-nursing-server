const mongoose = require("mongoose");

const alertConfigSchema = new mongoose.Schema(
  {
    rrConfig: {
      type: [Number],
      default: [8, 32],
      required: true,
    },
    hrConfig: {
      type: [Number],
      default: [40, 130],
      required: true,
    },
    bpSysConfig: {
      type: [Number],
      default: [0, 120],
      required: true,
    },
    bpDiaConfig: {
      type: [Number],
      default: [0, 80],
      required: true,
    },
    spO2Config: {
      type: [Number],
      default: [95, 100],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.AlertConfig ||
  mongoose.model("AlertConfig", alertConfigSchema);
