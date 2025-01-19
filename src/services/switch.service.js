const DataSwitch = require('../models/dataSwitchModel');
const AirtimeSwitch = require('../models/airtimeSwitchModel');

// Service to add a new DataSwitch
exports.addDataSwitch = async (data) => {
    const newSwitch = new DataSwitch(data);
    return await newSwitch.save();
};

// Service to update an existing DataSwitch
exports.updateDataSwitch = async (id, data) => {
    return await DataSwitch.findOneAndUpdate({ network: id }, { api: data.api }, { new: true });
};

// Service to add a new AirtimeSwitch
exports.addAirtimeSwitch = async (data) => {
    const newSwitch = new AirtimeSwitch(data);
    return await newSwitch.save();
};

// Service to update an existing AirtimeSwitch
exports.updateAirtimeSwitch = async (id, data) => {
    return await AirtimeSwitch.findOneAndUpdate({ network: id }, { api: data.api }, { new: true });
}; 