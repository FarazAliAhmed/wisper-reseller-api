exports.numbers = {
   "mtn": [ "0803", "0806", "0810", "0813", "0814", "0816", "0703", "0704", "0706", "0903", "0906", "0913", "0916",],
   "glo": ["0805", "0807", "0811", "0815", "0705", "0905", "0915"],
   "airtel": [ "0802", "0808", "0812", "0701", "0708", "0901", "0902", "0904", "0907", "0912",],
}

exports.units = { //what to multiply by, to convert to MB
    "gb": 1024,
    "mb": 1,
    "tb": 1048576
}

exports.network_ids = {
    1: "mtn",
   //  2: "glo",
   //  3: "9mobile",
    4: "airtel"
}


exports.plans = {
      // "6": {
      //    "network": "mtn",
      //    "plan_type": "sme",
      //    "amount": "₦120",
      //    "size": "500.0 mb",
      //    "validity": "30 days"
      // },
      "7": {
         "network": "mtn",
         "plan_type": "sme",
         // "amount": "₦240",
         "price": 265,
         "size": "1.0 gb",
         "validity": "30 days"
      },
      "8": {
         "network": "mtn",
         "plan_type": "sme",
         // "amount": "₦480",
         "price": 530,
         "size": "2.0 gb",
         "validity": "30 days"
      },
      "11": {
         "network": "mtn",
         "plan_type": "sme",
         // "amount": "₦1200",
         "price": 1320,
         "size": "5.0 gb",
         "validity": "30 days"
      },
      "43": {
         "network": "mtn",
         "plan_type": "gifting",
         // "amount": "₦2200",
         "price": 2500,
         "size": "10.0 gb",
         "validity": "monthly"
      },
      "44": {
         "network": "mtn",
         "plan_type": "sme",
         // "amount": "₦720",
         "price": 790,
         "size": "3.0 gb",
         "validity": "30 days"
      },
      // "50": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦4400",
      //    "size": "20.0 gb",
      //    "validity": "monthly"
      // },
      // "51": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦8800",
      //    "size": "40.0 gb",
      //    "validity": "monthly"
      // },
      // "52": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦3300",
      //    "size": "15.0 gb",
      //    "validity": "monthly"
      // },
      // "182": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦450",
      //    "size": "500.0 mb",
      //    "validity": "30 days{gifting}"
      // },
      // "183": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦900",
      //    "size": "1.5 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "184": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦1080",
      //    "size": "2.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "185": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦1350",
      //    "size": "3.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "186": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦1800",
      //    "size": "4.5 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "187": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦3600",
      //    "size": "11.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "188": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦4500",
      //    "size": "15.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "189": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦9000",
      //    "size": "40.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "190": {
      //    "network": "9mobile",
      //    "plan_type": "gifting",
      //    "amount": "₦13500",
      //    "size": "75.0 gb",
      //    "validity": "30 days{gifting}"
      // },
      // "194": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦450",
      //    "size": "1.05 gb",
      //    "validity": "30days"
      // },
      // "195": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦900",
      //    "size": "2.9 gb",
      //    "validity": "30days"
      // },
      // "196": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦1350",
      //    "size": "4.1 gb",
      //    "validity": "30days"
      // },
      // "197": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦1800",
      //    "size": "5.8 gb",
      //    "validity": "30days"
      // },
      // "198": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦2250",
      //    "size": "7.7 gb",
      //    "validity": "30days"
      // },
      // "199": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦2700",
      //    "size": "10.0 gb",
      //    "validity": "30 days"
      // },
      // "200": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦3600",
      //    "size": "13.25 gb",
      //    "validity": "30days"
      // },
      // "201": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦4500",
      //    "size": "18.25 gb",
      //    "validity": "30days"
      // },
      // "202": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦7200",
      //    "size": "29.5 gb",
      //    "validity": "30days"
      // },
      // "203": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦9000",
      //    "size": "50.0 gb",
      //    "validity": "30 days"
      // },
      // "204": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦13050",
      //    "size": "93.0 gb",
      //    "validity": "30days"
      // },
      // "205": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦16200",
      //    "size": "119.0 gb",
      //    "validity": "30days"
      // },
      // "206": {
      //    "network": "glo",
      //    "plan_type": "gifting",
      //    "amount": "₦18000",
      //    "size": "138.0 gb",
      //    "validity": "30 days"
      // },
      "209": {
         "network": "mtn",
         "plan_type": "gifting",
         // "amount": "₦440",
         "price": 510,
         "size": "2.0 gb",
         "validity": "monthly"
      },
      "210": {
         "network": "mtn",
         "plan_type": "gifting",
         // "amount": "₦660",
         "price": 765,
         "size": "3.0 gb",
         "validity": "monthly"
      },
      "211": {
         "network": "mtn",
         "plan_type": "gifting",
         // "amount": "₦1100",
         "price": 1275,
         "size": "5.0 gb",
         "validity": "monthly"
      },
      // "216": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦110",
      //    "size": "500.0 mb",
      //    "validity": "monthly"
      // },
      "217": {
         "network": "mtn",
         "plan_type": "gifting",
         // "amount": "₦220",
         "price": 255,
         "size": "1.0 gb",
         "validity": "monthly"
      },
      // "218": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦16500",
      //    "size": "75.0 gb",
      //    "validity": "monthly"
      // },
      // "219": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦22000",
      //    "size": "100.0 gb",
      //    "validity": "monthly"
      // },
      "220": {
         "network": "mtn",
         "plan_type": "sme",
         // "amount": "₦2400",
         "price": 2600,
         "size": "10.0 gb",
         "validity": "30 days"
      },
      "221": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦220",
         "price": 200,
         "size": "500.0 mb",
         "validity": "monthly"
      },
      "222": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦430",
         "price": 380,
         "size": "1.0 gb",
         "validity": "monthly"
      },
      "223": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦860",
         "price": 760,
         "size": "2.0 gb",
         "validity": "monthly"
      },
      "224": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦2150",
         "price": 1850,
         "size": "5.0 gb",
         "validity": "monthly"
      },
      "225": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦50",
         "price": 50,
         "size": "100.0 mb",
         "validity": "7 days"
      },
      "226": {
         "network": "airtel",
         "plan_type": "corporate gifting",
         // "amount": "₦150",
         "price": 100,
         "size": "300.0 mb",
         "validity": "7 days"
      },
      // "227": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦65",
      //    "size": "250.0 mb",
      //    "validity": "monthly"
      // },
      // "228": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦45",
      //    "size": "150.0 mb",
      //    "validity": "monthly"
      // },
      // "229": {
      //    "network": "mtn",
      //    "plan_type": "gifting",
      //    "amount": "₦25",
      //    "size": "50.0 mb",
      //    "validity": "monthly"
      // }
}

