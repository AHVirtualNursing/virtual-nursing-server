const mongoose = require('mongoose');

const alertStatusEnum = ['open', 'handling', 'complete'];

const alertSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: alertStatusEnum,
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

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
