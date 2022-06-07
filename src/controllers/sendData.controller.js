const uuid = require('uuid')
const {
    get_plan_details,
    get_network_provider,
    validate_phone_number,
    getCurrentTime
} = require('../utils').helpers

const {
    debit_account_balance,
    revert_debit_account_balance,
    get_request_payload,
    initiate_data_transfer,
    save_transaction,
    format_transaction_response,
    update_transaction_status,
} = require('../utils')

const sendData = async (req, res, next) => {
    const {_id, type} = req.user;

    // Ensure user Type is provided
    if (!type) return res.status(400).json({status: 400, message: "Unrecognised User. Try Loging in again"});

    // validate request body
    const {network, plan_id, phone_number, allocate_for_business, business_id} = req.body;
    
    // check that network is valid
    const providerId = get_network_provider(network);
    if (providerId.error) return res.status(providerId.status).json(providerId);
    
    // validate and get data plan details
    const planDetails = await get_plan_details(plan_id);
    if (planDetails.error) return res.status(planDetails.status).json(planDetails);

    // check that phone number is valid
    const validNumber = validate_phone_number(phone_number, providerId.network);
    if (validNumber.error) return res.status(validNumber.status).json(validNumber);

    // prepare superjara request link
    const r_provider = providerId.id;
    const r_number = validNumber.number;
    const r_planId = planDetails.id;
    const r_ported = validNumber.ported;

    const requestPayload = get_request_payload(r_provider, r_number, r_planId, r_ported);

    // Transaction block
    try{
        // check account balance and debit
        const debitAccount = await debit_account_balance(_id, planDetails, type)
        if (debitAccount.error){
            res.status(debitAccount.status).json({status: debitAccount.status, message: debitAccount.message})
            throw new Error(debitAccount.message)
        }

        // **********************
        const responseObject = format_transaction_response({
            type, debitAccount, validNumber, providerId,
            planDetails, uuid, getCurrentTime
        })
        
        // save the transaction to database
        const savedTransaction = await save_transaction(_id, responseObject)
        if (savedTransaction.error){
            res.status(400).json({status: 400, message: "Server Error! Please try again later"});
            throw new Error("Server Error! Please try again later")
        }

        // transfer data to phone number
        const send_response = await initiate_data_transfer(
            requestPayload,
            {size: planDetails.size, ref: responseObject.transaction_ref}
        )
        if (send_response.error){
            responseObject.status = "failed";
            delete responseObject.new_balance;
            await update_transaction_status(responseObject.transaction_ref, "failed")

            res.status(400).json({...responseObject, message: send_response.message})
            throw new Error(send_response.message)
        }

        // If endpoint is called by Admin
        if(allocate_for_business && allocate_for_business == true && business_id){
            responseObject.admin_ref = responseObject.transaction_ref
            responseObject.transaction_ref = uuid.v4()
            await save_transaction(business_id, responseObject)
        }
        return res.status(201).json({...responseObject, message: "Transaction Successful!"})

    }catch(error){
        console.log("In catch: " + error.message)
        await revert_debit_account_balance(_id, planDetails, type)
    }
}


module.exports = sendData