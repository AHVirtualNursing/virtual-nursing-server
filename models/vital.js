const mongoose = require("mongoose");

const VitalsReading = new mongoose.Schema({
  reading: {
    type: Number,
    required: true,
  },
  datetime: {
    type: String,
    required: true,
  },
});

const vitalSchema = new mongoose.Schema(
  {
    respRate: {
      type: [VitalsReading],
    },
    heartRate: {
      type: [VitalsReading],
    },
    bloodPressureSys: {
      type: [VitalsReading],
    },
    bloodPressureDia: {
      type: [VitalsReading],
    },
    spO2: {
      type: [VitalsReading],
    },
    news2Score: {
      type: [VitalsReading],
    },
    temperature: {
      type: [VitalsReading],
    },
  },
  {
    timestamps: true,
  }
);

const Vital = mongoose.models.Vital || mongoose.model("Vital", vitalSchema);

module.exports = {
  Vital, vitalSchema
}