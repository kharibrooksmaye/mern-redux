import mongoose, { Document, Schema } from "mongoose";
import crypto from "crypto";
import uniqueValidator from "mongoose-unique-validator";
import Token from "./token.model";
import { IUser } from "./types";
import Record from "./records.model";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      minlength: 5,
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    "2fa": {
      type: Boolean,
      required: true,
      default: true,
    },
    records: {
      type: [Record],
      required: false,
    },
    admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    authMethod: {
      type: String,
      default: "email",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateVerificationToken = function () {
  const payload = {
    userId: this._id,
    token: crypto.randomBytes(20).toString("hex"),
  };

  return new Token(payload);
};

userSchema.plugin(uniqueValidator);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
