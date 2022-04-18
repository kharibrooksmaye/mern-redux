const router = require('express').Router();
const { Storage } = require('@google-cloud/storage');
const Doc = require('../models/documents.model');

const zephyr = new Storage({
  keyFileName: './modules/Zephyr.json',
  projectId: 'zephyrwebsite-272000',
});
const bucket = zephyr.bucket('zephyroutput');

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
router.route('/:id').get((req, res) => {
  Doc.findById(req.params.id)
    .then((doc) => res.json(doc))
    .catch((err) => res.status(res.statusCode).send(err));
});
router.route('/records/:id').delete((req, res) => {
  Doc.deleteMany({
    recordId: req.params.id,
  })
    .then((result) => res.json(result))
    .catch((err) => res.status(res.statusCode).send(err));
});
router.route('/:id').delete((req, res) => {
  Doc.findByIdAndDelete(req.params.id)
    .then(() => res.json('Document deleted'))
    .catch((err) => res.status(res.statusCode).send(err));
});

router.route('/:id').put((req, res) => {
  Doc.findByIdAndUpdate(req.params.id)
    .then((doc) => {
      const newDoc = doc;
      newDoc.username = req.body.username;
      newDoc.url = req.body.url;
      newDoc.type = req.body.type;
      newDoc.info = req.body.info;
      newDoc
        .save()
        .then(() => res.json('Doc updated'))
        .catch((err) => res.status(err.statusCode).send(err));
    })
    .catch((err) => res.status(err.statusCode).send(err));
});
router.route('/add').post((req, res) => {
  const { user_id } = req.body;
  const { url } = req.body;
  const { type } = req.body;
  const { info } = req.body;
  // const preview = req.body.preview
  const newDoc = new Doc({
    user_id,
    url,
    type,
    info,
    // preview,
  });

  newDoc
    .save()
    .then(() => res.json('document added!'))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
