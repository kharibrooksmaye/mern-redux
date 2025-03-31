import express from "express";
import { Storage } from "@google-cloud/storage";
import TransloaditClient from "transloadit";
import { google } from "googleapis";
import { PubSub } from "@google-cloud/pubsub";
import Doc from "../models/documents.model";
import Record from "../models/records.model";

const router = express.Router();
const zephyr = new Storage({
  keyFilename: "./modules/Zephyr.json",
  projectId: "zephyrd",
});
const auth = new google.auth.GoogleAuth({
  keyFileName: "./modules/Zephyr.json",
  projectId: "zephyrd",
});
const compute = google.compute({ version: "v1", auth });
const pubSubClient = new PubSub({
  keyFileName: "./modules/Zephyr.json",
  projectId: "zephyrd",
});
const copyFile = async (userid, recordid) => {
  await zephyr
    .bucket("testinggggg")
    .file("uploadcomplete.txt")
    .copy(
      zephyr
        .bucket("zephyrinput")
        .file(`${userid}/${recordid}/uploadcomplete.txt`)
    );
};

const getFiles = async (userid, recordid) => {
  try {
    const results = await zephyr
      .bucket("zephyroutput")
      .getFiles({ prefix: `${userid}/${recordid}` });
    if (results.length > 0 && results.length === 1 && results[0].length === 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const publishMessage = async (data) => {
  console.log(data);
  const jsonString = JSON.stringify(data);
  console.log(jsonString);
  const dataBuffer = Buffer.from(jsonString);
  try {
    const messageId = await pubSubClient
      .topic("zephyr-topic")
      .publish(dataBuffer);
    console.log(`Message ${messageId} published`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
  }
};

// deleting records based on UserID
router.delete("/user/:id", async (req, res) => {
  console.log("deleting");
  console.log(req.params.id);
  try {
    await Record.find({ userid: req.params.id });
    await Doc.deleteMany({ user_id: req.params.id });
    const result = await Record.deleteMany({ userid: req.params.id });
    res.status(200).json({
      count: result.deletedCount,
      message: `record and docs in ${req.params.id} deleted`,
    });
  } catch (error) {
    res.status(res.statusCode).send(error);
  }
});

// delete all records
router.delete("/", async (req, res) => {
  console.log("deleting");
  try {
    await Record.deleteMany({});
    res.json("Documents deleted");
  } catch (err) {
    res.status(res.statusCode).send(err);
  }
});

// delete specific record and all documents associated with it
router.delete("/:id", async (req, res) => {
  console.log("deleting");
  try {
    await Record.findOne({ id: req.params.id });
    await Doc.deleteMany({ recordId: req.params.id });
    await Record.deleteOne({ id: req.params.id });
    res.json(`record and docs in ${req.params.id} deleted`);
  } catch (error) {
    res.status(res.statusCode).send(error);
  }
});
// get specific record
router.get("/:id", async (req, res) => {
  try {
    const record = await Record.findOne({ id: req.params.id });
    if (record) {
      res.status(200).send(record);
    } else {
      res.status(200).send(null);
    }
  } catch (err) {
    console.log(err);
    res.status(401).send(err);
  }
});

// create new record
router.post("/new", async (req, res) => {
  console.log(req.body);
  const newRecord = new Record({
    id: req.body.id,
    volume: req.body.volume,
    userid: req.body.userid,
    upload: true,
    uploaded: false,
    specimens: [],
  });
  try {
    const record = await newRecord.save();
    res.status(200).send(record);
  } catch (err) {
    console.log(err);
    res.status(400).send({ err: "Record ID cannot be empty." });
  }
});

// refresh record
router.post("/:id/refresh", async (req, res) => {
  const transloadit = new TransloaditClient({
    authKey: "2a9d686e51c34977b1dd8cf0834ae34f",
    authSecret: "649efab077b7f54ae93b0724145c543e8226e864",
  });
  const opts = {
    waitForCompletion: false,
    params: {
      auth: { key: "2a9d686e51c34977b1dd8cf0834ae34f" },
      template_id: "4c17d4ac32bb4482b8e0352511b00df6",
      fields: {
        user_id: req.body.user_id,
        record_id: req.body.record_id,
      },
    },
  };
  try {
    await transloadit.createAssembly(opts);
    console.log("running Assembly");
    console.log("assembly run");
    res
      .status(200)
      .json({ type: "success", message: "Analysis processing, please wait" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// router.post('/:id/check', async (req, res) => {
//   try {
//     const result = await getFiles(req.body.user_id, req.body.record_id);
//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//   }
// });

// resend hanging record to VM
router.post("/:id/republish", async (req, res) => {
  try {
    const task = {
      id: req.body.record_id,
      userid: req.body.user_id,
    };
    const newVMs = await compute.instances.list({
      project: "zephyrd",
      zone: "us-east4-c",
      maxResults: 500,
    });
    const data = newVMs.data.items;
    const running = data.filter((vm) => vm.status === "RUNNING");
    console.log(running.length);
    if (running && running.length < 5) {
      console.log(task);
      await publishMessage(task);
    }
    res.status(200).send("Uploaded Specimens");
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }
});
router.post("/tasktest", async (req, res) => {
  try {
    const task = {
      id: req.body.record_id,
      userid: req.body.user_id,
    };
    const newVMs = await compute.instances.list({
      project: "zephyrd",
      zone: "us-east4-c",
      maxResults: 500,
    });
    const data = newVMs.data.items;
    const running = data.filter((vm) => vm.status === "RUNNING");
    console.log(running.length);
    if (running && running.length < 5) {
      console.log(task);
      await publishMessage(task);
    }
    res.status(200).send("Test Tasks");
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }
});
// finish upload process and pass to VM
router.put("/:id/upload/finish", async (req, res) => {
  console.log(req.body);
  try {
    let record = await Record.findOne({ id: req.params.id });
    let length = record.specimens.length;
    let newRecord = await Record.findOneAndUpdate(
      { id: req.params.id },
      { $set: { specimensLength: length, uploaded: true } },
      { new: true }
    );
    await copyFile(newRecord.userid, newRecord.id);
    const task = {
      id: req.body.recordId,
      userid: req.body.userId,
      volume: record.volume,
      fields: length,
    };
    const newVMs = await compute.instances.list({
      project: "zephyrd",
      zone: "us-east4-c",
      maxResults: 500,
    });
    const data = newVMs.data.items;
    const running = data.filter((vm) => vm.status === "RUNNING");
    console.log(running.length);
    if (running && running.length < 5) {
      await publishMessage(task);
    }
    res.status(200).send("Uploaded Specimens");
  } catch (error) {
    console.log(error);
    res.status(401).send(error);
  }
});

// upload new records
router.put("/:id/upload", async (req, res) => {
  console.log("uploading specimen");
  const { user_id, encoded, thumb, info, recordId } = req.body;
  const newDoc = new Doc({
    user_id,
    encoded,
    info,
    thumb,
    recordId,
  });

  try {
    const doc = await newDoc.save();
    console.log(doc.id);
    const record = await Record.findOneAndUpdate(
      { id: req.params.id },
      { $push: { specimens: doc }, uploaded: true },
      { new: true }
    );
    res.status(200).send(record);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

export default router;
