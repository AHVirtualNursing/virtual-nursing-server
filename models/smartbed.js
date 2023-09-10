const mongoose = require('mongoose');

const bedStatusEnum = ['occupied','vacant', 'ready'];

const smartBedSchema = new mongoose.Schema({
  bedNum: {
    type: Number,
    required: true,
  },
  roomNum: {
    type: Number,
    required: true,
  },
  bedStatus: {
    type: String,
    enum: {
      values: bedStatusEnum,
      message: 'Invalid bed status: {VALUE}'
    },
    default: 'vacant',
    required: true,
  },
  railStatus: {
    type: Boolean,
    default: false,
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false,
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true,
  }      
});

const dvsDB = mongoose.connection.useDb('dvs');

module.exports =
  dvsDB.models.SmartBed || dvsDB.model('SmartBed', smartBedSchema);
