const axios = require('axios')
const _ = require('lodash')
const moment = require('moment-timezone')

const {create: addTransaction, update: updateTransaction} = require('../services/transaction.service')
const {debit} = require('../services/balance.service')
const {units, plans, network_ids, numbers: network_numbers, ported_numbers, simservers_size_map} = require('./networkData')


exports.get_plan_details = async (plan_id) => {
    delete require.cache[require.resolve('./networkData')]
    const plans = require('./networkData').plans
    
    if (!plans.hasOwnProperty(plan_id)) return {error: true, status: 401, message: "Invalid Plan Id"}
    const selectedPlan = plans[plan_id]
    const volume_strings = selectedPlan.size.split(" ")
    const volume = parseInt(volume_strings[0]) * units[volume_strings[1]]
    
    return {
        ..._.pick(selectedPlan, ["validity", "price", "network", "plan_type", "size"]), volume, id : plan_id, error: false
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


exports.initiate_data_transfer = async (requestPayload, {size, ref}) => {  
    const url = "https://www.superjara.com/api/data/"
    const authorization = `Token ${process.env.SUPERJARA_AUTH_KEY_OLD}`

    const simservers_url = "https://api.simservers.io"
    const simservers_key = process.env.SIMSERVERS_KEY

    try{
        if(requestPayload.network == 4){
            const {error, param} = simservers_size_map(size)
            if (error) return {error: true, status: 400, message: "This data plan is not available"}

            const req_body = {
                "process": "buy",
                "product_code": param,
                "recipient": requestPayload.mobile_number,
                "user_reference": ref,
                "api_key": simservers_key,
            }
            const response = await axios.post(
                simservers_url,
                req_body,
                {headers: {'Content-Type': 'application/json'}}
            )
            if(response.data && response.data["status"] == true && response.data["data"]["text_status"] == "success"){
                return {error: false, response: response.data}
            }else{
                return {error: true, status: 400, message: "An error occured with data transfer server"}
            }
        }else{
            const response = await axios.post(
                url,
                requestPayload,
                {headers: {"Authorization": authorization,"Content-Type": "application/json"}}
            )
            if(response.data && response.data.Status && response.data.Status === "successful"){
                return {error: false, response: response.data}
            }else{
                return {error: true, status: 400, message: "An error occured with data transfer server"}
            }
        }
    }catch(e){
        console.log("ERROOORR::", e.message)
        return {error: true, status: 400, message: "Data volume transafer failed"}
    }
}


exports.superjara_balance = async () => {
    const url = "https://www.superjara.com/api/data/"
    const config_1 = {
        headers: {
            "Authorization": `Token ${process.env.SUPERJARA_AUTH_KEY_OLD}`,
            "Content-Type": "application/json"
        }
    }

    const config_2 = {
        headers: {
            "Authorization": `Token ${process.env.SUPERJARA_AUTH_KEY_AIRTEL}`,
            "Content-Type": "application/json"
        }
    }
    try{
        const [response_1, response_2] = await Promise.all([
            axios.get(url, config_1),
            axios.get(url, config_2)
        ])
        const account_1 = (response_1.data.results[0] && response_1.data.results[0].balance_after) || 0
        const account_2 = (response_2.data.results[0] && response_2.data.results[0].balance_after) || 0
        return {balance: {account_1, account_2}, message: "API balance successfully fetched"}
    }catch(e){
        console.log("ERROOORR::", e.stack)
        return {error: true, message: "Error! Unable to fetch data balance"}
    }
}


exports.format_transaction_response = ({
    type, debitAccount, validNumber, providerId,
    planDetails, uuid, getCurrentTime
}) => {
    const responseObject = {}
    responseObject.new_balance = type === "mega" ? 
        debitAccount.balance.mega_wallet
            :
        `${debitAccount.balance.data_unit} ${debitAccount.balance.wallet_balance}`;
    responseObject.phone_number = validNumber.number;
    responseObject.status = "success";
    responseObject.network_provider = providerId.network;
    responseObject.data_volume = planDetails.volume;
    responseObject.plan_id = planDetails.id;
    responseObject.price = planDetails.price;
    responseObject.transaction_ref = uuid.v4();
    responseObject.created_at = getCurrentTime();
    return responseObject
}


exports.save_transaction = async (business_id, details) => {

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

exports.getCurrentTime = () => {
    return moment().tz('Africa/Lagos').format('YYYY/MM/D hh:mm:ss A')
}