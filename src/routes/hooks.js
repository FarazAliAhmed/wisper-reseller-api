const express = require('express')
const router = express.Router()
const { create: addPayment } = require('../services/payment.service')
const { credit: creditBalance } = require('../services/balance.service')
const { whoami } = require('../services/auth.service')
const { WEBHOOK_VERIFY_HASH } = process.env

// const sampleWebhookPayload = {
//     event: 'charge.completed',
//     data: {
//       id: 3233654,
//       tx_ref: 'trx-7462314883415868',
//       flw_ref: 'FLW-MOCK-841e33283d4f458e9afa8485974a422f',
//       device_fingerprint: 'ea62f7bdd3259efdc990f913c80ec1f3',
//       amount: 3000,
//       currency: 'NGN',
//       charged_amount: 3000,
//       app_fee: 42,
//       merchant_fee: 0,
//       processor_response: 'successful',
//       auth_model: 'PIN',
//       ip: '197.210.52.230',
//       narration: 'CARD Transaction ',
//       status: 'successful',
//       payment_type: 'card',
//       created_at: '2022-03-18T14:44:12.000Z',
//       account_id: 857738,
//       customer: {
//         id: 1565513,
//         name: 'Anonymous customer',
//         phone_number: null,
//         email: 'obohedward@gmail.com',
//         created_at: '2022-03-18T14:44:12.000Z'
//       },
//       card: {
//         first_6digits: '553188',
//         last_4digits: '2950',
//         issuer: 'MASTERCARD  CREDIT',
//         country: 'NG',
//         type: 'MASTERCARD',
//         expiry: '09/32'
//       }
//     },
//     'event.type': 'CARD_TRANSACTION'
//   }

router.post("/",
    (req, res, next) => {
        res.send(200)
        
        const hookPayload = req.body
        if(hookPayload.event !== 'charge.completed') return
        if(
            hookPayload.data
            &&
            hookPayload.data.status
            &&
            (
                hookPayload.data.status === 'successful'
                ||
                hookPayload.data.status === 'success'
            )
        ){
            if(req.headers['verif-hash'] && req.headers['verif-hash']===WEBHOOK_VERIFY_HASH){   //check if hash header is acurate
                req.hookData = req.body.data
                req.body = {}
                return next()
            }
        }

    },
    async (req, res, next) => { //Add user payment and credit account
        const { customer } = req.hookData
        const fields = {
            email: customer.email,
            amount: req.hookData.amount,
            payment_ref: req.hookData.tx_ref,
        }
        const fetchUser = await whoami(fields.email)
        if(fetchUser.user){

            fields.business_id = fetchUser.user._id
            fields.business_name = fetchUser.user.name
            
            req.body = fields
            const resp = await addPayment(fields)
            if (resp.payment) next()
        }
    },
    async (req, res) => {
        const businessId = req.body.business_id
        const creditAmount = parseInt(req.body.amount)

        let field = "wallet_balance"        
        const newBalance = await creditBalance(businessId, creditAmount, field)
        if (newBalance.error) console.log(newBalance)
    }
)

router.get("/", (req, res) => {
    res.status(200).json({status: "Hook Healthy"})
})

module.exports = router