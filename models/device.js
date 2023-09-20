const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Device || mongoose.model('Device', deviceSchema);
