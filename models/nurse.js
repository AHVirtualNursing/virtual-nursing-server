const mongoose = require('mongoose');
const User = require('./user');

const nurseStatusEnum = ['normal', 'head'];

const nurseSchema = new mongoose.Schema({
    wards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Ward'
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

const dvsDB = mongoose.connection.useDb('dvs');

module.exports =dvsDB.models.Nurse || dvsDB.model('Nurse', nurseSchema);