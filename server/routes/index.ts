import express from "express";
import bcrypt from "bcrypt";
import https from "https";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import formidable from "formidable";
import twilio from "twilio";

import { sendVerificationEmail } from "../modules/email.controller";
import User from "../models/user.model";
import Token from "../models/token.model";
import Record from "../models/records.model";
import Doc from "../models/documents.model";
import { IRecord, IUser } from "../models/types";
import Transloadit, { Assembly } from "transloadit";
import {
  BitwardenClient,
  ClientSettings,
  DeviceType,
  LogLevel,
} from "@bitwarden/sdk-napi";
import { VerificationListInstanceCreateOptions } from "twilio/lib/rest/verify/v2/service/verification";

dotenv.config();

const router = express.Router();

const hashRounds = 12;
const accountSid = "AC2923901b9ff40e1a8c61e877972aa3ae";
const authToken = process.env.TWILIO_SECRET!;
const twilioVerificationService = process.env.TWILIO_VERIFY!;
const client = twilio(accountSid, authToken);

const clientSettings = {
  apiUrl: process.env.BW_API_URL,
  identityUrl: process.env.BW_IDENTITY_URL,
  userAgent: "Bitwarden SDK",
  deviceType: DeviceType.SDK,
};

const handleSecret = async () => {
  const bitwardenClient = new BitwardenClient(clientSettings);
  if (!process.env.BW_ACCESS_TOKEN) {
    throw new Error("No access token provided");
  }
  if (!process.env.JWT_SECRET_ID) {
    throw new Error("No secret id provided");
  }
  await bitwardenClient.auth().loginAccessToken(process.env.BW_ACCESS_TOKEN);

  const secret = await bitwardenClient.secrets().get(process.env.JWT_SECRET_ID);

  return secret.value;
};

const createTokenFromUser = (user: IUser) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
});
interface BearerTokenCallback {
  (error: string | null, token: string | null): void;
}

const getBearerToken = (
  header: string | undefined,
  callback: BearerTokenCallback
): void => {
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
    let assembly: Assembly = {} as Assembly;

    try {
      if (typeof fields.transloadit === "string") {
        assembly = JSON.parse(fields.transloadit);
      } else {
        throw new Error("Invalid transloadit field");
      }
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
        if (!docPushed) {
          throw new Error("Record not found");
        } else {
          console.log(docPushed.output?.length);
        }
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
          if (!docPushed) {
            throw new Error("Record not found");
          } else {
            console.log(docPushed.output?.length);
          }
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
        if (!docPushed) {
          throw new Error("Record not found");
        } else {
          console.log(docPushed.output?.length);
        }
      });

      console.log(finalOutput);
    }
  });

  res.status(200).json({ message: "received" }).end();
});

router.get("/verify", async (req, res) => {
  const authContact =
    req.query.authMethod === "sms"
      ? `+1${req.query.authContact}`
      : req.query.authContact;
  const config: VerificationListInstanceCreateOptions = {
    rateLimits: { limitsmshits: authContact },
    to: authContact as string,
    channel: req.query.authMethod as string,
  };
  try {
    const verification = await client.verify.v2
      .services(twilioVerificationService)
      .verifications.create(config);
    res.json(verification);
  } catch (err) {
    console.error(err);
    res.json(err.message);
  }
});

router.post("/checking", async (req, res) => {
  const authContact =
    req.body.authMethod === "sms"
      ? `+1${req.body.authContact}`
      : req.body.authContact;
  const { code } = req.body;
  getBearerToken(req.headers.authorization, async (error, token) => {
    if (token) {
      const secret = await handleSecret();
      try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        const verificationCheck = await client.verify.v2
          .services(twilioVerificationService)
          .verificationChecks.create({ to: authContact, code });

        if (verificationCheck.valid) {
          decoded.authorized = true;
          try {
            const user = await User.findById(decoded.user);
            const verifiedToken = jwt.sign(decoded, secret);
            res.json({ user, verificationCheck, token: verifiedToken });
          } catch (err) {
            console.error("no user found");
            res.status(404).send(err);
          }
        } else {
          console.error("incorrect but holding token");
          res.status(400).send({
            success: false,
            message: "Invalid verification code",
          });
        }
      } catch (err) {
        console.error("error verifying", err);
        res.status(403).send({
          err,
          message: "Invalid verification code",
        });
      }
    }
  });
});

