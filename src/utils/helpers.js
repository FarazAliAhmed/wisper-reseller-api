const axios = require('axios')
const uuid = require('uuid')
const _ = require('lodash')

const {create: addTransaction} = require('../services/transaction.service')
const {update} = require('../services/balance.service')
const {units, plans, network_ids} = require('./networkData')


export const get_plan_details = (plan_id) => {
    if (!plans.hasOwnProperty(plan_id)) return {error: true, status: 401, message: "Invalid Plan Id"}
    
    const selectedPlan = plans[plan_id]
    const volume_strings = selectedPlan.size.split(" ")
    const volume = parseInt(volume_strings[0]) * units[volume_strings[1]]
    
    return {
        ..._.pick(selectedPlan, ["validity"]), volume, id : plan_id, error: false
    }
}


export const get_network_provider = (network_provider) => {
    for (let ID in network_ids){
        if(network_ids[ID] === network_provider.trim().toLowerCase()){
            return {network: network_provider.trim().toLowerCase(), id: ID, error: false}
        }
    }
    return {error: true, status: 400, message: "Network Provider is Invalid"}
}


export const validate_phone_number = (number) => {
    if (number.length !== 11 && parseInt(number).length !== 10) {
      return {error: true, status: 401, message: "Invalid Phone Number"};
    }
    const ported = number.slice(0, 4) === "0913" ? "true" : "false",
    return {number, ported, error: false, message: "Phone Number is Valid"};
}


export const get_request_payload = (network, mobile_number, plan, Ported_number) => {
    return {
        network,
        mobile_number,
        plan,
        Ported_number,
    }
}


export const debit_account_balance = async (account_id, planDetails) => {
    const updatedBalance = await update(account_id, planDetails.volume)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


export const revert_debit_account_balance = async (account_id, planDetails) => {
    const incrementBy = planDetails.volume * -1
    const updatedBalance = await update(account_id, incrementBy)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


export const initiate_data_transfer = async (requestPayload) => {
    const url = "https://www.superjara.com/api/data/"
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    }
    axios.post(url, requestPayload, config).then(data => {
        return {error: false, response: data.data}
    }).catch(e => {
        return {error: true, message: "Data volume transafer failed"}
    })
}


export const format_transaction_response = (responseObject) => {
    // This function might be used later to format all response before sending
    return responseObject
}


export const save_transaction = async (business_id, details) => {
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

    const newTransaction = _.omit(details, ["previous_balance", "new_balance"])
    newTransaction.transaction_ref = uuid.v4()
    newTransaction.business_id = business_id

    const savedTransaction = await addTransaction(newTransaction)
    if (savedTransaction.transaction) return {error: false, status: 201, transaction: savedTransaction.transaction}
    savedTransaction.error = true
    return savedTransaction
}