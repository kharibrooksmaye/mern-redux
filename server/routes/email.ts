import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/user.model";

import {
  transporter,
  getPasswordResetURL,
  resetPasswordTemplate,
  createTokenFromHash,
} from "../helpers/emailFunctions";
import { IUser } from "../models/types";
import tokenModel from "../models/token.model";

const router = express.Router();

const emailURL =
  process.env.NODE_ENV === "production"
    ? "https://zephyr-analytics.com"
    : "http://localhost:3000";

router.post("/user/:email", async (req, res) => {
  const { email } = req.params;
  let user: IUser;
  try {
    user = await User.findOne({ email }).exec();
    const token = createTokenFromHash(user);
    const url = getPasswordResetURL(user, token);
    const emailTemplate = resetPasswordTemplate(user, url);
    const sendEmail = () => {
      try {
        const info = transporter.sendMail(emailTemplate);
        res.status(200).json(`Email sent successfully: ${info.response}`);
      } catch (error) {
        res.status(500).json(`Error sending email: ${error.message}`);
      }
    };
    sendEmail();
  } catch (error) {
    res.status(403).send("No user with this email");
  }
});

router.post("/activate", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    if (user) {
      const token = new tokenModel(user.generateVerificationToken());

      // Save the verification token
      await token.save();

      const subject = "Account Verification Token";
      const to = user.email;
      const from = process.env.ELOG;
      const link = `${emailURL}/activate/${to}/${token.token}`;
      const html = `<p>Hi ${
        user.username || user.email
      }</p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p><br><p>If you did not request this, please ignore this email.</p>`;

      const info = await transporter.sendMail({
        to,
        from,
        subject,
        html,
      });

      res.status(200).json({
        message: `A verification email has been sent to ${user.email}.`,
        info,
      });
    } else {
      res.status(404).json({
        error:
          "There is no account registered with that email address. Contact Zephyr Analytics at support@zephyr-analytics.com for assistance.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

router.post("/receive_new_password/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json("Invalid user");
    }

    const secret = `${user.password}-${user.createdAt}`;
    const payload = jwt.verify(token, secret) as JwtPayload;

    if (payload.id === user.id) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await User.findOneAndUpdate(
        { _id: userId },
        { password: hash },
        { new: true }
      );
      console.log("new password set");
      res.status(202).json("Password Change Accepted");
    } else {
      res.status(403).json("Invalid token");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
