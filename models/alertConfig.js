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

  const dvsDB = mongoose.connection.useDb('dvs');
  
  module.exports = dvsDB.models.AlertConfig || dvsDB.model('AlertConfig', alertConfigSchema);