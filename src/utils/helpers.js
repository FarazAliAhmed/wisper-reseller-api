const axios = require('axios')
const joi = require('joi')
const _ = require('lodash')
const moment = require('moment-timezone')

const Maintenance = require('../models/maintenance');

const {integration_response} = require('../events/_eventTypes')
const IntegrationEvents = require('../events/integration.event')

const {create: addTransaction, update: updateTransaction} = require('../services/transaction.service')
const {debit} = require('../services/balance.service')
const {units, plans, network_ids, numbers: network_numbers, ported_numbers, simservers_size_map, ogdams_size_map} = require('./networkData')

// Config variables
const fastlink_url = "https://www.fastlink.com.ng/api/data/";
const fastlink_gifting_auth = `Token ${process.env.FASTLINK_AUTH_KEY}`;
const fastlink_sme_auth = `Token ${process.env.FASTLINK_AUTH_KEY_SME}`;

const simservers_url = "https://api.simservers.io";
const simservers_key = process.env.SIMSERVERS_KEY;

const ogdams_url = "https://simhosting.ogdams.ng/api/v1/vend/data";
const ogdams_key = process.env.OGDAMS_KEY


// Names of integration used in saving gateway response to DB
const integrationTypes = {
    SUPERJARA: 'SUPERJARA',
    FASTLINK: 'FASTLINK',
    SIMSERVER: 'SIMSERVER',
    OGDAMS: 'OGDAMS',
    UNKNOWN: 'UNKNOWN',
}



exports.validateSendData = (body) => {
    const schema = joi.object({
        network: joi.string()
            .valid("mtn", "glo", "9mobile", "airtel")
            .required(),
        plan_id: joi.number()
            .required(),
        phone_number: joi.string()
            .required(),
        allocate_for_business: joi.boolean(),
        business_id: joi.string()
    })

    return schema.validate(body, {abortEarly: false})
}

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
        }else if(network === "airtel"){
            volume = volume < 1024 ? volume : volume < 1048576 ? ~~(volume / 1024) * 1000 : ~~(volume / 1048576) * 1000000
            pType = `${network}`
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
    return {error: false, status: 201, balance: updatedBalance.balance, debited: amount}
}


exports.revert_debit_account_balance = async (account_id, planDetails, type) => {
    const {amount, field} = getFieldAndAmount(type, planDetails)
    const incrementBy = amount * -1
    const updatedBalance = await debit(account_id, incrementBy, field)
    if(updatedBalance.error) return updatedBalance
    return {error: false, status: 201, balance: updatedBalance.balance}
}


// Get config header for fastlink API calls
function getConfig(type){
    return {
        headers: {
            "Authorization": (type == "gifting") ? fastlink_gifting_auth : fastlink_sme_auth,
            "Content-Type": "application/json"
        }
    }
}


