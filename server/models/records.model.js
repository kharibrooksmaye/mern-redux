const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const recordSchema = new Schema(
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
  },
);
recordSchema.plugin(uniqueValidator);
const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
