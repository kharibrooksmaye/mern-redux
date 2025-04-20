import express from "express";
import { Storage } from "@google-cloud/storage";
import TransloaditClient from "transloadit";
import { google } from "googleapis";
import { PubSub } from "@google-cloud/pubsub";
import Doc from "../models/documents.model";
import Record from "../models/records.model";

const router = express.Router();
const mernReduxStorage = new Storage({
  keyFilename: "./modules/mernRedux.json",
  projectId: "mern-redux-361607",
});
const auth = new google.auth.GoogleAuth({
  keyFilename: "./modules/mernRedux.json",
  projectId: "mern-redux-361607",
});
const compute = google.compute({ version: "v1", auth });
const pubSubClient = new PubSub({
  keyFilename: "./modules/mernRedux.json",
  projectId: "mern-redux-361607",
});
const copyFile = async (userid: string, recordid: string) => {
  try {
    const data = await mernReduxStorage
      .bucket("mern_redux_test_bucket")
      .file("uploadcomplete.txt")
      .copy(
        mernReduxStorage
          .bucket("mern_redux_input")
          .file(`${userid}/${recordid}/uploadcomplete.txt`)
      );
    console.log("File copied successfully");
    return data;
  } catch (error) {
    console.log(error);
  }
};

const getFiles = async (userid: string, recordid: string) => {
  try {
    const results = await mernReduxStorage
      .bucket("mern_redux_output")
      .getFiles({ prefix: `${userid}/${recordid}` });
    if (results.length > 0 && results[0].length === 0) {
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
      .publishMessage({ data: dataBuffer });
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

// get all records
router.get("/", async (req, res) => {
  try {
    const records = await Record.find({});
    if (records) {
      res.status(200).send(records);
    } else {
      res.status(200).send(null);
    }
  } catch (err) {
    console.log(err);
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
  const { id, volume, userid } = req.body;
  const newRecord = new Record({
    id,
    userid,
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
  const { user_id, record_id } = req.body;
  const transloadit = new TransloaditClient({
    authKey: process.env.TRANSLOADIT_REFRESH_KEY,
    authSecret: process.env.TRANSLOADIT_REFRESH_SECRET,
  });
  const opts = {
    waitForCompletion: false,
    params: {
      auth: { key: process.env.TRANSLOADIT_REFRESH_KEY },
      template_id: process.env.TRANSLOADIT_TEMPLATE_ID,
      fields: {
        user_id,
        record_id,
      },
    },
  };
  try {
    await transloadit.createAssembly(opts);
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
      project: "mern-redux-361607",
      zone: "us-east4-c",
      maxResults: 500,
    });
    const data = newVMs.data.items;
    const running = data.filter((vm) => vm.status === "RUNNING");
    if (running && running.length < 5) {
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
      project: "mern-redux-361607",
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
  try {
    let record = await Record.findOne({ id: req.params.id });
    if (!record) {
      res.status(404).send("Record not found");
    }
    let length = record.specimens.length;
    let newRecord = await Record.findOneAndUpdate(
      { id: req.params.id },
      { $set: { specimensLength: length, uploaded: true } },
      { new: true }
    );
    const data = await copyFile(newRecord.userid, newRecord.id);

    // const task = {
    //   id: req.body.recordId,
    //   userid: req.body.userId,
    //   volume: record.volume,
    //   fields: length,
    // };
    // const newVMs = await compute.instances.list({
    //   project: "mern-redux-361607",
    //   zone: "us-east4-c",
    //   maxResults: 500,
    // });
    // const data = newVMs.data.items;
    // const running = data.filter((vm) => vm.status === "RUNNING");
    // console.log(running.length);
    // if (running && running.length < 5) {
    //   await publishMessage(task);
    // }
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
