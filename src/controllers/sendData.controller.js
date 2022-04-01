const uuid = require('uuid')
const {
    get_plan_details,
    get_network_provider,
    validate_phone_number
} = require('../utils').helpers

const {
    debit_account_balance,
    revert_debit_account_balance,
    get_request_payload,
    initiate_data_transfer,
    save_transaction,
    update_transaction_status,
    format_transaction_response,
} = require('../utils')

const responseObject = {}

const sendData = async (req, res) => {
    const {_id, type} = req.user

    // Ensure user Type is provided
    if (!type) return res.status(400).json({status: 400, message: "Unrecognised User. Try Loging in again"})

    // validate request body
    const {network, plan_id, phone_number} = req.body
    
    // check that network is valid
    const providerId = await get_network_provider(network)
    if (providerId.error) return res.status(providerId.status).json(providerId)
    
    // validate and get data plan details
    const planDetails = await get_plan_details(plan_id)
    if (planDetails.error) return res.status(planDetails.status).json(planDetails)

    // check that phone number is valid
    const validNumber = await validate_phone_number(phone_number, providerId.network)
    if (validNumber.error) return res.status(validNumber.status).json(validNumber)

    // prepare superjara request link
    const r_provider = providerId.id
    const r_number = validNumber.number
    const r_planId = planDetails.id
    const r_ported = validNumber.ported

    const requestPayload = await get_request_payload(r_provider, r_number, r_planId, r_ported)

    // check account balance and debit
    const debitAccount = await debit_account_balance(_id, planDetails, type)
    if (debitAccount.error){
        res.status(debitAccount.status).json({status: debitAccount.status, message: debitAccount.message})
        return revert_debit_account_balance(_id, planDetails, type)
    }

    // **********************
    responseObject.new_balance = type === "mega" ? 
        debitAccount.balance.mega_wallet
            :
        `${debitAccount.balance.data_unit} ${debitAccount.balance.wallet_balance}`
    responseObject.phone_number = validNumber.number
    responseObject.status = "processing"
    responseObject.network_provider = providerId.network
    responseObject.data_volume = planDetails.volume
    responseObject.plan_id = planDetails.id
    responseObject.transaction_ref = uuid.v4();
    
    
    // transfer data to phone number
    const send_response = await initiate_data_transfer(requestPayload)
    if (send_response.error){
        revert_debit_account_balance(_id, planDetails, type)
        responseObject.status = "failed"
        delete responseObject.new_balance
        // update_transaction_status(responseObject.transaction_ref, "failed")
    }else{
        // update_transaction_status(responseObject.transaction_ref, "success")
        responseObject.status = "success"
    }
    
    // return response on data transfer
    const transactionResponse = await format_transaction_response(responseObject)
    res.status(200).json(transactionResponse)
    
    // save the transaction to database
    const savedTransaction = await save_transaction(_id, responseObject)
    if (savedTransaction.error) console.log(savedTransaction)
}


const validate = () => {

}

module.exports = sendData