// InnitiateDataTransfer helper function:::
// const url = "https://superjarang.com/api/data"
// const url = "https://www.superjaraapi.com/api/data/"
// requestPayload.network == 4 ? airtel_authorization :


// sendData Controller:::
// const sendData = async (req, res) => {
//     const {_id, type} = req.user

//     // Ensure user Type is provided
//     if (!type) return res.status(400).json({status: 400, message: "Unrecognised User. Try Loging in again"})

//     // validate request body
//     const {network, plan_id, phone_number} = req.body
    
//     // check that network is valid
//     const providerId = await get_network_provider(network)
//     if (providerId.error) return res.status(providerId.status).json(providerId)
    
//     // validate and get data plan details
//     const planDetails = await get_plan_details(plan_id)
//     if (planDetails.error) return res.status(planDetails.status).json(planDetails)

//     // check that phone number is valid
//     const validNumber = await validate_phone_number(phone_number, providerId.network)
//     if (validNumber.error) return res.status(validNumber.status).json(validNumber)

//     // prepare superjara request link
//     const r_provider = providerId.id
//     const r_number = validNumber.number
//     const r_planId = planDetails.id
//     const r_ported = validNumber.ported

//     const requestPayload = await get_request_payload(r_provider, r_number, r_planId, r_ported)

//     // check account balance and debit
//     const debitAccount = await debit_account_balance(_id, planDetails, type)
//     if (debitAccount.error){
//         res.status(debitAccount.status).json({status: debitAccount.status, message: debitAccount.message})
//         return revert_debit_account_balance(_id, planDetails, type)
//     }

//     // **********************
//     responseObject.new_balance = type === "mega" ? 
//         debitAccount.balance.mega_wallet
//             :
//         `${debitAccount.balance.data_unit} ${debitAccount.balance.wallet_balance}`
//     responseObject.phone_number = validNumber.number
//     responseObject.status = "processing"
//     responseObject.network_provider = providerId.network
//     responseObject.data_volume = planDetails.volume
//     responseObject.plan_id = planDetails.id
//     responseObject.transaction_ref = uuid.v4();
    
    
//     // transfer data to phone number
//     const send_response = await initiate_data_transfer(requestPayload)
//     if (send_response.error){
//         revert_debit_account_balance(_id, planDetails, type)
//         responseObject.status = "failed"
//         delete responseObject.new_balance
//         // update_transaction_status(responseObject.transaction_ref, "failed")
//     }else{
//         // update_transaction_status(responseObject.transaction_ref, "success")
//         responseObject.status = "success"
//     }
    
//     // return response on data transfer
//     const transactionResponse = await format_transaction_response(responseObject)
//     res.status(200).json(transactionResponse)
    
//     // save the transaction to database
//     const savedTransaction = await save_transaction(_id, responseObject)
//     if (savedTransaction.error) console.log(savedTransaction)
// }



// transactionOnAllocate middleware function::
// {
//     transaction_ref: uuid.v4(),
//     phone_number,
//     data_volume: ,
//     data_price: ,
//     business_id,
//     network_provider: ,
//     status: "processing",
//     created_at: getCurrentTime(),
// }


// saveTransaction helper function:::
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



// Network data plans objects:::
// Use this for Superjaraapi: New

