const _ = require('lodash')
const Joi = require('joi')
const {
    getOne,
    getAll,
    createOne,
    updateOne,
    deleteOne,
    deleteNetwork,
    deleteAll,
} = require('../services/plan.service')

const { loadPlans } = require('../scripts/loader')
const { Account } = require('../models/account')

const getAllPlans = async (req, res) => {
    const {plan, message, error} = await getAll()
    if(error) return res.status(400).json({message, status: "failed"})
    return res.status(200).json({
        plan: _.map(plan, _.partialRight(_.pick, [
            "plan_id", "network",
            "plan_type", "volume",
            "unit", "validity",
            "size", "id"
        ])),
        message,
        status: "success"
    })
    // "price",
}


const getOnePlan = async (req, res) => {
    const {plan_id} = req.params
    const planResponse = await getOne(plan_id)
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    return res.status(200).json({...planResponse, status: "success"})
}


const createOnePlan = async (req, res) => {
    const fields = req.body
    const {error} = validateCreate(fields)
    if(error) return res.status(400).json({status: "failed", message: error.details[0].message})
    const planResponse = await createOne(fields)
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    await loadPlans()
    return res.status(200).json({...planResponse, status: "success"})
}


const updateOnePlan = async (req, res) => {
    const {plan_id} = req.params
    const fields = req.body
    const {error} = validateUpdate(fields)
    if(error) return res.status(400).json({status: "failed", message: error.details[0].message})
    const planResponse = await updateOne(plan_id, fields)
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    await loadPlans()
    return res.status(200).json({...planResponse, status: "success"})
}


const deleteOnePlan = async (req, res) => {
    const {plan_id} = req.params
    const planResponse = await deleteOne(plan_id)
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    await loadPlans()
    return res.status(200).json({...planResponse, status: "success"})
}

const deleteNetworkPlans = async (req, res) => {
    const {network} = req.params
    const planResponse = await deleteNetwork(network)
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    await loadPlans()
    return res.status(200).json({...planResponse, status: "success"})
}

const deleteAllPlans = async (req, res) => {
    const planResponse = await deleteAll()
    if(planResponse.error) return res.status(400).json({..._.omit(planResponse, ['error']), status: "failed"})
    await loadPlans()
    return res.status(200).json({...planResponse, status: "success"})
}



// user plans new

// Get plans by user ID
const getPlansByUserId = async (req, res) => {
    try {
      const user = await Account.findById(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user.plans);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};


const createPlanUser = async (req, res) => {
    try {
      const user = await Account.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newPlan = {
        plan_id: req.body.plan_id,
        network: req.body.network,
        plan_type: req.body.plan_type,
        price: req.body.price,
        volume: req.body.volume,
        unit: req.body.unit,
        validity: req.body.validity
      };
  
      user.plans.push(newPlan);
      await user.save();
  
      res.status(201).json(user.plans);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};


const updatePlanUser = async (req, res) => {
    try {
      const user = await Account.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const planToUpdate = user.plans.id(req.params.planId);
  
      if (!planToUpdate) {
        return res.status(404).json({ error: 'Plan not found' });
      }
  
      // Update the plan fields if provided in the request body
      if (req.body.plan_id) {
        planToUpdate.plan_id = req.body.plan_id;
      }
      if (req.body.network) {
        planToUpdate.network = req.body.network;
      }
      if (req.body.plan_type) {
        planToUpdate.plan_type = req.body.plan_type;
      }
      if (req.body.price) {
        planToUpdate.price = req.body.price;
      }
      if (req.body.volume) {
        planToUpdate.volume = req.body.volume;
      }
      if (req.body.unit) {
        planToUpdate.unit = req.body.unit;
      }
      if (req.body.validity) {
        planToUpdate.validity = req.body.validity;
      }
  
      await user.save();
  
      res.json(user.plans);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deletePlanUser = async (req, res) => {
    try {
      const user = await Account.findById(req.params.userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const planToDelete = user.plans.id(req.params.planId);
  
      if (!planToDelete) {
        return res.status(404).json({ error: 'Plan not found' });
      }
  
      planToDelete.remove();
      await user.save();
  
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
}


const validateCreate = (fields) => {
    const schema = Joi.object({
        plan_id: Joi.number()
                    .required(),
        network: Joi.string()
                    .valid('mtn', 'airtel', 'glo', '9mobile')
                    .required(),
        plan_type: Joi.string()
                    .valid('gifting', 'sme')
                    .required(),
        price: Joi.number()
                    .required(),
        volume: Joi.number()
                    .required(),
        unit: Joi.string()
                    .valid('mb', 'gb', 'tb')
                    .required(),
        validity: Joi.string()
                    .required()
    })

    return schema.validate(fields)
}


const validateUpdate = (fields) => {
    const schema = Joi.object({
        plan_id: Joi.number(),
        network: Joi.string()
                    .valid('mtn', 'airtel', 'glo', '9mobile'),
        plan_type: Joi.string()
                    .valid('gifting', 'sme'),
        price: Joi.number(),
        volume: Joi.number(),
        unit: Joi.string()
                    .valid('mb', 'gb', 'tb'),
        validity: Joi.string()
    })

    return schema.validate(fields)
}


module.exports = {
    getAllPlans,
    getOnePlan,
    createOnePlan,
    updateOnePlan,
    deleteOnePlan,
    deleteAllPlans,
    deleteNetworkPlans,
    // new plans
    createPlanUser,
    getPlansByUserId,
    deletePlanUser,
    updatePlanUser
}