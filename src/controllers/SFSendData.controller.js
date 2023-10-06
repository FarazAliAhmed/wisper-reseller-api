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

  // console.log({ planDetails });
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

  // console.log("Request payloadsshsh", requestPayload);

  // Transaction block
  try {
    const verfiyFlw = await verifyFlutterWaveTransaction(trx_ref, price);

    if (verfiyFlw.error) {
      // res
      //   .status(verfiyFlw.status)
      //   .json({ status: verfiyFlw.status, message: verfiyFlw.message });
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

    // console.log("debit", debitAccount);

    if (debitAccount.error) {
      // res
      //   .status(debitAccount.status)
      //   .json({ status: debitAccount.status, message: debitAccount.message });
      throw new Error(debitAccount.message);
    }

    // transfer data to phone number
    const send_response = await initiate_data_transfer(requestPayload, {
      size: planDetails.size,
      ref: trx_ref,
      type: planDetails.plan_type,
    });

    // console.log({ send_response });

    if (send_response?.error) {
      throw new Error(send_response.message);
    }

    console.log({ message: send_response.message, status: "success" });
    return res
      .status(201)
      .json({ message: send_response.message, status: "success" });
  } catch (error) {
    console.log(error);
    // console.log("In catch: " + error.message);

    const storeOwner = await Account.findOne({ _id: business_id });

    await revertStoreFrontMegaWallet(
      business_id,
      network,
      volume,
      phone_number,
      price,
      storeOwner.type,
      custName,
      custEmail,
      trx_ref
    );

    console.log({ message: "Data allocation failed", status: "failed" });
    return res
      .status(500)
      .json({ message: "Data allocation failed", status: "failed" });
  }
};

module.exports = SFSendData;
