const mongoose = require('mongoose');
const User = require('./user');

const nurseStatusEnum = ['normal', 'head'];

const nurseSchema = new mongoose.Schema({
    smartBeds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'SmartBed'
        }
    ],
    nurseStatus: {
        type: String,
        enum: {
            values: nurseStatusEnum,
            message: 'Invalid nurse status: {VALUE}'
        },
        default: 'normal',
        required: true,
    }
  });

nurseSchema.add(User.schema);

module.exports =mongoose.models.Nurse || mongoose.model('Nurse', nurseSchema);