/* eslint-disable no-useless-catch */
const axios = require("axios");
const dataBalance = require("../models/dataBalance");
const paymentpointHistory = require("../models/paymentpointHistory");
const { Account } = require("../models/account");

/**
 * PaymentPoint Service
 * Handles virtual account creation, webhook processing, and transaction management
 * Following PaymentPoint API documentation: https://paymentpoint.gitbook.io/paymentpoint.co
 */
class PaymentPointService {
  constructor() {
    this.baseUrl = process.env.PAYMENTPOINT_BASE_URL || "https://api.paymentpoint.co";
    this.apiKey = process.env.PAYMENTPOINT_API_KEY;
    this.secretKey = process.env.PAYMENTPOINT_SECRET_KEY;
  }

  /**
   * Get API URL with proper path formatting
   * @param {string} path - API endpoint path
   * @returns {string} Full API URL
   */
  getApiUrl(path) {
    const baseUrl = this.baseUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Get authorization headers for PaymentPoint API
   * @returns {Object} Headers object with authorization
   */
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.secretKey}`,
      "api-key": this.apiKey,
    };
  }

  /**
   * Create a virtual account for a user
   * @param {Object} params - Account creation parameters
   * @param {string} params.accountReference - Unique reference (user ID)
   * @param {string} params.accountName - Account holder name
   * @param {string} params.customerEmail - Customer email
   * @param {string} params.customerName - Customer full name
   * @param {string} params.bvn - Bank Verification Number (optional)
   * @param {string} params.nin - National Identification Number (optional)
   * @returns {Promise<Object>} Virtual account details
   */
  async createVirtualAccount({
    accountReference,
    accountName,
    customerEmail,
    customerName,
    bvn,
    nin,
  }) {
    try {
      console.log(`Creating PaymentPoint virtual account for: ${customerEmail}`);

      // Check if account already exists
      const existingAccount = await this.getAccountDetails(accountReference);
      
      if (existingAccount && existingAccount.status === "active") {
        console.log("PaymentPoint account already exists");
        
        // Update user's bank accounts in database
        await Account.findOneAndUpdate(
          { email: customerEmail },
          { 
            $set: { 
              paymentpointAccounts: existingAccount.accounts || [],
              paymentpointAccountReference: accountReference,
            } 
          },
          { new: true }
        );

        return {
          success: true,
          message: "Account already exists",
          data: existingAccount,
        };
      }

      // Get user for phone number
      const user = await Account.findOne({ email: customerEmail });
      if (!user) {
        throw new Error("User not found in database");
      }

      // Prepare payload for account creation
      // Use the registered PaymentPoint business ID
      const PAYMENTPOINT_BUSINESS_ID = "71e885f182ed5ea4454ef5e1d7e9a2ec40d11b36";
      
      const payload = {
        email: customerEmail,
        name: customerName,
        phoneNumber: user.mobile_number || user.phone || user.phoneNumber || "07000000000", // Use default if not available
        bankCode: ['20946', '20897'], // Palmpay and other banks
        businessId: PAYMENTPOINT_BUSINESS_ID,
      };

      console.log("PaymentPoint API Payload:", JSON.stringify(payload, null, 2));

      // Note: PaymentPoint doesn't use BVN/NIN in their API
      if (bvn) {
        console.log("BVN provided but not used by PaymentPoint API");
      }
      if (nin) {
        console.log("NIN provided but not used by PaymentPoint API");
      }

      // Create virtual account via PaymentPoint API
      const response = await axios.post(
        this.getApiUrl("/api/v1/createVirtualAccount"),
        payload,
        { headers: this.getHeaders() }
      );

      const accountData = response.data;

      // Extract bank accounts from response
      const bankAccounts = accountData.bankAccounts || [];
      
      // Update user record with PaymentPoint account details
      const newBankAcct = bankAccounts.map(account => ({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      }));
      
      await Account.findOneAndUpdate(
        { email: customerEmail },
        { 
          $set: { 
            paymentpointAccounts: newBankAcct,
            paymentpointAccountReference: accountData.customer?.customer_id || accountReference,
          } 
        },
        { new: true }
      );

      console.log(`PaymentPoint account created successfully with ${bankAccounts.length} bank account(s)`);

      return {
        success: true,
        message: "Virtual account created successfully",
        data: accountData,
      };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message;

      console.error("PaymentPoint createVirtualAccount error:", errorMessage);
      
      throw new Error(`PaymentPoint account creation failed: ${errorMessage}`);
    }
  }

  /**
   * Get virtual account details
   * @param {string} accountReference - Account reference to query (user ID)
   * @returns {Promise<Object|null>} Account details or null if not found
   */
  async getAccountDetails(accountReference) {
    try {
      // First check database for saved PaymentPoint accounts
      const user = await Account.findById(accountReference).select('paymentpointAccounts paymentpointAccountReference email name');
      
      if (user && user.paymentpointAccounts && user.paymentpointAccounts.length > 0) {
        // Return accounts from database
        return {
          status: "active",
          accounts: user.paymentpointAccounts,
          accountReference: user.paymentpointAccountReference || accountReference,
          customerEmail: user.email,
          customerName: user.name,
        };
      }

      // If not in database, return null (account doesn't exist)
      return null;
    } catch (error) {
      console.error("PaymentPoint getAccountDetails error:", error?.message);
      return null;
    }
  }

  /**
   * Process webhook notification from PaymentPoint
   * Automatically credits user wallet when payment is received
   * @param {Object} webhookData - Webhook payload from PaymentPoint
   * @returns {Promise<Object>} Processing result
   */
  async processWebhook(webhookData) {
    try {
      console.log("Processing PaymentPoint webhook - FULL PAYLOAD:", JSON.stringify(webhookData, null, 2));

      // Official PaymentPoint webhook fields (from docs):
      // transaction_id, amount_paid, settlement_amount, transaction_status
      // sender: { name, account_number, bank }
      // receiver: { name, account_number, bank }
      // customer: { name, email, phone, customer_id }
      // notification_status, description, timestamp

      const transaction_id = webhookData.transaction_id;
      const amount_paid = webhookData.amount_paid;
      const settlement_amount = webhookData.settlement_amount;
      const transaction_status = webhookData.transaction_status;
      const notification_status = webhookData.notification_status;
      const customer = webhookData.customer || {};
      const receiver = webhookData.receiver || {};
      const sender = webhookData.sender || {};

      console.log("Extracted fields:", {
        transaction_id,
        amount_paid,
        settlement_amount,
        transaction_status,
        notification_status,
        customer_email: customer.email,
        receiver_account: receiver.account_number,
      });

      // Validate required fields
      if (!transaction_id || !amount_paid) {
        console.error("Missing required fields. Full payload:", JSON.stringify(webhookData, null, 2));
        throw new Error("Invalid webhook data: missing required fields");
      }

      // Check if transaction already processed
      const existingTransaction = await paymentpointHistory.findOne({
        payment_ref: transaction_id,
      });

      if (existingTransaction) {
        console.log("Transaction already processed:", transaction_id);
        return { success: true, message: "Transaction already processed" };
      }

      // Only process successful payments
      const successStatuses = ["successful", "success", "payment_successful"];
      const isSuccess = successStatuses.includes(transaction_status) || 
                        successStatuses.includes(notification_status);

      if (!isSuccess) {
        console.log("Payment not successful, skipping. Status:", transaction_status, notification_status);
        return { success: false, message: `Payment not successful: ${transaction_status}` };
      }

      // Find user by customer email or receiver account number
      let userAccount = null;
      let balance = null;

      // Try by customer email first
      if (customer.email) {
        userAccount = await Account.findOne({ email: customer.email.toLowerCase() });
      }

      // Try by receiver account number (virtual account number)
      if (!userAccount && receiver.account_number) {
        userAccount = await Account.findOne({
          "paymentpointAccounts.accountNumber": receiver.account_number,
        });
      }

      // Try by customer_id (stored as paymentpointAccountReference)
      if (!userAccount && customer.customer_id) {
        userAccount = await Account.findOne({
          paymentpointAccountReference: customer.customer_id,
        });
      }

      if (!userAccount) {
        console.error("Could not find user. customer:", customer, "receiver:", receiver);
        throw new Error("User not found for this payment");
      }

      balance = await dataBalance.findOne({ business: userAccount._id });
      if (!balance) {
        throw new Error(`Balance record not found for user: ${userAccount.email}`);
      }

      // Use settlement_amount (already has fee deducted by PaymentPoint)
      // But we still deduct our own ₦50 processing fee
      const processingFee = 50;
      const amountToCredit = Number(settlement_amount || amount_paid) > processingFee
        ? Number(settlement_amount || amount_paid) - processingFee
        : 0;

      const oldBalance = balance.wallet_balance;

      // Credit user's wallet
      if (amountToCredit > 0) {
        await dataBalance.findOneAndUpdate(
          { business: userAccount._id },
          { $inc: { wallet_balance: amountToCredit }, last_purchase: new Date() },
          { new: true }
        );
        console.log(`✓ Credited ₦${amountToCredit} to ${userAccount.email}`);
      }

      const newBalance = oldBalance + amountToCredit;

      // Save transaction history
      const transactionHistory = new paymentpointHistory({
        business_name: customer.name || userAccount.name,
        business_id: userAccount._id.toString(),
        amount: amountToCredit,
        resolvedAmount: amountToCredit,
        new_bal: String(newBalance),
        old_bal: oldBalance,
        purpose: "Funding - PaymentPoint",
        desc: `Deposit of ₦${amountToCredit} from ${sender.name || "Unknown"} via ${receiver.bank || "PaymentPoint"}.`,
        bankAccountNum: receiver.account_number,
        bank: receiver.bank || sender.bank,
        pay_type: "credit",
        date_of_payment: webhookData.timestamp || new Date(),
        payment_ref: transaction_id,
        payment_status: "successful",
        metadata: webhookData,
      });

      await transactionHistory.save();
      console.log("PaymentPoint webhook processed successfully for:", userAccount.email);

      return {
        success: true,
        message: "Wallet credited successfully",
        data: transactionHistory,
      };
    } catch (error) {
      console.error("PaymentPoint webhook processing error:", error);
      throw error;
    }
  }

  /**
   * Get transaction history for a user
   * @param {string} businessId - User's business ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Object>} Transaction history
   */
  async getTransactionHistory(businessId, limit = 50) {
    try {
      const transactions = await paymentpointHistory
        .find({ business_id: businessId })
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return {
        success: true,
        transactions,
      };
    } catch (error) {
      console.error("Error fetching PaymentPoint transaction history:", error);
      throw error;
    }
  }

  /**
   * Admin function: Manually credit user wallet
   * @param {Object} params - Credit parameters
   * @param {string} params.business_id - User's business ID
   * @param {number} params.amount - Amount to credit
   * @param {string} params.reason - Reason for manual credit
   * @returns {Promise<Object>} Transaction record
   */
  async adminCreditWallet({ business_id, amount, reason = "Admin Credit" }) {
    try {
      const balance = await dataBalance.findOne({ business: business_id });
      const user = await Account.findOne({ _id: business_id });

      if (!balance) throw new Error("Balance record not found");
      if (!user) throw new Error("User not found");

      const oldBalance = balance.wallet_balance;

      await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          $inc: { wallet_balance: Number(amount) },
          last_purchase: new Date(),
        },
        { new: true }
      );

      const newBalance = oldBalance + Number(amount);

      const transactionHistory = new paymentpointHistory({
        business_name: user.username,
        business_id: business_id,
        amount: amount,
        resolvedAmount: amount,
        new_bal: String(newBalance),
        old_bal: oldBalance,
        purpose: "Funding - Admin (PaymentPoint)",
        desc: `Admin credit of ₦${amount}. Reason: ${reason}`,
        pay_type: "credit",
        date_of_payment: new Date(),
        payment_ref: `PP-ADMIN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        payment_status: "successful",
      });

      await transactionHistory.save();

      console.log(`Admin credited ₦${amount} to user ${user.username}`);

      return {
        success: true,
        message: "Wallet credited successfully",
        data: transactionHistory,
      };
    } catch (error) {
      console.error("Admin credit wallet error:", error);
      throw error;
    }
  }

  /**
   * Admin function: Manually debit user wallet
   * @param {Object} params - Debit parameters
   * @param {string} params.business_id - User's business ID
   * @param {number} params.amount - Amount to debit
   * @param {string} params.reason - Reason for manual debit
   * @returns {Promise<Object>} Transaction record
   */
  async adminDebitWallet({ business_id, amount, reason = "Admin Debit" }) {
    try {
      const balance = await dataBalance.findOne({ business: business_id });
      const user = await Account.findOne({ _id: business_id });

      if (!balance) throw new Error("Balance record not found");
      if (!user) throw new Error("User not found");

      const oldBalance = balance.wallet_balance;

      if (oldBalance < amount) {
        throw new Error("Insufficient balance for debit operation");
      }

      await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          $inc: { wallet_balance: -Number(amount) },
          last_purchase: new Date(),
        },
        { new: true }
      );

      const newBalance = oldBalance - Number(amount);

      const transactionHistory = new paymentpointHistory({
        business_name: user.username,
        business_id: business_id,
        amount: amount,
        resolvedAmount: amount,
        new_bal: String(newBalance),
        old_bal: oldBalance,
        purpose: "Debit - Admin (PaymentPoint)",
        desc: `Admin debit of ₦${amount}. Reason: ${reason}`,
        pay_type: "debit",
        date_of_payment: new Date(),
        payment_ref: `PP-ADMIN-DEBIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        payment_status: "successful",
      });

      await transactionHistory.save();

      console.log(`Admin debited ₦${amount} from user ${user.username}`);

      return {
        success: true,
        message: "Wallet debited successfully",
        data: transactionHistory,
      };
    } catch (error) {
      console.error("Admin debit wallet error:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (if PaymentPoint provides signature verification)
   * @param {Object} webhookData - Webhook payload
   * @param {string} signature - Signature from webhook headers
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(webhookData, signature) {
    try {
      const crypto = require("crypto");
      // PaymentPoint uses HMAC-SHA256 of the raw JSON payload with secret key
      const payload = JSON.stringify(webhookData);
      const hash = crypto
        .createHmac("sha256", this.secretKey)
        .update(payload)
        .digest("hex");

      console.log("Signature check - received:", signature, "calculated:", hash);
      return hash === signature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }
}

module.exports = new PaymentPointService();
