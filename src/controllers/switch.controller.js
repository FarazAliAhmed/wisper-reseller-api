const { dataSwitchUpdateSchema, airtimeSwitchUpdateSchema, dataSwitchSchema, airtimeSwitchSchema } = require('../validators/switch.validation');
const switchService = require('../services/switch.service');

// Controller to add a DataSwitch
exports.addDataSwitch = async (req, res) => {
    const { error } = dataSwitchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const newSwitch = await switchService.addDataSwitch(req.body);
        return res.status(201).json(newSwitch);
    } catch (err) {
        return res.status(500).json({ error: 'Error adding DataSwitch' });
    }
};

// Controller to update a DataSwitch
exports.updateDataSwitch = async (req, res) => {
    const { error } = dataSwitchUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const updatedSwitch = await switchService.updateDataSwitch(req.params.id, req.body);
        if (!updatedSwitch) return res.status(404).json({ error: 'DataSwitch not found' });
        return res.status(200).json(updatedSwitch);
    } catch (err) {
        return res.status(500).json({ error: 'Error updating DataSwitch' });
    }
};

// Controller to add an AirtimeSwitch
exports.addAirtimeSwitch = async (req, res) => {
    const { error } = airtimeSwitchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const newSwitch = await switchService.addAirtimeSwitch(req.body);
        return res.status(201).json(newSwitch);
    } catch (err) {
        return res.status(500).json({ error: 'Error adding AirtimeSwitch' });
    }
};

// Controller to update an AirtimeSwitch
exports.updateAirtimeSwitch = async (req, res) => {
    const { error } = airtimeSwitchUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const updatedSwitch = await switchService.updateAirtimeSwitch(req.params.id, req.body);
        if (!updatedSwitch) return res.status(404).json({ error: 'AirtimeSwitch not found' });
        return res.status(200).json(updatedSwitch);
    } catch (err) {
        return res.status(500).json({ error: 'Error updating AirtimeSwitch' });
    }
};

// Example function to get DataSwitch for a specific network
exports.getAllDataSwitch = async (req, res) => {
    const dataSwitch = await switchService.getAllDataSwitches();

    if (!dataSwitch) {
        return res.status(404).json({ error: 'DataSwitch not found for the specified network' });
    }

    return res.status(200).json(dataSwitch);
};

// Example function to get AirtimeSwitch for a specific network
exports.getAllAirtimeSwitch = async (req, res) => {
    const airtimeSwitch = await switchService.getAllAirtimeSwitches();

    if (!airtimeSwitch) {
        return res.status(404).json({ error: 'AirtimeSwitch not found for the specified network' });
    }

    return res.status(200).json(airtimeSwitch);
};