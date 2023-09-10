const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    dateAdded: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const sdmsDB = mongoose.connection.useDb('sdms');

const sdmsDB = mongoose.connection.useDb('sdms');

module.exports =
  sdmsDB.models.Device || sdmsDB.model('Device', deviceSchema);
