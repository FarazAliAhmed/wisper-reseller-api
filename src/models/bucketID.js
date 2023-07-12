const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bucketIdSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  bucketID: {
    type: Number,
    required: true,
  },
  inUse: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("BucketId", bucketIdSchema);
