const mongoose = require('mongoose');

const alertStatusEnum = ['open', 'handling', 'complete'];

const alertSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: alertStatusEnum,
        message: 'Invalid alert status: {VALUE}'
      },
      default: 'open',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    delegatedNurseId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const dvsDB = mongoose.connection.useDb('dvs');

module.exports = dvsDB.models.Alert || dvsDB.model('Alert', alertSchema);
