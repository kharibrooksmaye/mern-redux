import mongoose, { Document, Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IRecord } from "./types";

const recordSchema = new Schema<IRecord>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    upload: {
      type: Boolean,
      required: true,
    },
    specimens: {
      type: Array,
    },
    specimensLength: {
      type: Number,
    },
    uploaded: {
      type: Boolean,
      required: true,
    },
    userid: {
      type: String,
      required: true,
    },
    output: {
      type: Array,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

recordSchema.plugin(uniqueValidator);

const Record = mongoose.model<IRecord>("Record", recordSchema);

export default Record;
