const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserPlan = new Schema(
  {
    business: {
      type: String,
      required: true,
    },
    plan_id: {
      type: Number,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    plan_type: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    selling_price: {
      type: Number,
      default: null,
    },
    volume: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["mb", "gb", "tb"],
      required: true,
    },
    validity: {
      type: String,
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

UserPlan.virtual("size")
  .get(function () {
    return this.volume + " " + this.unit;
  })
  .set(function (size) {
    const unit = size.substr(-2);
    const volume = size.split(unit)[0].trim();
    this.set({ unit, volume });
  });

module.exports = mongoose.model("userPlan", UserPlan);
