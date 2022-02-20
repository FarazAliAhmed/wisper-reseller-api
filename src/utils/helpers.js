const axios = require('axios')
const uuid = require('uuid')
const _ = require('lodash')

const {create: addTransaction} = require('../services/transaction.service')
const {debit} = require('../services/balance.service')
const {units, plans, network_ids} = require('./networkData')


exports.get_plan_details = (plan_id) => {
    if (!plans.hasOwnProperty(plan_id)) return {error: true, status: 401, message: "Invalid Plan Id"}
    
    const selectedPlan = plans[plan_id]
    const volume_strings = selectedPlan.size.split(" ")
    const volume = parseInt(volume_strings[0]) * units[volume_strings[1]]
    
    return {
        ..._.pick(selectedPlan, ["validity"]), volume, id : plan_id, error: false
    }
}


exports.get_network_provider = async (network_provider) => {
    for (let ID in network_ids){
        if(network_ids[ID] === network_provider.trim().toLowerCase()){
            return {network: network_provider.trim().toLowerCase(), id: ID, error: false}
        }
    }
    return {error: true, status: 400, message: "Network Provider is Invalid"}
}


exports.validate_phone_number = async (number) => {
    if (number.length !== 11 && parseInt(number).length !== 10) {
      return {error: true, status: 401, message: "Invalid Phone Number"};
    }
    const ported = number.slice(0, 4) === "0913" ? "true" : "false"
    return {number, ported, error: false, message: "Phone Number is Valid"};
}


exports.get_request_payload = async (network, mobile_number, plan, Ported_number) => {
    return {
        network,
        mobile_number,
        plan,
        Ported_number,
    }
}


exports.debit_account_balance = async (account_id, planDetails) => {
    const updatedBalance = await debit(account_id, planDetails.volume)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


exports.revert_debit_account_balance = async (account_id, planDetails) => {
    const incrementBy = planDetails.volume * -1
    const updatedBalance = await debit(account_id, incrementBy)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


exports.initiate_data_transfer = async (requestPayload) => {
    const url = "https://www.superjara.com/api/data/"
    const config = {
        headers: {
            "Authorization": `Token ${process.env.SUPERJARA_AUTH_KEY}`,
            "Content-Type": "application/json"
        }
    }

    const response = await axios.post(url, requestPayload, config)
    if(response.data) return {error: false, response: response.data}
    return {error: true, message: "Data volume transafer failed"}
}


exports.format_transaction_response = async (responseObject) => {
    // This function might be used later to format all response before sending
    return responseObject
}


exports.save_transaction = async (business_id, details) => {
    // validate the transaction body
    // The below object is kept for reference. Incase i get confused.

    // const newTransaction = {
    //     transaction_ref: uuid.v4(),
    //       phone_number: details.phone_number,
    //       data_volume: details.data_volume,
    //       business_id,
    //       plan_id: details.plan_id,
    //       status: details.status,
    //       network_provider: details.network_provider,
    // }

    let newTransaction = _.omit(details, ["previous_balance", "new_balance"])
    newTransaction.transaction_ref = uuid.v4()
    newTransaction.business_id = business_id
    console.log("Transaction to save: ", newTransaction)
    try {
        const savedTransaction = await addTransaction(newTransaction)
        // if (savedTransaction.transaction) return {error: false, status: 201, transaction: savedTransaction.transaction}
        // savedTransaction.error = true
        // return savedTransaction
        return {error: false, status: 201, transaction: savedTransaction.transaction}
    }catch(e){
        newTransaction.error = true
        return newTransaction 
    }
}