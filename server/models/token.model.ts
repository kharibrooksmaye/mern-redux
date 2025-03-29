import mongoose, { Document, Schema } from "mongoose";
import { IToken } from "./types";

const tokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 43200,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IToken>("Tokens", tokenSchema);
