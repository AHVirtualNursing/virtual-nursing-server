const mongoose = require('mongoose');
wardTypeEnum = ['A1', 'B1', 'B2', 'C'];

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
    ],
    wardType: {
        type: String,
        enum: {
          values: wardTypeEnum,
          message: "Invalid Ward Type: {VALUE}",
        },
    }},
    {
        timestamps: true
    });


module.exports = mongoose.models.Ward || mongoose.model('Ward', wardSchema);

