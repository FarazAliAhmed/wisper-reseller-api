const axios = require("axios");
const joi = require("joi");
const _ = require("lodash");
const moment = require("moment-timezone");
var postmark = require("postmark");
const client = new postmark.ServerClient(process.env.POSTMARK);

const Maintenance = require("../models/maintenance");

const { integration_response } = require("../events/_eventTypes");
const IntegrationEvents = require("../events/integration.event");

const {
  create: addTransaction,
  update: updateTransaction,
} = require("../services/transaction.service");
const { debit } = require("../services/balance.service");
const {
  units,
  plans,
  network_ids,
  numbers: network_numbers,
  ported_numbers,
  simservers_size_map,
  ogdams_size_map,
  ogdams_9mobile_size_map,
  cloudsimhost_size_map,
  cloudsimhost_glo_size_map,
  superjara_size_map,
  eazymobile_glo_size_map,
  zoedata_size_map,
  msorg_size_map,
  n3tdata_mtn_size_map,
  n3tdata_airtel_size_map,
  n3tdata_9mobile_size_map,
  gladtidings_9mobile_size_map,
  zoedata_glo_size_map,
  ayinlak_mtn_size_map,
  ayinlak_airtel_size_map,
} = require("./networkData");
const { default: fetch } = require("node-fetch");
const { Account } = require("../models/account");
const { buyGloData, gatewayResponse } = require("./gloHelper");
const monnifyHistory = require("../models/monnifyHistory");
const dataBalance = require("../models/dataBalance");
const apiBalanceModel = require("../models/apiBalance.model");
const {
  n3tdataApiUpdateBalance,
  almamgtApiUpdateBalance,
} = require("./middleware/api.helper");
const { ApiDataHelper } = require("./data/apiDataHelper");

// Config variables
const fastlink_url = "https://www.fastlink.com.ng/api/data/";
const fastlink_gifting_auth = `Token ${process.env.FASTLINK_AUTH_KEY}`;
const fastlink_sme_auth = `Token ${process.env.FASTLINK_AUTH_KEY_SME}`;

const simservers_url = "https://api.simservers.io";
const simservers_key = process.env.SIMSERVERS_KEY;

const ogdams_url = "https://simhosting.ogdams.ng/api/v1/vend/data";
const ogdams_key = process.env.OGDAMS_KEY;

const cloudsimhost_url = "https://www.cloudsimhost.com/api/buy-data/";
const cloudsimhost_glo_url =
  "https://apiconnect.cloudsimhost.com/api/buy-data/";
const cloudsimhost_key = process.env.CLOUDSIMHOST_KEY;

const almamgt_url = process.env.ALMA_GLO_URL;
const almamgt_key = process.env.ALMA_API_KEY;

const eazymobile_url = process.env.EAZYMOBILE_URL;
const eazymobile_key = process.env.EAZYMOBILE_API_KEY;
const eazymobile_token = process.env.EAZYMOBILE_TOKEN;

const superjara_url = "https://www.superjara.com/api/data/";
const superjara_token = process.env.SUPERJARA_AUTH_NEW_KEY;

const zoedata_url = "https://zoedatahub.com/api/data/";
const zoedata_auth = `Token ${process.env.ZOEDATA_AUTH_KEY}`;

// N3TDATA
const n3tdata_url = process.env.N3TDATA_URL;
const n3tdata_token = process.env.N3TDATA_TOKEN;

const gladtidings_url = process.env.GLADTIDINGS_URL;
const gladtidings_token = process.env.GLADTIDINGS_TOKEN;

// Names of integration used in saving gateway response to DB
const integrationTypes = {
  SUPERJARA: "SUPERJARA",
  FASTLINK: "FASTLINK",
  SIMSERVER: "SIMSERVER",
  OGDAMS: "OGDAMS",
  OGDAMS_9MOBILE: "OGDAMS_9MOBILE",
  CLOUDSIMHOST: "CLOUDSIMHOST",
  ALMAMGT_GLO: "ALMAMGT_GLO",
  EAZYMOBILE: "EAZYMOBILE",
  ZOEDATA: "ZOEDATA",
  MSORG: "MSORG",
  UNKNOWN: "UNKNOWN",
};

exports.validateSendData = (body) => {
  const schema = joi.object({
    network: joi.string().valid("mtn", "glo", "9mobile", "airtel").required(),
    plan_id: joi.number().required(),
    phone_number: joi.string().required(),
    allocate_for_business: joi.boolean(),
    business_id: joi.string(),
  });

  return schema.validate(body, { abortEarly: false });
};

