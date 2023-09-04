const mongoose = require('mongoose');

const smartBedSchema = new mongoose.Schema({
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
    default: false,
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
  alerts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }
  ],
  alertConfig:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'AlertConfig',
  },
  reminders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Reminder'
    }
  ],
  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Report'
    }
  ]
      
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
  mongoose.models.SmartBed || mongoose.model('SmartBed', smartBedSchema);
