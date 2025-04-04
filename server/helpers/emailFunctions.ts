import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { IUser } from "../models/types";
const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 80,
  requireTLS: true,
  secure: false,
  auth: {
    user: process.env.ELOG,
    pass: process.env.EPAS,
  },
});

const emailURL =
  process.env.NODE_ENV === "production"
    ? "https://zephyr-analytics.com"
    : "http://localhost:3000";

interface User {
  _id: ObjectId;
  email: string;
  firstName?: string;
  password: string;
}

const getPasswordResetURL = (user: Partial<IUser>, token: string): string =>
  `${emailURL}/updatepw/${user._id}/${token}`;

const resetPasswordTemplate = (user, url) => {
  const from = process.env.ELOG;
  const to = user.email;
  const subject = "Zephyr Analytics, LLC Password Reset";
  const html = `
    <p>Hey ${user.firstName || user.email},</p>
    <p>We heard that you lost your Zephyr password. Sorry about that!</p>
    <p>But don’t worry! You can use the following link to reset your password:</p>
    <a href=${url}>${url}</a>
    <p>If you don’t use this link within 1 hour, it will expire.</p>
    <p>–Zephyr Diagnostics</p>
    `;
  return {
    from,
    to,
    subject,
    html,
  };
};

const createTokenFromHash = (user: Partial<IUser>): string => {
  const userId = user._id;
  const timestamp = Date.now();
  const secret = `${user.password}-${timestamp}`;
  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: 3600,
  });
  return token;
};

export {
  transporter,
  getPasswordResetURL,
  resetPasswordTemplate,
  createTokenFromHash,
};
