import express from "express";
import { google } from "googleapis";
import TransloaditClient from "transloadit";

const router = express.Router();

const auth = new google.auth.GoogleAuth({
  projectId: "zephyrd",
  keyFileName: "./modules/Zephyr.json",
  scopes: ["https://www.googleapis.com/auth/compute"],
});
const transloadit = new TransloaditClient({
  authKey: process.env.TRANSLOADIT_KEY,
  authSecret: process.env.TRANSLOADIT_SECRET,
});
const compute = google.compute({ version: "v1", auth });
const taskqueue = google.cloudtasks({ version: "v2beta3", auth });
import User from "../models/user.model";
import Doc from "../models/documents.model";
import Record from "../models/records.model";
import * as cloudTasks from "@google-cloud/tasks";
const taskClient = new cloudTasks.v2beta3.CloudTasksClient({
  keyFileName: "./modules/Zephyr.json",
});

const parent = taskClient.queuePath(
  "zephyrd",
  "us-central1",
  "zephyr-queue-new"
);
console.log(parent);
const taskrequest = {
  name: parent,
  readMask: { paths: ["name", "stats"] },
};
const options = {
  waitForCompletion: true,
  params: {
    template_id: "4c17d4ac32bb4482b8e0352511b00df6",
    type: ["executing", "completed"],
  },
};

router.get("/event", async (req, res) => {
  try {
    let vmData = [];
    let assemData = [];
    const tasks = await taskqueue.projects.locations.queues.tasks.list({
      parent,
    });
    let tasksData = tasks.data;
    const newVMs = await compute.instances.list({
      project: "zephyrd",
      zone: "us-east1-c",
      maxResults: 500,
    });
    const runningVMs = newVMs.data.items.filter(
      (vm) => vm.status != "TERMINATED"
    );
    runningVMs.forEach((vm) => {
      let obj = {};
      obj.type = "vm";
      obj.id = vm.id;
      obj.name = vm.name;
      obj.status = vm.status;

      vmData.push(obj);
    });
    transloadit.listAssemblies(options, (err, status) => {
      let assemblyId = "";

      if (status) {
        const inProcess = status.items.filter(
          (assem) => assem.ok === "ASSEMBLY_EXECUTING"
        );
        inProcess.forEach((assem) => {
          let obj = {};
          obj.type = "assembly";
          obj.id = assem.id;
          obj.name = assem.name;
          obj.status = assem.status;
          assemData.push(obj);
        });
        if (status.assembly_id) {
          assemblyId = status.assembly_id;
        }
        // Low level errors (e.g. connection errors) are in err, Assembly errors are in status.error.
        // For this example, we don't discriminate and only care about erroring out:
        if (!err && status.error) {
          err = `${status.error}. ${status.message}. `;
        }
      }

      if (err) {
        console.error({ status });
        res.status(400).json("couldnt get data");
        throw new Error(`❌ Unable to process Assembly ${assemblyId}. ${err}`);
      }
    });
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    let data = {};
    data.vms = vmData;
    data.assem = assemData;
    data.tasks = tasksData;
    console.log(data);
    res.flushHeaders();
    let eventInterval = setInterval(async () => {
      if (
        data.vms.length > 0 ||
        data.assem.length > 0 ||
        Object.keys(data.tasks).length > 0
      ) {
        const output = `data: ${JSON.stringify(data)} \n\n`;
        res.write("event: message\n");
        res.write(output);
      }
    }, 10000);

    req.on("close", (err) => {
      clearInterval(eventInterval);
      res.end();
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/gce", async (req, res) => {
  try {
    const newVMs = await compute.instances.list({
      project: "zephyrd",
      zone: "us-east1-c",
      maxResults: 500,
    });
    const data = newVMs.data.items;

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await taskqueue.projects.locations.queues.tasks.list({
      parent,
    }).data;
    console.log(tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
  }
});
router.get("/transloadit", (req, res) => {
  transloadit.listAssemblies(options, (err, status) => {
    let assemblyId = "";

    if (status) {
      if (status.assembly_id) {
        assemblyId = status.assembly_id;
      }
      // Low level errors (e.g. connection errors) are in err, Assembly errors are in status.error.
      // For this example, we don't discriminate and only care about erroring out:
      if (!err && status.error) {
        err = `${status.error}. ${status.message}. `;
      }
    }

    if (err) {
      console.error({ status });
      res.status(400).json("couldnt get data");
      throw new Error(`❌ Unable to process Assembly ${assemblyId}. ${err}`);
    }

    res.status(200).json(status);
  });
});

//Get all records by a user ID
router.get("/records/:id", async (req, res) => {
  try {
    const records = await Record.find({ userid: req.params.id });
    res.json(records);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

//Get all records
router.get("/records", async (req, res) => {
  try {
    const count = await Record.countDocuments();
    const records = await Record.find();

    // .sort(sorting || { "charges.created": 1 })
    // .skip(itemsPerPage * page - itemsPerPage)
    // .limit(itemsPerPage)
    res.json({
      records,
      count,
      countPerPage: 20,
    });
  } catch (error) {
    res.status(res.statusCode).send(error);
  }
});
const pipeline = [
  {
    $addFields: { userId: { $toString: "$_id" } },
  },
  {
    $lookup: {
      from: "records",
      localField: "userId",
      foreignField: "userid",
      as: "count",
    },
  },
];

//Get users and document count per user
router.get("/users/", async (req, res) => {
  try {
    const users = await User.aggregate(pipeline);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/docs", async (req, res) => {
  try {
    const docs = await Doc.find();
    res.json(docs);
  } catch (err) {
    res.status(res.statusCode).send(err);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
});

export default router;
