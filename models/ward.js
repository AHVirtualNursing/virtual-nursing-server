const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    num: {
        type: String,
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

module.exports =mongoose.models.Ward || mongoose.model('Ward', wardSchema);

