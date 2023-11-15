const { Account } = require("../models/account");
const megaPrice = require("../models/megaPrice");

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

exports.updateDefaultMegaPrice = async (req, res) => {
  try {
    const allDocs = await megaPrice.find();

    const dataUpdate = {
      // "9mobile": 0,
      glo: 206,
      // airtel: 0,
      // mtn_gifting: 0,
      // mtn_sme: 0,
    };

    for (let i = 0; i < allDocs.length; i++) {
      const user = allDocs[i];
      await megaPrice.findOneAndUpdate({ _id: user._id }, dataUpdate, {
        new: true,
      });
    }

    // console.log(users);

    return res.json("megaprice successfully updated");
  } catch (error) {
    console.error(error); // Use console.error instead of console.log for errors
    return res.status(500).json({
      error: error.message,
    });
  }
};