exports.get_plan_details = async (plan_id) => {
  delete require.cache[require.resolve("./networkData")];
  const plans = require("./networkData").plans;

  if (!plans.hasOwnProperty(plan_id))
    return { error: true, status: 401, message: "Invalid Plan Id" };
  const selectedPlan = plans[plan_id];
  const volume_strings = selectedPlan.size.split(" ");
  const volume = Number(volume_strings[0]) * units[volume_strings[1]];

  return {
    ..._.pick(selectedPlan, [
      "validity",
      "price",
      "network",
      "plan_type",
      "size",
    ]),
    volume,
    id: plan_id,
    error: false,
  };
};

exports.get_network_provider = (network_provider) => {
  for (let ID in network_ids) {
    if (network_ids[ID] === network_provider.trim().toLowerCase()) {
      return {
        network: network_provider.trim().toLowerCase(),
        id: ID,
        error: false,
      };
    }
  }
  return { error: true, status: 400, message: "Network Provider is Invalid" };
};

exports.validate_phone_number = (number, network_provider) => {
  if (number.length !== 11 && parseInt(number).length !== 10) {
    return { error: true, status: 401, message: "Invalid Phone Number" };
  }
  const init = number.slice(0, 4);
  if (!network_numbers[network_provider].includes(init))
    return {
      error: true,
      status: 401,
      message: "Network Provider and Phone Number do not match",
    };

  const ported = ported_numbers.includes(init) ? "true" : "false";
  return { number, ported, error: false, message: "Phone Number is Valid" };
};

exports.get_request_payload = (network, mobile_number, plan, Ported_number) => {
  return {
    network,
    mobile_number,
    plan,
    Ported_number,
  };
};

//

const getFieldAndAmount = (type, planDetails, price, volume) => {
  let { network, plan_type, size } = planDetails;

  // console.log("plan deetails", planDetails)

  function convertStorageSize(size) {
    var value = parseInt(size); // Extract the numeric value
    var unit = size.match(/[a-zA-Z]+$/)[0]; // Extract the unit (e.g., 'gbe' or 'mbe')

    if (unit.toLowerCase() === "mbe") {
      return value; // If the unit is 'mbe', return the value as it is
    } else if (unit.toLowerCase() === "gbe") {
      return value * 1024; // If the unit is 'gbe', multiply the value by 1024
    }
    if (unit.toLowerCase() === "mb") {
      return value; // If the unit is 'mbe', return the value as it is
    } else if (unit.toLowerCase() === "gb") {
      return value * 1024; // If the unit is 'gbe', multiply the value by 1024
    } else {
      return null; // Invalid unit
    }
  }

  if (type != "lite") {
    let pType;
    let volume = convertStorageSize(size);
    if (network === "mtn") {
      if (plan_type === "sme") {
        volume =
          volume < 1024
            ? volume
            : volume < 1048576
            ? ~~(volume / 1024) * 1000
            : ~~(volume / 1048576) * 1000000;
        console.log("sme volume", volume);
        pType = `${network}_sme`;
      } else if (plan_type.includes("gifting")) {
        volume =
          volume < 1024
            ? volume
            : volume < 1048576
            ? ~~(volume / 1024) * 1000
            : ~~(volume / 1048576) * 1000000;

        pType = `${network}_gifting`;
      } else {
        volume =
          volume < 1024
            ? volume
            : volume < 1048576
            ? ~~(volume / 1024) * 1000
            : ~~(volume / 1048576) * 1000000;

        pType = `${network}`;
      }
    } else if (
      network === "airtel" ||
      network === "9mobile" ||
      network === "glo"
    ) {
      volume =
        volume < 1024
          ? volume
          : volume < 1048576
          ? ~~(volume / 1024) * 1000
          : ~~(volume / 1048576) * 1000000;
      pType = `${network}`;
    } else {
      pType = `${network}`;
    }
    return { field: `mega_wallet.${pType}`, amount: volume };
  } else {
    return { field: "wallet_balance", amount: price };
  }
};

