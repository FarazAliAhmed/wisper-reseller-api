const Plan = require('../models/plan')


const createOne = async (fields) => {
    try{
        const newPlan = new Plan({
            ...fields
        })
        const planResponse = await newPlan.save()
        return {plan: planResponse, message: "New data plan successfully created"}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to CREATE a plan at this time"}
    }
}

const getAll = async () => {
    try{
        const planResponse = await Plan.find().sort({ network: 1, unit: -1, plan_type: 1, volume: 1 }).exec()
        return {plan: planResponse, message: "Data Plans fetch successfully"}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to FETCH ALL plans att this time"}
    }
}

const getOne = async (plan_id) => {
    try{
        const planResponse = await Plan.findOne({plan_id}).exec()
        if(!planResponse) return {error: true, message: "No Such plan exists"}
        return {plan: planResponse, message: "Plan details fetched successfully"}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to FETCH plan details at this time"}
    }
}


const updateOne = async (plan_id, fields) => {
    try{
        const planResponse = await Plan.findOneAndUpdate({plan_id}, {...fields}, {new: true}).exec()
        return {plan: planResponse, message: "Plan details Successfully updated"}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to UPDATE plan details at this time"}
    }
}


const deleteOne = async (plan_id) => {
    try{
        const deleteResponse = await Plan.findOneAndDelete({plan_id}).exec()
        if(!deleteResponse) return {error: true, message: "Error! Plan Does not exist"}
        return {plan: deleteResponse, message: "Plan Successfully deleted"}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to DELETE plan details at this time"}
    }
}

const deleteNetwork = async (network) => {
    try{
        const deleteResponse = await Plan.deleteMany({network}).exec()
        return {plan: deleteResponse, message: `ALL ${network} data plans have been deleted successfully`}
    }catch(e){
        console.log(e.message)
        return {error: true, message: `Error! Unable to DELETE ALL ${network} data plans`}
    }
}


const deleteAll = async () => {
    try{
        const deleteResponse = await Plan.deleteMany({}).exec()
        return {plan: deleteResponse, message: `ALL data plans for all networks have been deleted successfully`}
    }catch(e){
        console.log(e.message)
        return {error: true, message: "Error! Unable to DELETE ALL data plans for all networks"}
    }
}


module.exports = {
    createOne,
    getOne,
    getAll,
    updateOne,
    deleteOne,
    deleteNetwork,
    deleteAll,
}