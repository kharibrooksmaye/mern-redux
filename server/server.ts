import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";

import docsRouter from "./routes/docs";
import usersRouter from "./routes/users";
import indexRouter from "./routes/index";
import recordsRouter from "./routes/records";
import adminRouter from "./routes/admin";
import emailRouter from "./routes/email";

dotenv.config();

interface CustomRequest extends express.Request {
  rawBody?: string;
}
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: [
      "Set-Cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const schema = (
      Array.isArray(req.headers["x-forwarded-proto"])
        ? req.headers["x-forwarded-proto"][0]
        : req.headers["x-forwarded-proto"] || ""
    ).toLowerCase();
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
  express.json({
    verify(req: CustomRequest, res, buf) {
      const url = req.originalUrl;
      if (url.startsWith("/api/records/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

const uri = process.env.ATLAS_URI as string;
mongoose.connect(uri);
const { connection } = mongoose;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});
//

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