exports.initiate_data_transfer = async (requestPayload, {size, ref, type}) => {  
    try{
        if(requestPayload.network == 4){
            // Data purchase for Airtel

            // Purchase from SIMSERVER
            /*
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
            */

            // Purchase from OGDAMS SIMHOSTING
            const {error, plan_id} = ogdams_size_map(size)
            if (error) return {error: true, status: 400, message: "This data plan is currently not available"}

            const req_header = {
                headers: {
                    'Authorization': `Bearer ${ogdams_key}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }

            const req_body = {
                "networkId" : 2,    // Do not change this: networkId = 2 is for Airtel
                "planId" : plan_id,
                "phoneNumber" : requestPayload.mobile_number
            }

            const response = await axios.post(
                ogdams_url,
                req_body,
                req_header
            )

            // Fire event to save gateway response to DB
            const integResp = response.data
            const integName = integrationTypes.OGDAMS
            IntegrationEvents.emit(integration_response, {
                integration: integName,
                response: integResp,
            })

            // SIMSERVER RESPONSE CHECK
            /*
            if(integResp && integResp["status"] == true && integResp["data"]["text_status"] == "success"){
                const message = integResp["data"]["true_response"]
                return {error: false, response: integResp, message}
            }else{
                return {error: true, status: 400, message: "An error occured with data transfer server"}
            }
            */

            // OGDAMS RESPONSE CHECK
            if(integResp && integResp["status"] == true && [200, 201, 202].includes(integResp["code"])){
                const message = integResp["data"]["msg"]
                return {error: false, response: integResp, message}
            }else{
                return {error: true, status: 400, message: "An error occured with data transfer server"}
            }
        }else{
            // Data purchase for other network
            const response = await axios.post(
                fastlink_url,
                requestPayload,
                getConfig(type),
            )

             // Fire event to save gateway response to DB
            const integResp = response.data
            const integName = integrationTypes.FASTLINK
            IntegrationEvents.emit(integration_response, {
                integration: integName,
                response: integResp,
            })

            // Fire event to save fastlink gateway response to DB
            if(response.data && response.data.Status && response.data.Status === "successful"){
                const message = "Data purchase was successful. Check Balance to confirm."
                return {error: false, response: response.data, message}
            }else{
                return {error: true, status: 400, message: "An error occured with data transfer server"}
            }
        }
    }catch(e){
        console.log("ERROOORR::", e.message)
        
        // Fire event to save gateway response to DB
        IntegrationEvents.emit(integration_response, {
            integration: integrationTypes.UNKNOWN,
            response: e?.response?.data,
        })
        return {error: true, status: 400, message: "Data volume transafer failed"}
    }
}


exports.superjara_balance = async () => {
    try{
        const [response_1] = await Promise.all([
            axios.get(fastlink_url, getConfig('gifting')),
            axios.get(fastlink_url, getConfig('sme')),
        ])
        const account_1 = (response_1.data.results[0] && response_1.data.results[0].balance_after) || 0
        const account_2 = (response_1.data.results[1] && response_1.data.results[1].balance_after) || 0
        return {balance: {account_1, account_2}, message: "API balance successfully fetched"}
    }catch(e){
        console.log("ERROOORR::", e.stack)
        return {error: true, message: "Error! Unable to fetch data balance"}
    }
}

exports.simserver_balance = (response) => {
    const balance = response['data']['after_balance']
    return {account_1: balance}
}


exports.format_transaction_response = ({
    type, debitAccount, validNumber, providerId,
    planDetails, uuid, getCurrentTime
}) => {
    const responseObject = {}
    responseObject.new_balance = type === "mega" ? 
        debitAccount.balance.mega_wallet
            :
        {
            cash_balance: debitAccount.balance.wallet_balance,
            unit: debitAccount.balance.data_unit
        };
    responseObject.phone_number = validNumber.number;
    responseObject.status = "success";
    responseObject.network_provider = providerId.network;
    responseObject.data_volume = debitAccount.debited;
    responseObject.plan_id = planDetails.id;
    // responseObject.price = planDetails.price;
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

exports.checkMaintenance = async (planDetails) => {
    const { network, plan_type } = planDetails;
    const maintenance = await Maintenance.findOne();
    const { mtn_sme, mtn_gifting, airtel } = maintenance;
    if(network === 'airtel'){
        if(airtel == true){
            return {error: true, status: 400, message: "Airtel is currently NOT available. We'll let you know when it is back up."}
        }
        return {error: false, status: 200, message: "Airtel is available for use"}
    }else if(network === 'mtn'){
        if(plan_type === 'sme' && mtn_sme == true){
            return {error: true, status: 400, message: "MTN SME is currently NOT available. We'll let you know when it is back up."}
        }
        if(plan_type === 'gifting' && mtn_gifting == true){
            return {error: true, status: 400, message: "MTN GIFTING is currently NOT available. We'll let you know when it is back up."}
        }
        return {error: false, status: 200, message: "MTN is available for use"}
    }else{
        return {error: false, status: 200, message: "Network is available for use"}
    }
}