import express from "express";
import { compute_v1, google } from "googleapis";
import { PubSub, Message } from "@google-cloud/pubsub";
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
const transloadit = new TransloaditClient({
  authKey: process.env.TRANSLOADIT_KEY,
  authSecret: process.env.TRANSLOADIT_SECRET,
});
const compute = google.compute({ version: "v1" });

const pubSubClient = new PubSub();

const auth = new google.auth.GoogleAuth();

const vms = async () => {
  const project = await auth.getProjectId();
  const authClient = await auth.getClient();
  const newVMs = await compute.instances.list({
    project,
    auth: authClient,
    zone: "us-central1-c",
    maxResults: 500,
  });

  return newVMs.data.items;
};
const taskqueue = google.cloudtasks({ version: "v2beta3" });
import User from "../models/user.model";
import Doc from "../models/documents.model";
import Record from "../models/records.model";
import * as cloudTasks from "@google-cloud/tasks";

const tasks = async () => {
  const project = await auth.getProjectId();
  const authClient = await auth.getClient();
  const tasks = await taskqueue.projects.locations.queues.tasks.list({
    parent: `projects/${project}/locations/us-central1/queues/mern-redux-queue-new`,
    auth: authClient,
  });
  return tasks.data;
};
const taskClient = new cloudTasks.v2beta3.CloudTasksClient();

const parent = taskClient.queuePath(
  "mern-redux-361607",
  "us-central1",
  "mern-redux-queue-new"
);
console.log(parent);
const taskrequest = {
  name: parent,
  readMask: { paths: ["name", "stats"] },
};
const options = {
  waitForCompletion: true,
  params: {
    template_id: process.env.TRANSLOADIT_TEMPLATE_ID,
    type: ["executing", "completed"],
    keywords: ["fields"],
  },
};

router.get("/messages", async (req, res) => {
  try {
    const subscription = await pubSubClient.subscription(
      "mern-redux-topic-sub"
    );

    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    let messageCount = 0;
    const messageHandler = (message: Message) => {
      messageCount++;
      res.write("event: message\n");
      res.write(`data: ${message.data.toString()} \n\n`);
      res.write(`attributes: ${JSON.stringify(message.attributes)} \n\n`);
      console.log(`Received message: ${message.id}`);
      console.log(`Data: ${message.data}`);
      console.log(`Attributes: ${message.attributes}`);
      message.ack();
    };
    subscription.on("message", messageHandler);
    setTimeout(() => {
      subscription.close();
      console.log("Subscription closed");
      console.log(`Received ${messageCount} messages`);
    }, 10000);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
router.get("/event", async (req, res) => {
  try {
    const tasksData = await tasks();
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    const data = {
      tasks: tasksData,
    };
    console.log(data, "thisis the data");
    res.flushHeaders();
    let eventInterval = setInterval(async () => {
      if (Object.keys(data.tasks).length > 0) {
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
    const data = await vms();

    res.status(200).json(data as compute_v1.Schema$Instance[]);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: error.message });
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
    res.status(200).json(assemblies);
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
