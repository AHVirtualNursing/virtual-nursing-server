const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dateAdded: {
    type: String,
  },
});

const sdmsDB = mongoose.connection.useDb('sdms');

module.exports =
  sdmsDB.models.Device || sdmsDB.model('Device', deviceSchema);
