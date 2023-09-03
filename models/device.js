const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dateAdded: {
    type: String,
  },
});

module.exports =
  mongoose.models.Device || mongoose.model('Device', deviceSchema);
