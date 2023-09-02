const mongoose = require('mongoose');

const SmartBedSchema = new mongoose.Schema({
  bedNum: {
    type: Number,
    required: true,
  },
  roomNum: {
    type: Number,
    required: true,
  },
  wardNum: {
    type: Number,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  occupied: {
    type: Boolean,
    required: true,
  },
  heartRate: {
    type: [VitalsReading],
  },
  respiratoryRate: {
    type: [VitalsReading],
  },
  bloodPressure: {
    type: [VitalsReading],
  },
  spo2: {
    type: [VitalsReading],
  },
  temperature: {
    type: [VitalsReading],
  },
  railsStatus: {
    type: Boolean,
  },
  note: {
    type: String,
  },
});

const VitalsReading = new mongoose.Schema(
  {
    reading: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.SmartBed || mongoose.model('SmartBed', SmartBedSchema);
