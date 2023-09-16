const mongoose = require('mongoose');

const wardTypeEnum = ["A1", "B1", "B2", "C"]

const wardSchema = new mongoose.Schema({
    wardNum: {
        type: String,
        required: true,
    },
    wardType: {
        type: String,
        enum: {
            values: wardTypeEnum,
            message: 'Invalid ward type status: {VALUE}',
        },
        required: false,
    },
    numRooms: {
        type: Number,
        required: true,
    },
    smartBeds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'SmartBed'
        }
    ]},
    {
        timestamps: true,
    });


module.exports = mongoose.models.Ward || mongoose.model('Ward', wardSchema);

