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

const responseObject = {}

const sendData = async (req, res, next) => {
    const {_id, type} = req.user;

    // Ensure user Type is provided
    if (!type) return res.status(400).json({status: 400, message: "Unrecognised User. Try Loging in again"});

    // validate request body
    const {network, plan_id, phone_number} = req.body;
    
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

    // check account balance and debit
    debit_account_balance(_id, planDetails, type)
    .then(debitAccount => {
        if (debitAccount.error){
            res.status(debitAccount.status).json({status: debitAccount.status, message: debitAccount.message})
            revert_debit_account_balance(_id, planDetails, type)
            .then(() => {})
        }else{
            // **********************
            responseObject.new_balance = type === "mega" ? 
                debitAccount.balance.mega_wallet
                    :
                `${debitAccount.balance.data_unit} ${debitAccount.balance.wallet_balance}`;
            responseObject.phone_number = validNumber.number;
            responseObject.status = "processing";
            responseObject.network_provider = providerId.network;
            responseObject.data_volume = planDetails.volume;
            responseObject.plan_id = planDetails.id;
            responseObject.price = planDetails.price;
            responseObject.transaction_ref = uuid.v4();
            responseObject.created_at = getCurrentTime();
    
            // save the transaction to database
            save_transaction(_id, responseObject)
            .then(savedTransaction => {
                if (savedTransaction.error){
                    res.status(400).json({status: 400, message: "Server Error! Please try again later"});
                }
    
                // transfer data to phone number
                initiate_data_transfer(
                    requestPayload,
                    {
                        size: planDetails.size,
                        ref: responseObject.transaction_ref
                    }
                )
                .then(async (send_response) => {
                    if (send_response.error){
                        responseObject.status = "failed";
                        delete responseObject.new_balance;
                        revert_debit_account_balance(_id, planDetails, type).then(async () => {
                            await update_transaction_status(responseObject.transaction_ref, "failed");
                        })
                    }else{
                        responseObject.status = "success";
                        await update_transaction_status(responseObject.transaction_ref, "success");
                    }
                    
                    // return response on data transfer
                    const transactionResponse = format_transaction_response(responseObject);
                    // res.status(200).json(transactionResponse)           
                    req.transactionResponse = transactionResponse;
                    next();
                })
            })
        }
    })    
}


module.exports = sendData