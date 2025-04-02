import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const router = express.Router();

const hashRounds = 12;

router.get("/search/:id", async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ _id: req.body.id }, { id: req.body.id }],
    });
    res.json(user);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    res.json(user);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json("User deleted");
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json("User not found");
    }
    const { password } = user;
    const updateObj = req.body;
    if (req.body.password) {
      const hash = await bcrypt.hash(req.body.password, hashRounds);
      updateObj.password = hash;
    } else {
      updateObj.password = password;
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

export default router;