exports.plans_old = {
   //  "43": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦2200",
   //     "size": "10.0 gb",
   //     "validity": "monthly"
   //  },
   //  "49": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦110",
   //     "size": "500.0 mb",
   //     "validity": "30 days"
   //  },
   //  "50": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦4400",
   //     "size": "20.0 gb",
   //     "validity": "30 days"
   //  },
   //  "51": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦8800",
   //     "size": "40.0 gb",
   //     "validity": "30 days"
   //  },
   //  "52": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦3300",
   //     "size": "15.0 gb",
   //     "validity": "monthly"
   //  },
   //  "182": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦450",
   //     "size": "500.0 mb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "183": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦900",
   //     "size": "1.5 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "184": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦1080",
   //     "size": "2.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "185": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦1350",
   //     "size": "3.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "186": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦1800",
   //     "size": "4.5 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "187": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦3600",
   //     "size": "11.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "188": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦4500",
   //     "size": "15.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "189": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦9000",
   //     "size": "40.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "190": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦13500",
   //     "size": "75.0 gb",
   //     "validity": "30 days{gifting}"
   //  },
   //  "194": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦450",
   //     "size": "1.05 gb",
   //     "validity": "30days (800mb & 200.35mb night"
   //  },
   //  "195": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦900",
   //     "size": "2.9 gb",
   //     "validity": "30days"
   //  },
   //  "196": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦1350",
   //     "size": "4.1 gb",
   //     "validity": "30days"
   //  },
   //  "197": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦1800",
   //     "size": "5.2 gb",
   //     "validity": "30days"
   //  },
   //  "198": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦2250",
   //     "size": "7.7 gb",
   //     "validity": "30days"
   //  },
   //  "199": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦2700",
   //     "size": "10.0 gb",
   //     "validity": "30 days"
   //  },
   //  "200": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦3600",
   //     "size": "13.25 gb",
   //     "validity": "30days"
   //  },
   //  "201": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦4500",
   //     "size": "18.25 gb",
   //     "validity": "30days"
   //  },
   //  "202": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦7200",
   //     "size": "29.5 gb",
   //     "validity": "30days"
   //  },
   //  "203": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦9000",
   //     "size": "50.0 gb",
   //     "validity": "30 days"
   //  },
   //  "204": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦13050",
   //     "size": "93.0 gb",
   //     "validity": "30days"
   //  },
   //  "205": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦16200",
   //     "size": "119.0 gb",
   //     "validity": "30days"
   //  },
   //  "206": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦18000",
   //     "size": "138.0 gb",
   //     "validity": "30 days"
   //  },
   //  "208": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦220",
   //     "size": "1.0 gb",
   //     "validity": "monthly"
   //  },
   //  "209": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦440",
   //     "size": "2.0 gb",
   //     "validity": "monthly"
   //  },
   //  "210": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦660",
   //     "size": "3.0 gb",
   //     "validity": "monthly"
   //  },
   //  "211": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦1100",
   //     "size": "5.0 gb",
   //     "validity": "monthly"
   //  },
   //  "212": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦25",
   //     "size": "50.0 mb",
   //     "validity": "monthly"
   //  },
   //  "213": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦35",
   //     "size": "150.0 mb",
   //     "validity": "monthly"
   //  },
   //  "214": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦60",
   //     "size": "250.0 mb",
   //     "validity": "monthly"
   //  },
   //  "215": {
   //     "network": "9mobile",
   //     "plan_type": "gifting",
   //     "amount": "₦1450",
   //     "size": "7.0 gb",
   //     "validity": "10days"
   //  },
   //  "219": {
   //     "network": "glo",
   //     "plan_type": "gifting",
   //     "amount": "₦220",
   //     "size": "350.0 mb",
   //     "validity": "3days"
   //  },
   //  "224": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦16500",
   //     "size": "75.0 gb",
   //     "validity": "monthly"
   //  },
   //  "225": {
   //     "network": "mtn",
   //     "plan_type": "gifting",
   //     "amount": "₦22000",
   //     "size": "100.0 gb",
   //     "validity": "monthly"
   //  },
   //  "234": {
   //     "network": "mtn",
   //     "plan_type": "sme",
   //     "amount": "₦240",
   //     "size": "1.0 gb",
   //     "validity": "30 days"
   //  },
   //  "235": {
   //     "network": "mtn",
   //     "plan_type": "sme",
   //     "amount": "₦480",
   //     "size": "2.0 gb",
   //     "validity": "30 days"
   //  },
   //  "237": {
   //     "network": "mtn",
   //     "plan_type": "sme",
   //     "amount": "₦1198",
   //     "size": "5.0 gb",
   //     "validity": "30 days"
   //  },
   //  "242": {
   //     "network": "mtn",
   //     "plan_type": "sme",
   //     "amount": "₦120",
   //     "size": "500.0 mb",
   //     "validity": "monthly"
   //  },
   //  "246": {
   //     "network": "mtn",
   //     "plan_type": "sme",
   //     "amount": "₦2400",
   //     "size": "10.0 gb",
   //     "validity": "monthly"
   //  },
    "253": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦220",
       "size": "500.0 mb",
       "validity": "monthly"
    },
    "254": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦430",
       "size": "1.0 gb",
       "validity": "monthly"
    },
    "255": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦860",
       "size": "2.0 gb",
       "validity": "monthly"
    },
    "256": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦2150",
       "size": "5.0 gb",
       "validity": "monthly"
    },
    "257": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦50",
       "size": "100.0 mb",
       "validity": "7 days"
    },
    "258": {
       "network": "airtel",
       "plan_type": "gifting",
       "amount": "₦150",
       "size": "300.0 mb",
       "validity": "7 days"
    }
 }