exports.debit_account_balance = async (
  account_id,
  planDetails,
  type,
  price,
  volume
) => {
  // console.log({ account_id, planDetails, type, price, volume });

  const { amount, field } = getFieldAndAmount(type, planDetails, price, volume);

  // console.log({ amount, field });

  // let decrementBy = null;
  // let fieldType = null;

  // if (type == "lite") {
  //   decrementBy = planDetails.price;
  //   fieldType = "wallet_balance";
  // } else {
  //   decrementBy = planDetails.volume;
  //   fieldType = `mega_wallet.${planDetails.network}`;
  // }

  const updatedBalance = await debit(account_id, amount, field);

  // console.log({ account_id, decrementBy, fieldType });

  // const updatedBalance = await debit(account_id, decrementBy, fieldType);

  const balance = await dataBalance.findOne({ business: account_id });
  const oldUser_bal = balance.wallet_balance;

  const userAcct = await Account.findOne({ _id: account_id });

  console.log("DEBBIT PRICE", amount);

  if (updatedBalance.error) return updatedBalance;

  if (userAcct.type == "lite") {
    const newMonnifyHistory = new monnifyHistory({
      business_name: userAcct.name,
      business_id: account_id,
      amount: amount,
      resolvedAmount: amount,
      new_bal: balance.wallet_balance,
      old_bal: oldUser_bal,
      purpose: "Data Purchase",
      desc: `Data purchase of ${amount} NGN made by ${userAcct.name}.`,
      pay_type: "debit",
      date_of_payment: new Date(),
      payment_ref: generateTransactionId(),
    });

    await newMonnifyHistory.save();
  }

  return {
    error: false,
    status: 201,
    balance: updatedBalance.balance,
    debited: amount,
  };
};

exports.revert_debit_account_balance = async (
  account_id,
  planDetails,
  type,
  price
) => {
  const { amount, field } = getFieldAndAmount(type, planDetails);
  let incrementBy;

  if (type == "lite") {
    incrementBy = price * -1;
  } else {
    incrementBy = amount * -1;
  }

  const updatedBalance = await debit(account_id, incrementBy, field);

  const balance = await dataBalance.findOne({ business: account_id });
  const oldUser_bal = balance.wallet_balance;

  // add to wallet
  const userAcct = await Account.findOne({ _id: account_id });

  if (userAcct.type == "lite") {
    console.log("REVERRRT PRICE", price);

    const newMonnifyHistory = new monnifyHistory({
      business_name: userAcct.name,
      business_id: account_id,
      amount: Number(price),
      resolvedAmount: Number(price),
      new_bal: balance.wallet_balance,
      old_bal: oldUser_bal,
      purpose: "Data Purchase",
      desc: `Refund of ${Number(price)} NGN made by ${userAcct.name}.`,
      pay_type: "credit",
      date_of_payment: new Date(),
      payment_ref: generateTransactionId(),
    });

    await newMonnifyHistory.save();
  }

  // add to wallet

  if (updatedBalance.error) return updatedBalance;
  return { error: false, status: 201, balance: updatedBalance.balance };
};

// Get config header for fastlink API calls
function getConfig(type) {
  // "Authorization": (type == "gifting") ? fastlink_gifting_auth : fastlink_sme_auth,
  return {
    headers: {
      Authorization: zoedata_auth,
      "Content-Type": "application/json",
    },
  };
}

