const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema(
    {
      num: {
        type: Number,
      },
    },
    {
      timestamps: true,
    },
  );

  const dvsDB = mongoose.connection.useDb('dvs');
  
  module.exports = dvsDB.models.Report || dvsDB.model('Ward', wardSchema);