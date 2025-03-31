import express from "express";
import { google } from "googleapis";
import TransloaditClient from "transloadit";

const router = express.Router();

interface NetworkResourceObject {
  id: string;
  name: string;
  status: string;
  type: string;
}

interface AdminData {
  vms: NetworkResourceObject[];
  assem: NetworkResourceObject[];
  tasks: any;
}
const auth = new google.auth.GoogleAuth({
  projectId: "zephyrd",
  keyFilename: "./modules/Zephyr.json",
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
    runningVMs.forEach(({ id, name, status }) => {
      let obj: NetworkResourceObject = {
        type: "vm",
        id,
        name,
        status,
      };
      vmData.push(obj);
    });

    const assemblies = await transloadit.listAssemblies(options);
    if (assemblies) {
      const inProcess = assemblies.items.filter(
        (assem) => assem.ok === "ASSEMBLY_EXECUTING"
      );
      inProcess.forEach((assem) => {
        const obj: NetworkResourceObject = {
          type: "assembly",
          id: assem.id,
          status: assem.ok,
          name: assem.instance,
        };
        assemData.push(obj);
      });
    } else {
      console.error({ assemblies });
      res.status(400).json("couldnt get data");
      throw new Error(`❌ Unable to process Assemblies`);
    }
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    const data: AdminData = {
      vms: vmData,
      assem: assemData,
      tasks: tasksData,
    };
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
    });
    console.log(tasks);
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
  }
});
router.get("/transloadit", async (req, res) => {
  const assemblies = await transloadit.listAssemblies(options);
  if (assemblies) {
    const inProcess = assemblies.items.filter(
      (assem) => assem.ok === "ASSEMBLY_EXECUTING"
    );
    inProcess.forEach((assem) => {
      const obj: NetworkResourceObject = {
        type: "assembly",
        id: assem.id,
        status: assem.ok,
        name: assem.instance,
      };
    });
  } else {
    console.error({ assemblies });
    res.status(400).json("couldnt get data");
    throw new Error(`❌ Unable to process Assemblies`);
  }
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
