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
  
  module.exports = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);