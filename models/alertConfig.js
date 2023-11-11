const mongoose = require("mongoose");

const alertConfigSchema = new mongoose.Schema(
  {
    rrConfig: {
      type: [Number],
      default: [8, 25],
      required: true,
    },
    hrConfig: {
      type: [Number],
      default: [40, 130],
      required: true,
    },
    bpSysConfig: {
      type: [Number],
      default: [90, 220],
      required: true,
    },
    bpDiaConfig: {
      type: [Number],
      default: [0, 80],
      required: true,
    },
    spO2Config: {
      type: [Number],
      default: [91, 100],
      required: true,
    },
    temperatureConfig: {
      type: [Number],
      default: [35, 39],
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const AlertConfig = mongoose.models.AlertConfig ||
mongoose.model("AlertConfig", alertConfigSchema);

module.exports = {
  AlertConfig,
  alertConfigSchema
}
  
