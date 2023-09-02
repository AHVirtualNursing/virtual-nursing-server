const mongoose = require('mongoose');

const SmartBedSchema = new mongoose.Schema({
  bedNum: {
    type: Number,
  },
  roomNum: {
    type: Number,
  },
  wardNum: {
    type: Number,
  },
  patientName: {
    type: String,
  },
  occupied: {
    type: Boolean,
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

module.exports =
  mongoose.models.SmartBed || mongoose.model('SmartBed', SmartBedSchema);
