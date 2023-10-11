const { Account } = require("../models/account");

exports.changeSubdealerToAgents = async (req, res) => {
  try {
    const users = await Account.find({
      type: "agent",
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await Account.findOneAndUpdate(
        { _id: user._id },
        { type: "agent" },
        { new: true }
      );
    }

    // console.log(users);

    return res.json("user successfully updated");
  } catch (error) {
    console.error(error); // Use console.error instead of console.log for errors
    return res.status(500).json({
      error: error.message,
    });
  }
};