exports.initiate_data_transfer = async (
  requestPayload,
  { size, ref, type }
) => {
  let integResp;
  let integName;
  try {
    if (requestPayload.network == 4) {
      // SECTION - AIRTEL PURCHASE

      const { error, plan_id } = ayinlak_airtel_size_map(size);
      if (error)
        return {
          error: true,
          status: 400,
          message: "This data plan is currently not available",
        };

      return await ApiDataHelper.Ayinlak(
        requestPayload.network,
        plan_id,
        requestPayload.mobile_number
      );

      // update api balance
      // await n3tdataApiUpdateBalance(response);
    } else if (requestPayload.network == 2) {
      // SECTION - PURCHASE FOR ALMAGMT GLO
      integName = integrationTypes.ALMAMGT_GLO;

      const { error, plan_id } = cloudsimhost_glo_size_map(size);
      if (error)
        return {
          error: true,
          status: 400,
          message: "This data plan is currently not available",
        };

      const req_header = {
        headers: {
          "x-api-key": almamgt_key,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      const [url, key_algmat] = [
        process.env.GLO_BASE_URL,
        process.env.GLO_API_KEY,
      ];

      const config = {
        headers: {
          "x-api-key": key_algmat,
          "Content-Type": "application/json",
        },
      };

      const randomMax = BigInt("99849294974397393924");
      const randomMin = BigInt("10849294974397393924");
      const unit = BigInt(10);

      let bucketIDVar;
      let attempt = 0;

      do {
        await axios
          .post("https://wisper-reseller.herokuapp.com/api/admin/getBucketOne")
          .then((res) => {
            bucketIDVar = res.data;
            console.log({ res: res.data });
          });

        if (bucketIDVar) {
          console.log("Bucket ID:", bucketIDVar);
        } else {
          console.log("Failed to retrieve bucketIDVar");
          console.log("Bucket ID:", bucketIDVar);
          return {
            error: true,
            status: 400,
            message: "An error occured with data transfer server",
          };
        }

        const payload = {
          msisdn: requestPayload.mobile_number,
          planId: plan_id,
          sponsorId: `${process.env.GLO_SPONSOR_ID}`,
          quantity: 1,
          bucketId: bucketIDVar,
          ignoresms: false,
          transId: Math.floor(
            Number(
              (BigInt(Math.floor(Math.random() * 10)) *
                (randomMax - randomMin)) /
                unit +
                randomMin
            )
          ).toString(),
        };

        try {
          const respGlo = await axios.post(
            url,
            JSON.stringify(payload),
            config
          );

          console.log("resp GLO RESPONSE", respGlo.data);

          if (respGlo.data.status === "ok") {
            console.log("success", payload.bucketId);

            integResp = respGlo.data;
            respGlo.data["actual_response"] = respGlo.data.message;

            respGlo.data.message = gatewayResponse(
              plan_id,
              requestPayload.mobile_number
            );

            // console.log("INTEGRESP", integResp);

            // const message = integResp["message"];
            const message = gatewayResponse(
              plan_id,
              requestPayload.mobile_number
            );

            try {
              // Update glo_almamgt for admin users
              const updateResult = await Account.updateMany(
                { isAdmin: true },
                { glo_almamgt: integResp["balance"] }
              );

              // console.log(` admin users updated: ${updateResult}`);
            } catch (error) {
              // console.log(error);
            }

            await apiBalanceModel.findOneAndUpdate(
              { api: "almamgt" },
              { $set: { volume: Number(integResp["balance"]) } }
            );

            console.log({ error: false, message });
            return { error: false, response: respGlo, message };
          }
        } catch (error) {
          console.log("error NOT IIF", error);

          // if (
          //   error.response.data.message.toLowerCase() ==
          //   "You do not have sufficient volume in bucket. To complete this transaction, please contact Globacom manager.".toLowerCase()
          // ) {
          //   console.log("error IFFF", error.response.data.message);

          //   await axios
          //     .post(
          //       "https://wisper-reseller.herokuapp.com/api/admin/bucketIDSwitchOne"
          //     )
          //     .then((res) => {
          //       bucketIDVar = undefined;
          //       console.log("Attempt", { res: res.data });
          //     })
          //     .catch((err) => {
          //       console.log("error switching");
          //     });
          // }

          if (error) {
            if (error.response) {
              // Check if error.response.data is defined
              if (error.response.data) {
                console.log("Error message:", error.response.data.message);

                if (
                  error.response.data.message.toLowerCase() ==
                  "You do not have sufficient volume in bucket. To complete this transaction, please contact Globacom manager.".toLowerCase()
                ) {
                  console.log("error IFFF", error.response.data.message);

                  await axios
                    .post(
                      "https://wisper-reseller.herokuapp.com/api/admin/bucketIDSwitchOne"
                    )
                    .then((res) => {
                      bucketIDVar = undefined;
                      console.log("Attempt", { res: res.data });
                    })
                    .catch((err) => {
                      console.log("error switching");
                    });
                }
              } else {
                console.log("error.response.data is undefined");
                return {
                  error: true,
                  status: 400,
                  message: "An error occured with data transfer server",
                };
              }
            }
          }

          attempt++;
        }
      } while (attempt < 3 && !bucketIDVar);

      console.log({
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      });

      return {
        error: true,
        status: 400,
        message: "An error occured with data transfer server",
      };
      // end of glo
    } else if (requestPayload.network == 742) {
      // FIXME - New Data purcahse for GLO ZOEDATA
      integName = integrationTypes.ZOEDATA;

      const { error, plan_id } = zoedata_glo_size_map(size);

      console.log({ error, plan_id });
      if (error)
        return {
          error: true,
          status: 400,
          message: "This data plan is currently not available",
        };

      // console.log({
      //   zoedata_url,
      //   network: Number(requestPayload.network),
      //   mobile_number: requestPayload.mobile_number,
      //   plan: plan_id,
      //   Ported_number: Boolean(requestPayload.Ported_number),
      //   zoedata_auth,
      // });

      const response = await axios.post(
        zoedata_url,
        {
          network: Number(requestPayload.network),
          mobile_number: requestPayload.mobile_number,
          plan: plan_id,
          Ported_number: Boolean(requestPayload.Ported_number),
        },
        {
          headers: {
            Authorization: zoedata_auth,
            "Content-Type": "application/json",
          },
        }
      );

      // Fire event to save gateway response to DB

      integResp = response.data;

      // Fire event to save fastlink gateway response to DB
      if (
        response.data &&
        response.data.Status &&
        response.data.Status === "successful"
      ) {
        const full_message = response.data.api_response.split("with")[1];
        const message = "You have successfully purchased" + full_message;
        return { error: false, response: response.data, message };
      } else {
        // client.sendEmail({
        //   From: "admin@wisper.ng",
        //   To: "Arinzeebuka@gmail.com",
        //   Subject: "Zoedata service is down on wisper",
        //   TextBody: "Zoedata server is currently down",
        // });

        return {
          error: true,
          status: 400,
          message: "An error occured with data transfer server",
        };
      }
    } else if (requestPayload.network == 3) {
      integName = integrationTypes.OGDAMS_9MOBILE;
      // start of 9mobile integration

      const { error, plan_id } = gladtidings_9mobile_size_map(size);
      if (error)
        return {
          error: true,
          status: 400,
          message: "This data plan is currently not available",
        };
      //
      const req_header = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${gladtidings_token}`,
          Accept: "application/json",
        },
      };

      const req_body = {
        network: 6,
        mobile_number: `${requestPayload.mobile_number}`,
        plan: plan_id,
        Ported_number: false,
      };

      // console.log({ req_body });
      // console.log({ req_header });

      // console.log({ gladtidings_url });

      let response;

      try {
        response = await axios.post(
          `https://www.gladtidingsdata.com/api/data/`,
          req_body,
          req_header
        );

        console.log({ gladtidings_Response: response });
      } catch (error) {
        // console.log({ error_response: error.response });
        console.log({ error_response_data: error.response.data.error });
        return {
          error: true,
          status: 400,
          message: "An error occured with data transfer server",
        };
      }

      console.log({ response: response.data });

      if (response.data.Status) {
        console.log(response.data.Status);

        return {
          error: false,
          response: response.data,
          // message: `Data purchase for ${requestPayload.mobile_number} is processing`,
          message: `processing`,
        };
      }

      if (
        response.data &&
        response.data.status &&
        response.data.status === "success"
      ) {
        return {
          error: false,
          response: response.data,
          message: response.data.response.message,
        };
      } else {
        return {
          error: true,
          status: 400,
          message: "An error occured with data transfer server",
        };
      }

      // end of 9mobile integration
    }
    // ANYINLAK MTN/ // // // // // // // // // //
    else if (requestPayload.network == 1) {
      // SECTION - PURCHASE FOR ANYINLAK MTN

      const { error, plan_id } = ayinlak_mtn_size_map(size);
      if (error)
        return {
          error: true,
          status: 400,
          message: "This data plan is currently not available",
        };

      return await ApiDataHelper.Ayinlak(
        requestPayload.network,
        plan_id,
        requestPayload.mobile_number
      );

      // update api balance
      // await n3tdataApiUpdateBalance(response);
    } else {
      // Data purchase for other network
      integName = integrationTypes.FASTLINK;
      const response = await axios.post(
        fastlink_url,
        requestPayload,
        getConfig(type)
      );

      // Fire event to save gateway response to DB
      integResp = response.data;

      if (
        response.data &&
        response.data.Status &&
        response.data.Status === "successful"
      ) {
        const message =
          "Data purchase was successful. Check Balance to confirm.";
        return { error: false, response: response.data, message };
      } else {
        // client.sendEmail({
        //   From: "admin@wisper.ng",
        //   To: "Arinzeebuka@gmail.com",
        //   Subject: "FASTLINK service is down",
        //   TextBody: "FASTLINK server is currently down",
        // });

        return {
          error: true,
          status: 400,
          message: "An error occured with data transfer server",
        };
      }
    }
  } catch (e) {
    console.log("ERROOORR MESSAGE::", e.message);
    // console.log({ error: e });
    integResp =
      e?.response?.data || e?.message || "Data volume transafer failed";
    return {
      error: true,
      status: 400,
      message: "Data volume transfer failed",
    };
  } finally {
    IntegrationEvents.emit(integration_response, {
      integration: integName || integrationTypes.UNKNOWN,
      response: integResp,
    });
  }
};

