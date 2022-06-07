const uuid = require('uuid')
const { save_transaction } = require('../helpers')

const httpCode = {
    success: 200,
    failed: 400,
}

const transactionOnAllocate = async (req, res, next) => {
    const { transactionResponse } = req
    const {allocate_for_business, business_id} = req.body
    const {_id} = req.user
    
    if(allocate_for_business && allocate_for_business == true && business_id){
        if(transactionResponse.status === "success"){
            transactionResponse.admin_ref = transactionResponse.transaction_ref
            transactionResponse.transaction_ref = uuid.v4()
            const newTrans = await save_transaction(business_id, transactionResponse)
            if(newTrans.error) console.log(newTrans)
        }
    }
    return res.status(
        httpCode[transactionResponse.status] || 200
    ).json(transactionResponse)
}

module.exports = transactionOnAllocate