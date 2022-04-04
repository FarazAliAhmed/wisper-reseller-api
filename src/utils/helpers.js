const axios = require('axios')
const _ = require('lodash')

const {create: addTransaction, update: updateTransaction} = require('../services/transaction.service')
const {debit} = require('../services/balance.service')
const {units, plans, network_ids, numbers: network_numbers, ported_numbers} = require('./networkData')


exports.get_plan_details = (plan_id) => {
    if (!plans.hasOwnProperty(plan_id)) return {error: true, status: 401, message: "Invalid Plan Id"}
    
    const selectedPlan = plans[plan_id]
    const volume_strings = selectedPlan.size.split(" ")
    const volume = parseInt(volume_strings[0]) * units[volume_strings[1]]
    
    return {
        ..._.pick(selectedPlan, ["validity", "price", "network", "plan_type"]), volume, id : plan_id, error: false
    }
}


exports.get_network_provider = (network_provider) => {
    for (let ID in network_ids){
        if(network_ids[ID] === network_provider.trim().toLowerCase()){
            return {network: network_provider.trim().toLowerCase(), id: ID, error: false}
        }
    }
    return {error: true, status: 400, message: "Network Provider is Invalid"}
}


exports.validate_phone_number = (number, network_provider) => {
    if (number.length !== 11 && parseInt(number).length !== 10) {
      return {error: true, status: 401, message: "Invalid Phone Number"};
    }
    const init = number.slice(0, 4)
    if(!(network_numbers[network_provider].includes(init)))
        return {error: true, status: 401, message: "Network Provider and Phone Number do not match"};

    const ported = ported_numbers.includes(init) ? "true" : "false";
    return {number, ported, error: false, message: "Phone Number is Valid"};
}


exports.get_request_payload = (network, mobile_number, plan, Ported_number) => {
    return {
        network,
        mobile_number,
        plan,
        Ported_number,
    }
}

// 

const getFieldAndAmount = (type, planDetails) => {
    let { volume, price, network, plan_type, } = planDetails

    if(type === "mega"){
        let pType;
        if(network === "mtn"){
            if(plan_type === "sme"){
                volume = volume < 1024 ? volume : volume < 1048576 ? ~~(volume / 1024) * 1000 : ~~(volume / 1048576) * 1000000
                pType = `${network}_sme`
            }else if(plan_type.includes("gifting")){
                pType = `${network}_gifting`
            }else{
                pType = `${network}`
            }
        }else{
            pType = `${network}`
        }
        return {field: `mega_wallet.${pType}`, amount: volume}
    }else{
        return {field: "wallet_balance", amount: price}
    }
}

exports.debit_account_balance = async (account_id, planDetails, type) => {
    const {amount, field} = getFieldAndAmount(type, planDetails)
    const updatedBalance = await debit(account_id, amount, field)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


exports.revert_debit_account_balance = async (account_id, planDetails, type) => {
    const {amount, field} = getFieldAndAmount(type, planDetails)
    const incrementBy = amount * -1
    const updatedBalance = await debit(account_id, incrementBy, field)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


exports.initiate_data_transfer = async (requestPayload) => {
    // const url = "https://www.superjara.com/api/data/"
    // const url = "https://superjarang.com/api/data"
    const url = "https://www.superjaraapi.com/api/data/"
    const config = {
        headers: {
            "Authorization": `Token ${process.env.SUPERJARA_AUTH_KEY}`,
            "Content-Type": "application/json"
        }
    }
    try{
        const response = await axios.post(url, requestPayload, config)
        // Status: 'successful'
        if(response.data && response.data.Status && response.data.Status === "successful"){
            return {error: false, response: response.data}
        }else{
            return {error: true, status: 400, message: "An error occured with data transfer server"}
        }
    }catch(e){
        console.log("ERROOORR::", e.stack)
        return {error: true, status: 400, message: "Data volume transafer failed"}
    }
}


exports.format_transaction_response = (responseObject) => {
    // This function might be used later to format all response before sending
    return responseObject
}


exports.save_transaction = async (business_id, details) => {
    
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
    // let newTransaction = _.omit(details, ["previous_balance", "new_balance"])

    const newTransaction = details
    newTransaction.business_id = business_id
    try {
        const savedTransaction = await addTransaction(newTransaction)
        return {error: false, status: 201, transaction: savedTransaction.transaction}
    }catch(e){
        return {error: true, status: 400, transaction: newTransaction}
    }
}

exports.update_transaction_status = async (transaction_ref, status) => {
    const updateQuery = {transaction_ref}
    const updateBody = {status}
    try{
        const response = await updateTransaction(updateQuery, updateBody)
        return {error: false, status: 201, transaction: response.transaction}
    }catch(e){
        return { error: true, status: 400, message: `Unable to update transaction` };
    }
}

exports.nairaToData = (nairaAmount) => {
    return (parseInt(nairaAmount) / 300) * 1024
}