exports.superjara_balance = async () => {
  try {
    const [response_1] = await Promise.all([
      axios.get(fastlink_url, getConfig("gifting")),
      axios.get(fastlink_url, getConfig("sme")),
    ]);
    const account_1 =
      (response_1.data.results[0] &&
        response_1.data.results[0].balance_after) ||
      0;
    const account_2 =
      (response_1.data.results[1] &&
        response_1.data.results[1].balance_after) ||
      0;
    return {
      balance: { account_1, account_2 },
      message: "API balance successfully fetched",
    };
  } catch (e) {
    console.log("ERROOORR STACK::", e.stack);
    return { error: true, message: "Error! Unable to fetch data balance" };
  }
};

exports.simserver_balance = (response) => {
  const balance = response["data"]["after_balance"];
  return { account_1: balance };
};

exports.format_transaction_response = ({
  type,
  debitAccount,
  validNumber,
  providerId,
  planDetails,
  uuid,
  getCurrentTime,
}) => {
  const responseObject = {};
  responseObject.new_balance =
    type === "mega"
      ? debitAccount.balance.mega_wallet
      : {
          cash_balance: debitAccount.balance.wallet_balance,
          unit: debitAccount.balance.data_unit,
        };
  responseObject.phone_number = validNumber.number;
  responseObject.status = "success";
  responseObject.network_provider = providerId.network;
  responseObject.data_volume = debitAccount.debited;
  responseObject.plan_id = planDetails.id;
  // responseObject.price = planDetails.price;
  responseObject.transaction_ref = uuid.v4();
  responseObject.created_at = getCurrentTime();
  return responseObject;
};

