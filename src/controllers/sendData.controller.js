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
    format_transaction_response
} = require('../utils')

const responseObject = {
    previous_balance: "",
    new_balance: "",
    pnone_number: "",
    status: "success",
    network_provider: "",
    data_volume: "",
    plan_id: "",
}

const sendData = async (req, res) => {
    const {_id, email} = req.user

    // validate request body
    const {network, plan_id, phone_number} = req.body
    
    // validate and get data plan details
    const planDetails = await get_plan_details(plan_id)
    if (planDetails.error) return res.status(planDetails.status).json(planDetails)

    // check that network is valid
    const providerId = get_network_provider(network)
    if (providerId.error) return res.status(providerId.status).json(providerId)

    // check that phone number is valid
    const validNumber = await validate_phone_number(phone_number)
    if (validNumber.error) return res.status(validNumber.status).json(validNumber)

    // prepare superjara request link
    const r_provider = providerId.id
    const r_number = validNumber.number
    const r_planId = planDetails.id
    const r_ported = validNumber.ported
    const requestPayload = get_request_payload(r_provider, r_number, r_planId, r_ported)

    // check account balance and debit
    const debitAccount = await debit_account_balance(_id, planDetails)
    if (debitAccount.error){
        res.status(debitAccount.status).json({status: debitAccount.status, message: debitAccount.message})
        return revert_debit_account_balance(_id, planDetails)
    }
    
    // transfer data to phone number
    const send_response = await initiate_data_transfer(requestPayload)
    if (send_response.error){
        res.status(send_response.status).json(send_response)
        return revert_debit_account_balance(_id, planDetails)
    }


    // *****
    responseObject.new_balance = debitAccount.balance
    responseObject.previous_balance = debitAccount.balance + planDetails.volume
    responseObject.pnone_number = validNumber.number
    responseObject.status = "success"
    responseObject.network_provider = providerId.network
    responseObject.data_volume = planDetails.volume
    responseObject.plan_id = planDetails.id
    

    // return response on data transfer
    const transactionResponse = format_transaction_response(responseObject)
    res.status(200).json(transactionResponse)

    // save the transaction to database
    savedTransaction = save_transaction(_id, responseObject)
    if (savedTransaction.error) console.log(savedTransaction)
    return
}


const validate = () => {

}

module.exports = sendData