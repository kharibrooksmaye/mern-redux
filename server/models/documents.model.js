const mongoose = require('mongoose');

const { Schema } = mongoose;

const docSchema = new Schema(
  {
    user_id: { type: String, required: true },
    encoded: { type: String, required: true },
    thumb: { type: String, required: true },
    recordId: { type: String, required: true },
    info: { type: Object, required: true },
  },
  {
    timestamps: true,
  },
);

const Doc = mongoose.model('Doc', docSchema);

module.exports = Doc;
