const mongoose = require('mongoose');
const User = require('./user');

const nurseSchema = new mongoose.Schema({
    smartBeds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'SmartBed'
        }
    ]
  });

nurseSchema.add(User.schema);

module.exports =mongoose.models.Nurse || mongoose.model('Nurse', nurseSchema);