exports.save_transaction = async (business_id, details, volume) => {
  const newTransaction = details;
  // console.log({ newTransaction });
  newTransaction.business_id = business_id;
  newTransaction.lite_volume = volume;
  try {
    const savedTransaction = await addTransaction(newTransaction);
    return {
      error: false,
      status: 201,
      transaction: savedTransaction.transaction,
    };
  } catch (e) {
    return { error: true, status: 400, transaction: newTransaction };
  }
};

exports.update_transaction_status = async (transaction_ref, status) => {
  const updateQuery = { transaction_ref };
  const updateBody = { status };
  try {
    const response = await updateTransaction(updateQuery, updateBody);
    return { error: false, status: 201, transaction: response.transaction };
  } catch (e) {
    return {
      error: true,
      status: 400,
      message: `Unable to update transaction`,
    };
  }
};

exports.nairaToData = (nairaAmount) => {
  return (parseInt(nairaAmount) / 300) * 1024;
};

exports.getCurrentTime = () => {
  return moment().tz("Africa/Lagos").format("YYYY/MM/D hh:mm:ss A");
};

exports.checkMaintenance = async (planDetails) => {
  const { network, plan_type } = planDetails;
  const maintenance = await Maintenance.findOne();
  const { mtn_sme, mtn_gifting, airtel, glo } = maintenance;
  if (network === "airtel") {
    if (airtel == true) {
      return {
        error: true,
        status: 400,
        message:
          "Airtel is currently NOT available. We'll let you know when it is back up.",
      };
    }
    return {
      error: false,
      status: 200,
      message: "Airtel is available for use",
    };
  } else if (network === "glo") {
    if (glo == true) {
      return {
        error: true,
        status: 400,
        message:
          "GLO is currently NOT available. We'll let you know when it is back up.",
      };
    }
    return { error: false, status: 200, message: "GLO is available for use" };
  } else if (network === "mtn") {
    if (plan_type === "sme" && mtn_sme == true) {
      return {
        error: true,
        status: 400,
        message:
          "MTN SME is currently NOT available. We'll let you know when it is back up.",
      };
    }
    if (plan_type === "gifting" && mtn_gifting == true) {
      return {
        error: true,
        status: 400,
        message:
          "MTN GIFTING is currently NOT available. We'll let you know when it is back up.",
      };
    }
    return { error: false, status: 200, message: "MTN is available for use" };
  } else {
    return {
      error: false,
      status: 200,
      message: "Network is available for use",
    };
  }
};

const generateTransactionId = () => {
  const timestamp = Date.now(); // Get the current timestamp in milliseconds
  const random = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
  const trxId = `AD-trx-${timestamp}${random}`; // Concatenate timestamp and random number
  return trxId;
};
