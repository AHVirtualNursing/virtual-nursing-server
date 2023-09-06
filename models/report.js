const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
  
  module.exports = dvsDB.models.Report || dvsDB.model('Report', reportSchema);