// exports.plans_new = {
//     // "6": {
//     //    "network": "mtn",
//     //    "plan_type": "sme",
//     //    "amount": "₦120",
//     //    "size": "500.0 mb",
//     //    "validity": "30 days"
//     // },
//     "7": {
//        "network": "mtn",
//        "plan_type": "sme",
//        // "amount": "₦240",
//        "price": 245,
//        "size": "1.0 gb",
//        "validity": "30 days"
//     },
//     "8": {
//        "network": "mtn",
//        "plan_type": "sme",
//        // "amount": "₦480",
//        "price": 490,
//        "size": "2.0 gb",
//        "validity": "30 days"
//     },
//     "11": {
//        "network": "mtn",
//        "plan_type": "sme",
//        // "amount": "₦1200",
//        "price": 1250,
//        "size": "5.0 gb",
//        "validity": "30 days"
//     },
//     "43": {
//        "network": "mtn",
//        "plan_type": "gifting",
//        // "amount": "₦2200",
//        "price": 2500,
//        "size": "10.0 gb",
//        "validity": "monthly"
//     },
//     // "44": {
//     //    "network": "mtn",
//     //    "plan_type": "sme",
//     //    // "amount": "₦720",
//     //    "price": 725,
//     //    "size": "3.0 gb",
//     //    "validity": "30 days"
//     // },
//     // "50": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦4400",
//     //    "size": "20.0 gb",
//     //    "validity": "monthly"
//     // },
//     // "51": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦8800",
//     //    "size": "40.0 gb",
//     //    "validity": "monthly"
//     // },
//     // "52": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦3300",
//     //    "size": "15.0 gb",
//     //    "validity": "monthly"
//     // },
//     // "182": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦450",
//     //    "size": "500.0 mb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "183": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦900",
//     //    "size": "1.5 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "184": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦1080",
//     //    "size": "2.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "185": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦1350",
//     //    "size": "3.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "186": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦1800",
//     //    "size": "4.5 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "187": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦3600",
//     //    "size": "11.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "188": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦4500",
//     //    "size": "15.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "189": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦9000",
//     //    "size": "40.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "190": {
//     //    "network": "9mobile",
//     //    "plan_type": "gifting",
//     //    "amount": "₦13500",
//     //    "size": "75.0 gb",
//     //    "validity": "30 days{gifting}"
//     // },
//     // "194": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦450",
//     //    "size": "1.05 gb",
//     //    "validity": "30days"
//     // },
//     // "195": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦900",
//     //    "size": "2.9 gb",
//     //    "validity": "30days"
//     // },
//     // "196": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦1350",
//     //    "size": "4.1 gb",
//     //    "validity": "30days"
//     // },
//     // "197": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦1800",
//     //    "size": "5.8 gb",
//     //    "validity": "30days"
//     // },
//     // "198": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦2250",
//     //    "size": "7.7 gb",
//     //    "validity": "30days"
//     // },
//     // "199": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦2700",
//     //    "size": "10.0 gb",
//     //    "validity": "30 days"
//     // },
//     // "200": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦3600",
//     //    "size": "13.25 gb",
//     //    "validity": "30days"
//     // },
//     // "201": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦4500",
//     //    "size": "18.25 gb",
//     //    "validity": "30days"
//     // },
//     // "202": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦7200",
//     //    "size": "29.5 gb",
//     //    "validity": "30days"
//     // },
//     // "203": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦9000",
//     //    "size": "50.0 gb",
//     //    "validity": "30 days"
//     // },
//     // "204": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦13050",
//     //    "size": "93.0 gb",
//     //    "validity": "30days"
//     // },
//     // "205": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦16200",
//     //    "size": "119.0 gb",
//     //    "validity": "30days"
//     // },
//     // "206": {
//     //    "network": "glo",
//     //    "plan_type": "gifting",
//     //    "amount": "₦18000",
//     //    "size": "138.0 gb",
//     //    "validity": "30 days"
//     // },
//     "209": {
//        "network": "mtn",
//        "plan_type": "gifting",
//        // "amount": "₦440",
//        "price": 510,
//        "size": "2.0 gb",
//        "validity": "monthly"
//     },
//     "210": {
//        "network": "mtn",
//        "plan_type": "gifting",
//        // "amount": "₦660",
//        "price": 765,
//        "size": "3.0 gb",
//        "validity": "monthly"
//     },
//     "211": {
//        "network": "mtn",
//        "plan_type": "gifting",
//        // "amount": "₦1100",
//        "price": 1275,
//        "size": "5.0 gb",
//        "validity": "monthly"
//     },
//     // "216": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦110",
//     //    "size": "500.0 mb",
//     //    "validity": "monthly"
//     // },
//     "217": {
//        "network": "mtn",
//        "plan_type": "gifting",
//        // "amount": "₦220",
//        "price": 255,
//        "size": "1.0 gb",
//        "validity": "monthly"
//     },
//     // "218": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦16500",
//     //    "size": "75.0 gb",
//     //    "validity": "monthly"
//     // },
//     // "219": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦22000",
//     //    "size": "100.0 gb",
//     //    "validity": "monthly"
//     // },
//     "220": {
//        "network": "mtn",
//        "plan_type": "sme",
//        // "amount": "₦2400",
//        "price": 2450,
//        "size": "10.0 gb",
//        "validity": "30 days"
//     },
//     "221": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦220",
//        "price": 200,
//        "size": "500.0 mb",
//        "validity": "monthly"
//     },
//     "222": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦430",
//        "price": 380,
//        "size": "1.0 gb",
//        "validity": "monthly"
//     },
//     "223": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦860",
//        "price": 760,
//        "size": "2.0 gb",
//        "validity": "monthly"
//     },
//     "224": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦2150",
//        "price": 1850,
//        "size": "5.0 gb",
//        "validity": "monthly"
//     },
//     "225": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦50",
//        "price": 50,
//        "size": "100.0 mb",
//        "validity": "7 days"
//     },
//     "226": {
//        "network": "airtel",
//        "plan_type": "corporate gifting",
//        // "amount": "₦150",
//        "price": 100,
//        "size": "300.0 mb",
//        "validity": "7 days"
//     },
//     // "227": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦65",
//     //    "size": "250.0 mb",
//     //    "validity": "monthly"
//     // },
//     // "228": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦45",
//     //    "size": "150.0 mb",
//     //    "validity": "monthly"
//     // },
//     // "229": {
//     //    "network": "mtn",
//     //    "plan_type": "gifting",
//     //    "amount": "₦25",
//     //    "size": "50.0 mb",
//     //    "validity": "monthly"
//     // }
// }

