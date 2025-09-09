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

const sendData = async (req, res, next) => {
  const { _id, type } = req.user;

  // console.log("IP ADDRESS", req.connection.remoteAddress);

  // Ensure user Type is provided
  if (!type)
    return res.status(400).json({
      error: true,
      status: 400,
      message: "Unrecognised User. Try Loging in again",
    });

  //
  let {
    network,
    plan_id,
    phone_number,
    allocate_for_business,
    business_id,
    price,
    volume,
    api_ref,
  } = req.body;

  // Check for Callback url
  const { callback } = req.query;

  // validate request body
  // const {error} = validateSendData(req.body)
  // if (error) return res.status(401).json({error: true, status: 401, message: _.map(error.details, 'message')})

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


  //

  const requestPayload = get_request_payload(
    r_provider,
    r_number,
    r_planId,
    r_ported
  );

  // console.log({ planDetails });

  price = price || planDetails.price;
  volume = volume || planDetails.volume;

  // console.log("Request payloadsshsh", requestPayload)

  // Transaction block
  try {
    // check account balance and debit
    const debitAccount = await debit_account_balance(
      _id,
      planDetails,
      type,
      price,
      volume
    );

    // console.log("main plan detalsjshj")

    // console.log("debit", debitAccount)

    if (debitAccount.error) {
      await revert_debit_account_balance(
        _id,
        planDetails,
        type,
        planDetails.price
      );

      return res
        .status(debitAccount.status)
        .json({ status: debitAccount.status, message: debitAccount.message });
      // throw new Error(debitAccount.message);
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
      _id,
      responseObject,
      volume || "",
      api_ref || null
    );
    if (savedTransaction.error) {
      await revert_debit_account_balance(
        _id,
        planDetails,
        type,
        planDetails.price
      );

      return res.status(400).json({
        error: true,
        status: "failed",
        message: "Server Error! Please try again later",
      });
      // throw new Error("Server Error! Please try again later");
    }

    // transfer data to phone number
    const send_response = await initiate_data_transfer(requestPayload, {
      size: planDetails.size,
      ref: responseObject.transaction_ref,
      type: planDetails.plan_type,
    });

    console.log({ send_response });

    // send_response error handling
    if (send_response?.error) {
      responseObject.status = "failed";
      delete responseObject.new_balance;
      await update_transaction_status(responseObject.transaction_ref, "failed");

      console.log("SEND ERROR");
      await revert_debit_account_balance(
        _id,
        planDetails,
        type,
        planDetails.price
      );

      return res
        .status(400)
        .json({ ...responseObject, message: send_response.message });
    }

    // glo resolution start
    if (send_response?.response?.data?.balance) {
      const glo_bal = send_response.response.data["balance"];
      console.log({ glo_bal });

      const sameTrx = await transactionHistory.findOne({
        _id: savedTransaction.transaction._id,
      });
      sameTrx.gloB = glo_bal;
      await sameTrx.save();
      // glo resolution end
    }

    // send gateway response along with API response
    responseObject["gateway_response"] = send_response.message;

    // If endpoint is called by Admin
    if (allocate_for_business && allocate_for_business == true && business_id) {
      responseObject.admin_ref = responseObject.transaction_ref;
      responseObject.transaction_ref = uuid.v4();
      await save_transaction(business_id, responseObject);
    }

    // Fire callback event to send callback
    if (callback)
      CallbackEvent.emit(handle_callback, {
        callback,
        payload: { ...responseObject, message: "Transaction Successful!" },
      });
    return res
      .status(201)
      .json({ ...responseObject, message: "Transaction Successful!" });
  } catch (error) {
    console.log("CATCH ERROR");

    console.log(error);
    console.log("In catch: " + error.message);

    await revert_debit_account_balance(
      _id,
      planDetails,
      type,
      planDetails.price
    );

    return res.status(500).json({
      error: true,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

module.exports = sendData;
