const { Storage } = require("@google-cloud/storage");
const zephyr = new Storage({
  keyFilename: "./Zephyr.json",
  projectId: "zephyrd",
});
const Doc = require("../models/documents.model");
const Record = require("../models/records.model");
const zephyrinput = zephyr.bucket("zephyrinput");
const zephyroutput = zephyr.bucket("zephyroutput");

const deleteGoogleRecords = async (userid, recordId) => {
  let [inputfiles] = await zephyrinput.getFiles({
    autoPaginate: false,
    prefix: `${userid}/${recordId}`,
  });
  let inputresults = [];
  for (const file of inputfiles) {
    const [metadata] = await file.getMetadata();
    inputresults.push(metadata);
  }
  let [outputfiles] = await zephyroutput.getFiles({
    autoPaginate: false,
    prefix: `${userid}/${recordId}`,
  });
  let outputresults = [];
  for (const file of outputfiles) {
    const [metadata] = await file.getMetadata();
    outputresults.push(metadata);
  }
  const all = inputresults.concat(outputresults);
  all.forEach((item) => {
    console.log(item.name);
  });
  all.forEach(async (item) => {
    if (item.id.includes("zephyrinput")) {
      const file = zephyrinput.file(item.name);
      console.log("zephyrinput", file.name);
      await file.delete();
    }
    if (item.id.includes("zephyroutput")) {
      const file = zephyroutput.file(item.name);
      console.log("zephyroutput", file.name);
      await file.delete();
    }
  });
  Record.deleteOne({ id: recordId })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
export default deleteGoogleRecords;
