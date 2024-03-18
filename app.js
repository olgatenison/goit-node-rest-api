import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";

import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import authRouter from "./routes/auth.js";
import contactsRouter from "./routes/contactsRouter.js";

dotenv.config();

const app = express();

const { DB_HOST, PORT = 3004, SENDGRID_API_KEY } = process.env;
mongoose.set("strictQuery", true);

// sgMail.setApiKey(SENDGRID_API_KEY);

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT);
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});