// Use this for Superjara: Original
// exports.plans_old = {
//   "43": {
//      "network": "mtn",
//      "plan_type": "gifting",
//     //  "amount": "₦2200",
//     "price": 2500,
//      "size": "10.0 gb",
//      "validity": "monthly"
//   },
//  //  "49": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦110",
//  //     "size": "500.0 mb",
//  //     "validity": "30 days"
//  //  },
//  //  "50": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦4400",
//  //     "size": "20.0 gb",
//  //     "validity": "30 days"
//  //  },
//  //  "51": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦8800",
//  //     "size": "40.0 gb",
//  //     "validity": "30 days"
//  //  },
//  //  "52": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦3300",
//  //     "size": "15.0 gb",
//  //     "validity": "monthly"
//  //  },
//   "208": {
//      "network": "mtn",
//      "plan_type": "gifting",
//     //  "amount": "₦220",
//     "price": 255,
//      "size": "1.0 gb",
//      "validity": "monthly"
//   },
//   "209": {
//      "network": "mtn",
//      "plan_type": "gifting",
//     //  "amount": "₦440",
//     "price": 510,
//      "size": "2.0 gb",
//      "validity": "monthly"
//   },
//   "210": {
//      "network": "mtn",
//      "plan_type": "gifting",
//     //  "amount": "₦660",
//     "price": 765,
//      "size": "3.0 gb",
//      "validity": "monthly"
//   },
//   "211": {
//      "network": "mtn",
//      "plan_type": "gifting",
//     //  "amount": "₦1100",
//     "price": 1275,
//      "size": "5.0 gb",
//      "validity": "monthly"
//   },
//  //  "212": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦25",
//  //     "size": "50.0 mb",
//  //     "validity": "monthly"
//  //  },
//  //  "213": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦35",
//  //     "size": "150.0 mb",
//  //     "validity": "monthly"
//  //  },
//  //  "214": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦60",
//  //     "size": "250.0 mb",
//  //     "validity": "monthly"
//  //  },
//  //  "224": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦16500",
//  //     "size": "75.0 gb",
//  //     "validity": "monthly"
//  //  },
//  //  "225": {
//  //     "network": "mtn",
//  //     "plan_type": "gifting",
//  //     "amount": "₦22000",
//  //     "size": "100.0 gb",
//  //     "validity": "monthly"
//  //  },
//  //  "182": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦450",
//  //     "size": "500.0 mb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "183": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦900",
//  //     "size": "1.5 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "184": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1080",
//  //     "size": "2.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "185": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1350",
//  //     "size": "3.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "186": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1800",
//  //     "size": "4.5 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "187": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦3600",
//  //     "size": "11.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "188": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦4500",
//  //     "size": "15.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "189": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦9000",
//  //     "size": "40.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "190": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦13500",
//  //     "size": "75.0 gb",
//  //     "validity": "30 days{gifting}"
//  //  },
//  //  "215": {
//  //     "network": "9mobile",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1450",
//  //     "size": "7.0 gb",
//  //     "validity": "10days"
//  //  },
//  //  "194": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦450",
//  //     "size": "1.05 gb",
//  //     "validity": "30days (800mb & 200.35mb night"
//  //  },
//  //  "195": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦900",
//  //     "size": "2.9 gb",
//  //     "validity": "30days"
//  //  },
//  //  "196": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1350",
//  //     "size": "4.1 gb",
//  //     "validity": "30days"
//  //  },
//  //  "197": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦1800",
//  //     "size": "5.2 gb",
//  //     "validity": "30days"
//  //  },
//  //  "198": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦2250",
//  //     "size": "7.7 gb",
//  //     "validity": "30days"
//  //  },
//  //  "199": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦2700",
//  //     "size": "10.0 gb",
//  //     "validity": "30 days"
//  //  },
//  //  "200": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦3600",
//  //     "size": "13.25 gb",
//  //     "validity": "30days"
//  //  },
//  //  "201": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦4500",
//  //     "size": "18.25 gb",
//  //     "validity": "30days"
//  //  },
//  //  "202": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦7200",
//  //     "size": "29.5 gb",
//  //     "validity": "30days"
//  //  },
//  //  "203": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦9000",
//  //     "size": "50.0 gb",
//  //     "validity": "30 days"
//  //  },
//  //  "204": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦13050",
//  //     "size": "93.0 gb",
//  //     "validity": "30days"
//  //  },
//  //  "205": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦16200",
//  //     "size": "119.0 gb",
//  //     "validity": "30days"
//  //  },
//  //  "206": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦18000",
//  //     "size": "138.0 gb",
//  //     "validity": "30 days"
//  //  },
//  //  "219": {
//  //     "network": "glo",
//  //     "plan_type": "gifting",
//  //     "amount": "₦220",
//  //     "size": "350.0 mb",
//  //     "validity": "3days"
//  //  },
//   "234": {
//      "network": "mtn",
//      "plan_type": "sme",
//     //  "amount": "₦240",
//     "price": 245,
//     "size": "1.0 gb",
//     "validity": "30 days"
//   },
//   "235": {
//      "network": "mtn",
//      "plan_type": "sme",
//     //  "amount": "₦480",
//     "price": 490,
//      "size": "2.0 gb",
//      "validity": "30 days"
//   },
//   "237": {
//      "network": "mtn",
//      "plan_type": "sme",
//     //  "amount": "₦1198",
//     "price": 1250,
//      "size": "5.0 gb",
//      "validity": "30 days"
//   },
//  //  "242": {
//  //     "network": "mtn",
//  //     "plan_type": "sme",
//  //     "amount": "₦120",
//  //     "size": "500.0 mb",
//  //     "validity": "monthly"
//  //  },
//   "246": {
//      "network": "mtn",
//      "plan_type": "sme",
//     //  "amount": "₦2400",
//     "price": 2450,
//      "size": "10.0 gb",
//      "validity": "monthly"
//   },
//   "253": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦220",
//     "price": 200,
//      "size": "500.0 mb",
//      "validity": "monthly"
//   },
//   "254": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦430",
//     "price": 380,
//      "size": "1.0 gb",
//      "validity": "monthly"
//   },
//   "255": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦860",
//     "price": 760,
//      "size": "2.0 gb",
//      "validity": "monthly"
//   },
//   "256": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦2150",
//     "price": 1850,
//      "size": "5.0 gb",
//      "validity": "monthly"
//   },
//   "257": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦50",
//     "price": 50,
//      "size": "100.0 mb",
//      "validity": "7 days"
//   },
//   "258": {
//      "network": "airtel",
//      "plan_type": "gifting",
//     //  "amount": "₦150",
//     "price": 100,
//      "size": "300.0 mb",
//      "validity": "7 days"
//   }
// }