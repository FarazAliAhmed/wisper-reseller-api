const bucketID = require("../models/bucketID");

const updateBucketID = async (req, res) => {
  const { id } = req.body;

  try {
    const bucketId = await bucketID.findByIdAndUpdate(
      id,
      { inUse: req.body.inUse },
      { new: true }
    );

    if (!bucketId) {
      return res.status(404).json({ message: "Bucket ID not found" });
    }

    return res.json(bucketId);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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

module.exports = {
  updateBucketID,
  getBucketID,
};
