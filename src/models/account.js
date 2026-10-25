const Joi = require("joi");
const uuid = require("uuid");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const { create: createEmptyBalance } = require("../services/balance.service");
const plan = require("./plan");

const accountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    business_name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    access_token: {
      type: String,
      default: uuid.v4(),
      unique: true,
      index: true,
    },
    // Optional cap on how much (N) the account may spend from its wallet; null = no cap
    spend_limit: {
      type: Number,
      default: null,
    },
    spend_used: {
      type: Number,
      default: 0,
    },
    // Set when admin funds the account's GLO wallet: its GLO orders are then paid in GB only
    glo_wallet: {
      type: Boolean,
      default: false,
    },
    // GLO credit facility: GB given on credit, repaid in naira for the GB actually used
    glo_credit_rate: { type: Number, default: 383 }, // N per GB
    glo_credit_block_gb: { type: Number, default: 10000 }, // GB re-credited per block repaid
    glo_credit_allocated: { type: Number, default: 0 }, // total GLO wallet units ever credited (1000 = 1GB)
    glo_credit_repaid: { type: Number, default: 0 }, // total N repaid
    glo_credit_auto_blocks: { type: Number, default: 0 }, // legacy: blocks re-credited under the old full-block rule
    glo_credit_restored: { type: Number, default: 0 }, // GLO wallet units given back for repayments (1000 = 1GB)
    glo_alert_level: { type: Number, default: 0 }, // last low-balance email sent (50/80/90 % used), 0 = none
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
      default: null,
    },
    dealer: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["lite", "mega", "admin", "agent", "glo_dealer", "glo_agent"],
      default: "lite",
    },
    mobile_number: String,
    address: String,
    bvn: {
      type: String,
      default: null,
    },
    nin: {
      type: String,
      default: null,
    },

    bankAccounts: [
      {
        bankName: {
          type: String,
          default: null,
        },
        accountNumber: {
          type: String,
          default: null,
        },
        accountName: {
          type: String,
          default: null,
        },
      },
    ],

    // PaymentPoint virtual accounts
    paymentpointAccounts: [
      {
        bankName: {
          type: String,
          default: null,
        },
        accountNumber: {
          type: String,
          default: null,
        },
        accountName: {
          type: String,
          default: null,
        },
      },
    ],
    paymentpointAccountReference: {
      type: String,
      default: null,
    },

    glo_almamgt: String,

    whitelistStatus: {
      type: Boolean,
      default: false,
    },
    whitelistIP: {
      type: [String], // Change the type to an array of Strings
      default: [], // Set the default value as an empty array
    },

    plans: {
      type: [plan.schema],
      default: []
    },

    callback: {
      type: String,
      default: null,
    },
    webhook: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// automatically create an empty balance when a business Account is created
accountSchema.post("save", async function () {
  const businessId = this._id;
  await createEmptyBalance(businessId);
});

accountSchema.methods.addBankAccount = async function (bankInfo) {
  this.bankAccounts.push(bankInfo);
  await this.save();
};

accountSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin,
      type: this.type,
      bankAccounts: this.bankAccounts,
      confirmed: this.confirmed,
    },
    config.get("jwtSecret")
    // { expiresIn: "3m" }
  );
  // const token = jwt.sign(
  //   {
  //     _id: this._id,
  //     username: this.username,
  //     email: this.email,
  //     isAdmin: this.isAdmin,
  //     type: this.type,
  //     bankAccounts: this.bankAccounts,
  //     confirmed: this.confirmed,
  //   },
  //   config.get("jwtSecret"),
  //   { expiresIn: "30m" }
  // );

  // const refreshToken = jwt.sign(
  //   {
  //     _id: this._id,
  //     username: this.username,
  //     email: this.email,
  //     isAdmin: this.isAdmin,
  //     type: this.type,
  //     bankAccounts: this.bankAccounts,
  //     confirmed: this.confirmed,
  //   },
  //   config.get("jwtSecret"),
  //   { expiresIn: "1d" }
  // );
  return token;
};

const Account = mongoose.model("account", accountSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    business_name: Joi.string().min(3).max(50).optional().allow(''),
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(5).max(10).required(),
    password: Joi.string().min(5).max(255).required(),
    mobile_number: Joi.number().required(),
    address: Joi.string().optional().allow(''),
    bvn: Joi.string().trim().length(11).pattern(/^\d+$/).optional().allow('', null),
    nin: Joi.string().trim().length(11).pattern(/^\d+$/).optional().allow('', null),
  });

  return schema.validate(user);
};
module.exports = {
  Account,
  validateUser,
};
