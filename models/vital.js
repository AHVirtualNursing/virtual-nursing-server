const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
    respRate: {
        type: Object,
      },
      heartRate: {
        type: Object,
      },
      bloodPressure: {
        type: Object,
      },
      spO2: {
        type: Object,
      },
      pulse: {
        type: Object,
      }
  });

module.exports =mongoose.models.Vital || mongoose.model('Vital', vitalSchema);