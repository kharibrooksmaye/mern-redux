const { Storage } = require("@google-cloud/storage");
const mernReduxStorage = new Storage({
  keyFilename: "./mernRedux.json",
  projectId: "mern-redux-361607",
});
const Doc = require("../models/documents.model");
const Record = require("../models/records.model");
const mernReduxInput = mernReduxStorage.bucket("mern_redux_input");
const mernReduxOutput = mernReduxStorage.bucket("mern_redux_output");

const deleteGoogleRecords = async (userid: string, recordId: string) => {
  let [inputfiles] = await mernReduxInput.getFiles({
    autoPaginate: false,
    prefix: `${userid}/${recordId}`,
  });
  let inputresults = [];
  for (const file of inputfiles) {
    const [metadata] = await file.getMetadata();
    inputresults.push(metadata);
  }
  let [outputfiles] = await mernReduxOutput.getFiles({
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
    if (item.id.includes("mern_redux_input")) {
      const file = mernReduxInput.file(item.name);
      console.log("mern_redux_input", file.name);
      await file.delete();
    }
    if (item.id.includes("mern_redux_output")) {
      const file = mernReduxOutput.file(item.name);
      console.log("mern_redux_output", file.name);
      await file.delete();
    }
  });
  try {
    const result = Record.deleteOne({ id: recordId });
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};
export default deleteGoogleRecords;
