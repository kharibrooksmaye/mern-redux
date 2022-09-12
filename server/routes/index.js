const router = require("express").Router();
const bcrypt = require("bcrypt");
const https = require("https");
const jwt = require("jsonwebtoken");

const hashRounds = 12;
require("dotenv").config();
const formidable = require("formidable");

const accountSid = "AC2923901b9ff40e1a8c61e877972aa3ae";
const authToken = process.env.TWILIO_SECRET;
const twilioVerificationService = process.env.TWILIO_VERIFY;
const client = require("twilio")(accountSid, authToken);
const emailController = require("../modules/email.controller");
const User = require("../models/user.model");
const Token = require("../models/token.model");
const Record = require("../models/records.model");
const Doc = require("../models/documents.model");

const createTokenFromUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
});
const getBearerToken = (header, callback) => {
  if (header) {
    const token = header.split(" ");
    if (token) {
      return callback(null, token[0]);
    }
    return callback("Malformed bearer token", null);
  }
  return callback("Missing authorization header", null);
};

router.post("/transloadit", async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields) => {
    if (err) {
      res.status(500).json({ message: "error parsing" });
    }
    let assembly = {};

    try {
      assembly = JSON.parse(fields.transloadit);
    } catch (error) {
      res.status(500).json({ message: "Error Parsing Transloadit" }).end();
    }

    console.log(
      `--> ${assembly.ok || assembly.error} ${assembly.assembly_ssl_url}`
    );

    const { watermarked, filter, ipad_encoded } = assembly.results;

    const csv = "https://storage.cloud.google.com/testinggggg/csv.png";
    const pdf = "https://storage.cloud.google.com/testinggggg/pdf.png";

    const finalOutput = [];

    if (watermarked && filter && ipad_encoded) {
      watermarked.forEach(async (obj, i) => {
        const document = new Doc({
          name: obj.name,
          user_id: assembly.fields.user_id,
          recordId: assembly.fields.record_id,
          encoded: obj.ssl_url,
          info: obj,
          thumb: obj.ssl_url,
        });
        const savedDoc = await document.save();
        console.log(`watermarked - ${i}`);
        const docPushed = await Record.findOneAndUpdate(
          { id: assembly.fields.record_id },
          { $push: { output: savedDoc } },
          { new: true }
        );
        console.log(docPushed.output.length);
      });
      filter.forEach(async (obj, i) => {
        if (obj.ext === "csv" || obj.ext === "pdf") {
          const document = new Doc({
            name: obj.name,
            user_id: assembly.fields.user_id,
            recordId: assembly.fields.record_id,
            encoded: obj.ssl_url,
            info: obj,
            thumb: obj.ext === "csv" ? csv : pdf,
          });
          const savedDoc = await document.save();
          console.log(`filter - ${i}`);
          const docPushed = await Record.findOneAndUpdate(
            { id: assembly.fields.record_id },
            { $push: { output: savedDoc } },
            { new: true }
          );
          console.log(docPushed.output.length);
        }
      });
      ipad_encoded.forEach(async (obj, i) => {
        const document = new Doc({
          name: obj.name,
          user_id: assembly.fields.user_id,
          recordId: assembly.fields.record_id,
          encoded: obj.ssl_url,
          info: obj,
          thumb: `https://storage.googleapis.com/zephyroutput${obj.original_path}${obj.basename}.jpg`,
        });
        const savedDoc = await document.save();
        console.log(`ipad - ${i}`);
        const docPushed = await Record.findOneAndUpdate(
          { id: assembly.fields.record_id },
          { $push: { output: savedDoc } },
          { new: true }
        );
        console.log(docPushed.output.length);
      });

      console.log(finalOutput);
    }
  });

  res.status(200).json({ message: "received" }).end();
});

