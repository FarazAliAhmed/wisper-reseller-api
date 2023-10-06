const uuid = require("uuid");
const CallbackEvent = require("../events/callback.event");
const { handle_callback } = require("../events/_eventTypes");
const _ = require("lodash");

var postmark = require("postmark");
const client = new postmark.ServerClient(process.env.POSTMARK);
const {
  validateSendData,
  get_plan_details,
  get_network_provider,
  validate_phone_number,
  getCurrentTime,
  checkMaintenance,
} = require("../utils").helpers;

const {
  debit_account_balance,
  revert_debit_account_balance,
  get_request_payload,
  initiate_data_transfer,
  save_transaction,
  format_transaction_response,
  update_transaction_status,
} = require("../utils");
const transactionHistory = require("../models/transactionHistory");
const {
  debitStoreFrontMegaWallet,
  verifyFlutterWaveTransaction,
  revertStoreFrontMegaWallet,
} = require("../utils/sFHelper");
const { Account } = require("../models/account");

const SFSendData = async (req, res) => {
  const {
    network,
    plan_id,
    phone_number,
    allocate_for_business,
    business_id,
    price,
    volume,
    trx_ref,
    custName,
    custEmail,
  } = req.body;

  // check that network is valid
  const providerId = get_network_provider(network);
  if (providerId.error) return res.status(providerId.status).json(providerId);

  // TODO - Optimize process by merging "fetching plan details" and "fetching Maintenance Info from DB"
  // validate and get data plan details
  const planDetails = await get_plan_details(plan_id);
  if (planDetails.error)
    return res.status(planDetails.status).json(planDetails);

  // Check if data purchase provider is under maintenance
  const maintenance = await checkMaintenance(planDetails);
  if (maintenance.error)
    return res.status(maintenance.status).json(maintenance);

  // check that phone number is valid
  const validNumber = validate_phone_number(phone_number, providerId.network);
  if (validNumber.error)
    return res.status(validNumber.status).json(validNumber);

  // prepare superjara request link
  const r_provider = providerId.id;
  const r_number = validNumber.number;
  const r_planId = planDetails.id;
  const r_ported = validNumber.ported;

  const requestPayload = get_request_payload(
    r_provider,
    r_number,
    r_planId,
    r_ported
  );

  // console.log("Request payloadsshsh", requestPayload)

  // Transaction block
  try {
    const verfiyFlw = await verifyFlutterWaveTransaction(trx_ref, price);

    if (verfiyFlw.error) {
      res
        .status(verfiyFlw.status)
        .json({ status: verfiyFlw.status, message: verfiyFlw.message });
      throw new Error(verfiyFlw.message);
    }

    const storeOwner = await Account.findOne({ _id: business_id });

    // check account balance and debit
    const debitAccount = await debitStoreFrontMegaWallet(
      business_id,
      network,
      volume,
      phone_number,
      price,
      custName,
      custEmail,
      trx_ref,
      storeOwner.type,
      plan_id
    );

    console.log("debit", debitAccount);

    if (debitAccount.error) {
      res
        .status(debitAccount.status)
        .json({ status: debitAccount.status, message: debitAccount.message });
      throw new Error(debitAccount.message);
    }

    // **********************
    const responseObject = format_transaction_response({
      type,
      debitAccount,
      validNumber,
      providerId,
      planDetails,
      uuid,
      getCurrentTime,
    });

    // save the transaction to database
    const savedTransaction = await save_transaction(
      business_id,
      responseObject,
      volume || ""
    );
    if (savedTransaction.error) {
      res
        .status(400)
        .json({ status: 400, message: "Server Error! Please try again later" });
      throw new Error("Server Error! Please try again later");
    }

    // transfer data to phone number
    const send_response = await initiate_data_transfer(requestPayload, {
      size: planDetails.size,
      ref: responseObject.transaction_ref,
      type: planDetails.plan_type,
    });
    if (send_response?.error) {
      responseObject.status = "failed";
      delete responseObject.new_balance;
      await update_transaction_status(responseObject.transaction_ref, "failed");

      res
        .status(400)
        .json({ ...responseObject, message: send_response.message });
      throw new Error(send_response.message);
    }

    // glo resolution start
    const glo_bal = send_response.response.data["balance"];

    console.log({ glo_bal });

    console.log(savedTransaction);

    const sameTrx = await transactionHistory.findOne({
      _id: savedTransaction.transaction._id,
    });
    sameTrx.gloB = glo_bal;

    await sameTrx.save();
    // glo resolution end

    // send gateway response along with API response
    responseObject["gateway_response"] = send_response.message;

    // If endpoint is called by Admin
    if (allocate_for_business && allocate_for_business == true && business_id) {
      responseObject.admin_ref = responseObject.transaction_ref;
      responseObject.transaction_ref = uuid.v4();
      await save_transaction(business_id, responseObject);
    }

    // Fire callback event to send callback

    return res
      .status(201)
      .json({ ...responseObject, message: "Transaction Successful!" });
  } catch (error) {
    // console.log(error);
    console.log("In catch: " + error.message);

    const storeOwner = await Account.findOne({ _id: business_id });

    await revertStoreFrontMegaWallet(
      business_id,
      network,
      volume,
      phone_number,
      price,
      storeOwner.type
    );
  }
};

module.exports = SFSendData;
