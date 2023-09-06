const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
    {
      content: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );
  
  const dvsDB = mongoose.connection.useDb('dvs');

  module.exports = dvsDB.models.Reminder || dvsDB.model('Reminder', reminderSchema);