const Joi = require('joi');

// Validation schema for DataSwitch
const dataSwitchSchema = Joi.object({
    network: Joi.string().valid('mtn', 'glo', 'airtel', '9mobile').required(),
    api: Joi.string().valid('ayinlak', 'n3tdata', 'gladtidings', 'vtpass', 'gsubz', 'gloworld', 'smeplug').required(),
});

// Partial validation schema for DataSwitch updates
const dataSwitchUpdateSchema = Joi.object({
    network: Joi.string().valid('mtn', 'glo', 'airtel', '9mobile').optional(),
    api: Joi.string().valid('ayinlak', 'n3tdata', 'gladtidings', 'vtpass', 'gsubz', 'gloworld', 'smeplug').optional(),
});

// Validation schema for AirtimeSwitch
const airtimeSwitchSchema = Joi.object({
    network: Joi.string().valid('mtn', 'glo', 'airtel', '9mobile').required(),
    api: Joi.string().valid('ayinlak', 'n3tdata', 'gladtidings', 'vtpass', 'gsubz', 'gloworld', 'smeplug').required(),
});

// Partial validation schema for AirtimeSwitch updates
const airtimeSwitchUpdateSchema = Joi.object({
    network: Joi.string().valid('mtn', 'glo', 'airtel', '9mobile').optional(),
    api: Joi.string().valid('ayinlak', 'n3tdata', 'gladtidings', 'vtpass', 'gsubz', 'gloworld', 'smeplug').optional(),
});

// Export the validation schemas
module.exports = {
    dataSwitchSchema,
    dataSwitchUpdateSchema,
    airtimeSwitchSchema,
    airtimeSwitchUpdateSchema,
};