router.get("/verify", (req, res) => {
  const authContact =
    req.query.authMethod === "sms"
      ? `+1${req.query.authContact}`
      : req.query.authContact;
  const config = {
    rateLimits: { limitsmshits: authContact },
    to: authContact,
    channel: req.query.authMethod,
  };
  console.log(config);
  client.verify
    .services(twilioVerificationService)
    .verifications.create(config)
    .then((verification) => {
      console.log(verification);
      res.json(verification);
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.post("/checking", (req, res) => {
  console.log(req.query);
  const authContact =
    req.body.authMethod === "sms"
      ? `+1${req.body.authContact}`
      : req.body.authContact;
  const { code } = req.body;
  getBearerToken(req.headers.authorization, (error, token) => {
    if (token) {
      let decoded = "";
      try {
        decoded = jwt.verify(token, "testing out a secret");
      } catch (err) {
        console.log("error verifying", err);
      }
      client.verify
        .services(twilioVerificationService)
        .verificationChecks.create({ to: authContact, code })
        .then((verificationCheck) => {
          if (verificationCheck.valid) {
            decoded.authorized = true;
            User.findById(decoded.user)
              .then((user) => {
                const verifiedToken = jwt.sign(decoded, "testing out a secret");
                res.json({ user, verificationCheck, token: verifiedToken });
              })
              .catch(() => {
                console.log("no user found");
              });
          } else {
            console.log("incorrect but holding token");
            res.status(res.statusCode).send({
              success: false,
              message: "Invalid verification code",
            });
          }
        })
        .catch((err) => {
          console.log("holding user info");
          res.status(res.statusCode).send({
            err,
            message: "Invalid verification code",
          });
          console.log(err);
        });
    }
  });
});

router.post("/register", (req, res) => {
  const { username, password, email, firstName, lastName, age } = req.body;

  console.log(username, password, email);
  bcrypt.hash(password, hashRounds).then((hashedPassword) => {
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      age,
    });

    User.findOne({
      $or: [{ username }, { email }],
    })
      .then(async (user) => {
        console.log(user);
        if (user) {
          res.send({
            error:
              "A user already exists with these credentials. Please login or choose a different email address or username",
          });
        } else {
          try {
            const registeredUser = await newUser.save();
            const tokenUser = createTokenFromUser(registeredUser);
            const token = jwt.sign(
              { tokenUser, authorized: true },
              "testing out a secret",
              {
                expiresIn: 129600,
              }
            );
            console.log(token);
            console.log("working");
            res.send({
              err: null,
              token,
              "2fa": false,
            });
          } catch (err) {
            console.log(err);
            console.log("error 1");
            res.status(400).send(err);
          }
        }
      })
      .catch(() =>
        res.status(res.statusCode).send({ error: "Error, user already exists" })
      );
  });
});

router.post("/create", async (req, res) => {
  const { email, authMethod } = req.body;
  const newUser = await new User({ email, authMethod, admin: false });
  const existing = await User.findOne({ email });
  if (existing) {
    res.send({
      type: "error",
      message: `A user with the email address ${email} already exists`,
    });
  } else {
    try {
      await newUser.save();
      const result = await emailController.sendVerificationEmail(req, res);
      console.log(result);
    } catch (err) {
      console.log(err);
      console.log("error 1");
      res.status(400).send(err);
    }
  }
});
router.get("/download", (req, res) => {
  const url =
    "https://storage.cloud.google.com/zephyr-specimenuploads/Zephyr%20Questionnaire.pdf";
  https.get(url, (response) => {
    const chunks = [];
    response.on("data", (chunk) => {
      console.log("downloading");
      chunks.push(chunk);
    });
    response.on("end", () => {
      console.log("downloaded");
      const file = new Buffer.concat(chunks).toString("base64");
      console.log(file);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
      res.setHeader("content-type", "application/pdf");
      res.send(file);
    });
  });
  // const file = fs.createReadStream("../backend/public/questionnaire.pdf");
  // const stat = fs.statSync("../backend/public/questionnaire.pdf");
  // res.setHeader("Content-Length", stat.size);
  // res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("Content-Disposition", "attachment; filename=questionnaire.pdf");
  // file.pipe(res);
});

router.post("/checkpw", (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.status(200).json({
          err: "Username not found. Either register or try again ",
          valid: false,
        });
      } else {
        bcrypt.compare(password, user.password, (err, match) => {
          if (!match) {
            res.status(200).json({
              err: "User name or password is incorrect",
              valid: false,
            });
          } else {
            console.log("password true");
            res.json({
              err: null,
              valid: true,
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});
router.post("/token", async (req, res) => {
  const { token } = req.body;
  const newToken = await Token.findOne({ token });
  console.log(newToken);
  const user = await User.findOne({ _id: newToken.userId });
  res.status(200).json({ user });
});
router.get("/activate", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      res.status(401).json({
        message: `The email address ${email} is not associated with any account. Contact Zephyr Analytics for support.`,
      });
    if (!user.isActivated)
      res.status(200).json({
        type: "needs-activation",
        message: "Your account has not been activated.",
      });
  } catch (error) {
    console.log(error);
  }
});
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.status(403).send({
          err: "Username not found. Either register or try again ",
          token: null,
        });
      } else {
        bcrypt.compare(password, user.password, (err, match) => {
          if (!match) {
            res.status(403).send({
              err: "User name or password is incorrect",
              token: null,
            });
          } else {
            const token = jwt.sign(
              {
                user: user._id,
                authorized: true,
              },
              "testing out a secret",
              {
                expiresIn: 129600,
              }
            );
            console.log(user);
            res.json({
              user,
              token,
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send(err);
    });
});

router.get("/:id/profile", (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => {
      console.log(err);
      res.status(res.statusCode).send(err);
    });
});

router.get("/:id/records", async (req, res) => {
  Record.find({ userid: req.params.id })
    .then((records) => {
      res.json({
        records,
        count: records.length,
      });
    })
    .catch((err) => res.status(res.statusCode).send(err));
});

router.get("/:id/docs", (req, res) => {
  Doc.find({ user_id: req.params.id })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => res.status(res.statusCode).send(err));
});

module.exports = router;
