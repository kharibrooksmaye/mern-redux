const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: [
      "set-cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const schema = (req.headers["x-forwarded-proto"] || "").toLowerCase();
    if (schema === "https") {
      next();
    } else {
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}

process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection", error);
  // application specific logging, throwing an error, or other logic here
});

app.use(
  bodyParser.json({
    verify(req, res, buf) {
      const url = req.originalUrl;
      if (url.startsWith("/api/records/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const { connection } = mongoose;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});
//

const docsRouter = require("./routes/docs");
const usersRouter = require("./routes/users");
const indexRouter = require("./routes/index");
const recordsRouter = require("./routes/records");
const adminRouter = require("./routes/admin");
const emailRouter = require("./routes/email");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

app.use("/api/admin", adminRouter);
app.use("/api", indexRouter);
app.use("/api/email", emailRouter);
app.use("/api/users", usersRouter);
app.use("/api/docs", docsRouter);
app.use("/api/records", recordsRouter);

if (process.env.NODE_ENV === "production") {
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

app.listen(port, async () => {
  console.log(`server is running on port: ${port}`);
});
