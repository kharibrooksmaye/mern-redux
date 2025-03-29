import mongoose, { Document, Schema } from "mongoose";
import { IDoc } from "./types";

const docSchema = new Schema<IDoc>(
  {
    user_id: { type: String, required: true },
    encoded: { type: String, required: true },
    thumb: { type: String, required: true },
    recordId: { type: String, required: true },
    info: { type: Object, required: true },
  },
  {
    timestamps: true,
  }
);

const Doc = mongoose.model<IDoc>("Doc", docSchema);

export default Doc;
