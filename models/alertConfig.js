const mongoose = require('mongoose');

const alertConfigSchema = new mongoose.Schema(
    {
      rrConfig:{
        type:[Number]
      },
      hrConfig:{
        type:[Number]
      }   
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = mongoose.models.AlertConfig || mongoose.model('AlertConfig', alertConfigSchema);