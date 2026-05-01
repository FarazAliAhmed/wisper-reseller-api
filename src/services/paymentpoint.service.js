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
      const PAYMENTPOINT_BUSINESS_ID = "71e885f182ed5ea4454ef5e1d7e9a2ec40d1b36";
      
      const payload = {
        email: customerEmail,
        name: customerName,
        phoneNumber: user.phone || user.phoneNumber || "07000000000", // Use default if not available
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
   * @param {string} accountReference - Account reference to query
   * @returns {Promise<Object|null>} Account details or null if not found
   */
  async getAccountDetails(accountReference) {
    try {
      const response = await axios.get(
        this.getApiUrl(`/v1/virtual-accounts/${accountReference}`),
        { headers: this.getHeaders() }
      );

      return response.data.data || response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null; // Account doesn't exist
      }

      console.error("PaymentPoint getAccountDetails error:", error?.response?.data);
      throw error;
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
      console.log("Processing PaymentPoint webhook:", webhookData);

      // Extract payment details from webhook
      const {
        transaction_reference,
        account_reference,
        amount,
        customer_name,
        customer_email,
        payment_date,
        status,
        bank_name,
        account_number,
      } = webhookData;

      // Validate webhook data
      if (!transaction_reference || !account_reference || !amount) {
        throw new Error("Invalid webhook data: missing required fields");
      }

      // Check if transaction already processed
      const existingTransaction = await paymentpointHistory.findOne({
        payment_ref: transaction_reference,
      });

      if (existingTransaction) {
        console.log("Transaction already processed:", transaction_reference);
        return {
          success: true,
          message: "Transaction already processed",
        };
      }

      // Only process successful payments
      if (status !== "successful" && status !== "success") {
        console.log("Payment not successful, skipping:", status);
        return {
          success: false,
          message: `Payment status is ${status}, not processing`,
        };
      }

      // Find user's balance record
      const balance = await dataBalance.findOne({
        business: account_reference,
      });

      if (!balance) {
        throw new Error(`Balance record not found for account: ${account_reference}`);
      }

      // Calculate amount to credit (deduct ₦50 processing fee)
      const processingFee = 50;
      const amountToCredit = Number(amount) > processingFee 
        ? Number(amount) - processingFee 
        : 0;

      const oldBalance = balance.wallet_balance;

      // Credit user's wallet
      if (amountToCredit > 0) {
        await dataBalance.findOneAndUpdate(
          { business: account_reference },
          {
            $inc: { wallet_balance: amountToCredit },
            last_purchase: new Date(),
          },
          { new: true }
        );

        console.log(`Credited ${amountToCredit} to account ${account_reference}`);
      }

      const newBalance = oldBalance + amountToCredit;

      // Create transaction history record
      const transactionHistory = new paymentpointHistory({
        business_name: customer_name,
        business_id: account_reference,
        amount: amountToCredit,
        resolvedAmount: amountToCredit,
        new_bal: String(newBalance),
        old_bal: oldBalance,
        purpose: "Funding - PaymentPoint",
        desc: `Deposit of ₦${amountToCredit} made by ${customer_name} via PaymentPoint.`,
        bankAccountNum: account_number,
        bank: bank_name,
        pay_type: "credit",
        date_of_payment: payment_date || new Date(),
        payment_ref: transaction_reference,
        payment_status: "successful",
        metadata: webhookData,
      });

      await transactionHistory.save();

      console.log("PaymentPoint webhook processed successfully");

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
    // Implement signature verification based on PaymentPoint documentation
    // This is a placeholder - update when PaymentPoint provides signature method
    try {
      const crypto = require("crypto");
      const payload = JSON.stringify(webhookData);
      const hash = crypto
        .createHmac("sha512", this.secretKey)
        .update(payload)
        .digest("hex");

      return hash === signature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }
}

module.exports = new PaymentPointService();
