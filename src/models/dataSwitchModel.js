const mongoose = require('mongoose');

// Define the enum for API providers
const APIPROVIDER_ENUM = [
    'ayinlak',
    'n3tdata',
    'gladtidings',
    "gloworld",
    'vtpass',
    'gsubz',
    'smeplug',
    'autopilot',
    'superjara',
];

// Define the enum for networks
const NETWORK_ENUM = [
    'mtn',
    'glo',
    'airtel',
    '9mobile',
];

// DataSwitch model
const dataSwitchSchema = new mongoose.Schema({
    network: {
        type: String,
        enum: NETWORK_ENUM, // Set network as an enum
        required: true,
    },
    api: {
        type: String,
        enum: APIPROVIDER_ENUM,
        required: true,
    },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

const DataSwitch = mongoose.model('DataSwitch', dataSwitchSchema);

module.exports = DataSwitch; 