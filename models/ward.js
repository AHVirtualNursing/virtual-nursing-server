const mongoose = require('mongoose');
const Ward = require('./ward');

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
    ]
  });

module.exports =mongoose.models.Ward || mongoose.model('Ward', wardSchema);