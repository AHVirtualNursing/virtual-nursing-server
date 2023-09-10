const mongoose = require('mongoose');
const User = require('./user');

const nurseStatusEnum = ['normal', 'head'];

const nurseSchema = new mongoose.Schema(
    {
        patients: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Patient'
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
        },
        headNurse: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Nurse',
            default: null,
        },
        assignedWard: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Ward',
            default: null,
        },
    },     
    {
        timestamps: true,
    }
);

nurseSchema.add(User.schema);

const dvsDB = mongoose.connection.useDb('dvs');

module.exports =dvsDB.models.Nurse || dvsDB.model('Nurse', nurseSchema);