const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const Token = require("./token.model");
const Schema = mongoose.Schema;

const userSchema = new Schema(
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
      type: Array,
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
  let payload = {
    userId: this._id,
    token: crypto.randomBytes(20).toString("hex"),
  };

  return new Token(payload);
};
userSchema.plugin(uniqueValidator);
// userSchema.pre('save', async function (next) {
//     try {
//         if (!this.isModified('password')) {
//             return next();
//         }
//         const hashed = await bcrypt.hash(this.password, 10);
//         this.password = hashed;
//     } catch (err) {
//         return next(err);
//     }
// });

// userSchema.pre('findOneAndUpdate', async function (next) {
//     try {
//         if (this._update.password) {
//             const hashed = await bcrypt.hash(this._update.password, 10)
//             this._update.password = hashed;
//         }
//         next();
//     } catch (err) {
//         return next(err);
//     }
// });
const User = mongoose.model("User", userSchema);

module.exports = User;
