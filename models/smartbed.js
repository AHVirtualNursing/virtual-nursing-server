const mongoose = require('mongoose');
const Device = require("./device");

const bedStatusEnum = ['occupied','vacant']

const smartBedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  bedNum: {
    type: String,
    required: false,
  },
  roomNum: {
    type: String,
    required: false,
  },
  bedStatus: {
    type: String,
    enum: {
      values: bedStatusEnum,
      message: 'Invalid bed status: {VALUE}'
    },
    default: 'vacant',
    required: false,
  },
  railStatus: {
    type: Boolean,
    default: false,
    required: false,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false,
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: false,
  },
  nurses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nurse',
    required: false,
  }],     
},
{
  timestamps: true,
});

smartBedSchema.add(Device.schema)

module.exports =
  mongoose.models.SmartBed || mongoose.model('SmartBed', smartBedSchema);
