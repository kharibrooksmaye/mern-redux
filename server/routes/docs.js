import express from "express";
import { Storage } from "@google-cloud/storage";
import Doc from "../models/documents.model.ts";

const router = express.Router();

const zephyr = new Storage({
  keyFileName: "./modules/Zephyr.json",
  projectId: "zephyrwebsite-272000",
});
const bucket = zephyr.bucket("zephyroutput");

// router.route('/').get((req, res) => {
//   Doc.find()
//     .then((docs) => {
//       res.json(docs);
//     })
//     .catch((err) => res.status(res.statusCode).send(err));
// });
// router.route('/gcs/:id').get((req, res) => {
//   bucket.getFiles((err, files) => {
//     if (!err) {
//       res.json(files);
//     } else {
//       console.log(err);
//     }
//   });
// });
// router.route('/').delete((req, res) => {
//   Doc.deleteMany({})
//     .then(() => res.json('Documents deleted'))
//     .catch((err) => res.status(res.statusCode).send(err));
// });

router.route("/:id").get(async (req, res) => {
  try {
    const doc = await Doc.findById(req.params.id);
    res.json(doc);
  } catch (err) {
    res.status(res.statusCode).send(err);
  }
});

router.route("/records/:id").delete(async (req, res) => {
  try {
    const result = await Doc.deleteMany({ recordId: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(res.statusCode).send(err);
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    await Doc.findByIdAndDelete(req.params.id);
    res.json("Document deleted");
  } catch (err) {
    res.status(res.statusCode).send(err);
  }
});

router.route("/:id").put(async (req, res) => {
  try {
    const doc = await Doc.findById(req.params.id);
    if (!doc) {
      return res.status(404).send("Document not found");
    }
    const newDoc = {
      ...doc.toObject(),
      username: req.body.username,
      url: req.body.url,
      type: req.body.type,
      info: req.body.info,
    };
    const updatedDoc = await Doc.findByIdAndUpdate(req.params.id, newDoc, {
      new: true,
    });
    res.json("Doc updated");
  } catch (err) {
    res.status(err.statusCode).send(err);
  }
});

router.route("/add").post(async (req, res) => {
  try {
    const { user_id, url, type, info } = req.body;
    const newDoc = new Doc({ user_id, url, type, info });
    await newDoc.save();
    res.json("Document added!");
  } catch (err) {
    res.status(400).send(err);
  }
});

export default router;