router.post("/register", async (req, res) => {
  const { username, password, email, firstName, lastName, age } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, hashRounds);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      age,
    });
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      console.error("user already exists");
      res.status(400).send({
        error:
          "A user already exists with these credentials. Please login or choose a different email address or username",
      });
    } else {
      const secret = await handleSecret();
      const registeredUser = await newUser.save();
      const tokenUser = createTokenFromUser(registeredUser);
      const token = jwt.sign({ tokenUser, authorized: true }, secret, {
        expiresIn: 129600,
      });
      res.send({
        err: null,
        token,
        userCreated: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(res.statusCode).send({ error: "Error, user already exists" });
  }
});

router.post("/create", async (req, res) => {
  const { email, authMethod } = req.body;
  const newUser = new User({ email, authMethod, admin: false });
  const existing = await User.findOne({ email });
  if (existing) {
    res.send({
      type: "error",
      message: `A user with the email address ${email} already exists`,
    });
  } else {
    try {
      await newUser.save();
      const result = await sendVerificationEmail(req, res);
      console.log(result);
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  }
});
router.get("/download", (req, res) => {
  const url =
    "https://storage.cloud.google.com/zephyr-specimenuploads/Zephyr%20Questionnaire.pdf";
  https.get(url, (response) => {
    const chunks: Buffer[] = [];
    response.on("data", (chunk) => {
      console.log("downloading");
      chunks.push(chunk);
    });
    response.on("end", () => {
      console.log("downloaded");
      const file = Buffer.concat(chunks).toString("base64");
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

router.post("/checkpw", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(200).json({
        err: "Username not found. Either register or try again ",
        valid: false,
      });
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(200).json({
          err: "User name or password is incorrect",
          valid: false,
        });
      }
      res.json({
        err: null,
        valid: true,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(403).send(err);
  }
});
router.post("/token", async (req, res) => {
  const { token } = req.body;
  const newToken = await Token.findOne({ token });
  const user = await User.findOne({ _id: newToken?.userId });
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
    if (!user?.isActivated)
      res.status(200).json({
        type: "needs-activation",
        message: "Your account has not been activated.",
      });
  } catch (error) {
    console.error(error);
  }
});
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      throw new Error("User not found");
    } else {
      bcrypt.compare(password, user.password, (err, match) => {
        if (!match) {
          console.log("no match");
          throw new Error("Password does not match");
        }
      });
      const secret = await handleSecret();
      const authToken = jwt.sign(
        {
          user: user._id,
          authorized: true,
        },
        secret,
        {
          expiresIn: "7d",
        }
      );
      res.cookie("authToken", authToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.json({
        user,
        authToken,
      });
    }
  } catch (error) {
    console.error("error logging in", error);
    res.status(403).send({
      message: "Error logging in",
      error,
      token: null,
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({
    message: "logged out",
  });
});

router.get("/authenticated", async (req, res) => {
  const cookies = req.headers.cookie;
  const authCookie = cookies
    ?.split(";")
    .find((c) => c.trim().startsWith("authToken="));
  const authToken = authCookie?.replace("authToken=", "") || null;
  const secret = await handleSecret();
  if (authToken) {
    try {
      const decodedToken = jwt.verify(authToken, secret) as JwtPayload;
      const user = await User.findById(decodedToken.user);
      res.json({ user });
    } catch (error) {
      console.error("error verifying token", error);
      res.clearCookie("authToken");
      res.status(403).send({
        err: "Invalid token",
      });
    }
  } else {
    res.status(403).send({
      err: "No token provided",
    });
  }
});
router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(res.statusCode).send(err);
  }
});

router.get("/:id/records", async (req, res) => {
  try {
    const records = await Record.find({ userid: req.params.id });
    res.json({
      records,
      count: records.length,
    });
  } catch (err) {
    console.error(err);
    res.status(res.statusCode).send(err);
  }
});

router.get("/:id/docs", async (req, res) => {
  try {
    const docs = await Doc.find({ user_id: req.params.id });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(res.statusCode).send(err);
  }
});

export default router;
