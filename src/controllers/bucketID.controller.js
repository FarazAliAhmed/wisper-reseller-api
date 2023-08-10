const bucketID = require("../models/bucketID");
const { TermiiService } = require("../services/termii.service");

const getAllBucketID = async (req, res) => {
  try {
    const buckets = await bucketID.find();

    return res.json({ buckets });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving buckets" });
  }
};

const addBucketID = async (req, res) => {
  const bucketId = new bucketID({
    name: req.body.name,
    bucketID: req.body.bucketID,
  });

  try {
    const newBucketId = await bucketId.save();
    res.status(201).json(newBucketId);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateBucketID = async (req, res) => {
  try {
    const bucketId = await bucketID.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(bucketId);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteBucketID = async (req, res) => {
  try {
    await bucketID.findByIdAndRemove(req.params.id);
    res.json({ message: "Bucket ID deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const bucketIDPositionOne = async (req, res) => {
  try {
    const bucketId = await bucketID.findOne({ inUse: true, position: 1 });
    res.json(bucketId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get an array of bucket IDs that are in use
const getBucketID = async (req, res) => {
  try {
    const bucketIds = await bucketID.find({ inUse: true });

    return res.json(bucketIds);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const bucketIDSwitchOne = async (req, res) => {
  try {
    // Find the first bucket ID with inUse as true
    const firstBucketId = await bucketID.findOne({ inUse: true });

    if (!firstBucketId) {
      return res.status(404).json({ message: "No bucket IDs in use" });
    }

    // Turn off the inUse flag for the first bucket ID
    firstBucketId.inUse = false;
    await firstBucketId.save();

    // Find the new first bucket ID with inUse as true
    const newFirstBucketId = await bucketID.findOne({ inUse: true });

    res.json(newFirstBucketId.bucketID);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bucketIDOne = async (req, res) => {
  try {
    const bucketId = await bucketID.findOne({ inUse: true });
    // const smsRes = await TermiiService.sendNumberAPI(req.body.to, req.body.sms);

    // if (smsRes.error) {
    //   return res.status(500).json({ message: smsRes.message });
    // }

    res.json(bucketId.bucketID);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateBucketID,
  getBucketID,
  getAllBucketID,
  addBucketID,
  deleteBucketID,
  bucketIDOne,
  bucketIDPositionOne,
  bucketIDSwitchOne,
};
