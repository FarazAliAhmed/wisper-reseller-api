const { Account } = require("../models/account");
var postmark = require("postmark");
const bcrypt = require("bcrypt");
const dataBalance = require("../models/dataBalance");
const megaPurchaseHistory = require("../models/megaPurchaseHistory");
const agentHistory = require("../models/agentHistory");
const { sendEmail } = require("../utils/email/transporter");
const transactionHistory = require("../models/transactionHistory");
const uuid = require("uuid");
const client = new postmark.ServerClient(process.env.POSTMARK);

class AgentService {
  async createAgent({
    business,
    fullName,
    email,
    username,
    phoneNumber,
    agent_business_name,
  }) {
    const tempPassword = await generateTemporaryPassword();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(tempPassword, salt);

    let access_token;
    let isUnique = false;

    // Generate a unique access_token
    while (!isUnique) {
      access_token = uuid.v4();

      // Check if the generated access_token is unique in the database
      const existingAccount = await Account.findOne({ access_token });

      if (!existingAccount) {
        isUnique = true;
      }
    }

    const agent = new Account({
      name: fullName,
      business_name: agent_business_name || null,
      email,
      username,
      dealer: business,
      mobile_number: phoneNumber,
      password,
      type: "agent",
      access_token, // Set the access_token here
    });
    await agent.save();

    const Subject = "Welcome to the Wisper Dealer Network!";
    const TextBody =
      `Dear ${agent.name},\n\n` +
      `Welcome to the Wisper Dealer Network! We're thrilled to have you on board as an agent with Wisper NG. Your account is now ready, and you can start accessing our platform right away.\n\n` +
      `Here are your login details:\n\n` +
      `Username: ${agent.username}\n` +
      `Email: ${agent.email}\n` +
      `Password: ${tempPassword}\n\n` +
      `Please Note: We recommend changing your password after your first login for security reasons.`;

    await sendEmail(agent.email, Subject, TextBody);

    return agent;
  }

  async generateTemporaryPassword() {
    const length = 10;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tempPassword = "";
    for (let i = 0; i < length; i++) {
      tempPassword += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return tempPassword;
  }

  async getAgentsByBusiness(businessId) {
    try {
      // Implement logic to fetch agents related to the provided businessId from the database
      const agents = await Account.find({ dealer: businessId }).sort({
        createdAt: -1,
      });
      return agents;
    } catch (error) {
      throw new Error("Failed to fetch agents");
    }
  }

  async getAgentsByTrx(businessId) {
    try {
      // Implement logic to fetch agents related to the provided businessId from the database
      const agents = await Account.find({ dealer: businessId }).sort({
        createdAt: -1,
      });

      // Create an array to store the transactions
      const transactions = [];

      // Loop through each agent and find transactions that match the business_id
      for (const agent of agents) {
        const agentId = agent._id;

        // Find transactions that match the business_id and agent's _id
        const agentTransactions = await transactionHistory.find({
          business_id: businessId,
          admin_ref: agentId, // Assuming admin_ref corresponds to agent._id
        });

        // Add the found transactions to the transactions array
        transactions.push(...agentTransactions);
      }

      return transactions;
    } catch (error) {
      throw new Error("Failed to fetch agents");
    }
  }

  async getAgentsAdmin() {
    try {
      const agents = await Account.find({ type: "agent" }).sort({
        createdAt: -1,
      });
      return agents;
    } catch (error) {
      throw new Error("Failed to fetch agents");
    }
  }

  async purchaseAgentMegaData(dealer, business_id, network, amountInGB) {
    try {
      const userBalance = await dataBalance.findOne({ business: dealer });
      if (!userBalance) {
        throw new Error("User data balance not found");
      }

      const dealerBalance = await dataBalance.findOne({
        business: business_id,
      });

      if (!dealerBalance) {
        throw new Error("User data balance not found");
      }

      const ownerMegaWallet = { ...userBalance.mega_wallet };

      const owner_old = ownerMegaWallet[network];

      if (Number(owner_old) < Number(amountInGB * 1000)) {
        throw new Error("Not enough balance");
      }

      const agentMegaWallet = { ...dealerBalance.mega_wallet };
      const agent_old = agentMegaWallet[network];

      ownerMegaWallet[network] -= Number(amountInGB) * 1000;
      agentMegaWallet[network] += Number(amountInGB) * 1000;

      const updatedOwnerBalance = await dataBalance.findOneAndUpdate(
        { business: dealer },
        {
          mega_wallet: ownerMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const updatedAgentBalance = await dataBalance.findOneAndUpdate(
        { business: business_id },
        {
          mega_wallet: agentMegaWallet,
          last_purchase: new Date(),
        },
        { new: true }
      );

      const deaAcct = await Account.findOne({ _id: dealer });
      const subAcct = await Account.findOne({ _id: business_id });

      const ownerPurchase = new megaPurchaseHistory({
        business_id: dealer,
        username: deaAcct.username,
        amount: 0,
        channel: "Wallet",
        volume: amountInGB * -1,
        old_bal: owner_old,
        new_bal: ownerMegaWallet[network],
        network: network,
        status: "success",
      });

      const agentPurchase = new agentHistory({
        business_id: business_id,
        username: subAcct.username,
        dealer: dealer,
        amount: 0,
        volume: amountInGB,
        channel: "Dealer",
        old_bal: agent_old,
        new_bal: agentMegaWallet[network],
        network: network,
        status: "success",
      });

      await ownerPurchase.save();
      await agentPurchase.save();

      return updatedAgentBalance;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AgentService();
