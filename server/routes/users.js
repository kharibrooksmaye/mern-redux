const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const hashRounds = 12;
router.get("/search/:id", (req, res) => {
  User.findOne({
    $or: [{ _id: req.body.id }, { id: req.body.id }],
  })
    .then((user) => {
      console.log();
      res.json(user);
    })
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json("User deleted"))
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

router.put("/:id", async (req, res) => {
  try {
    const updateObj = req.body;
    console.log(updateObj);
    if (req.body.password) {
      updateObj.password = await bcrypt.hash(req.body.password, hashRounds);
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateObj },
      { new: true }
    );
    res.json({
      err: null,
      user: updatedUser,
      message: "user updated",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(`User Update Error: ${error}`);
  }
});

module.exports = router;
