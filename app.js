import express from "express";
import connectDB from "./db/connectDB.js";
import web from "./routes/web.js";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;
const DATABASE_URL = process.env.database_url;

//cors
app.use(cors());

//get data from form
app.use(bodyParser.json());

//Load routes
app.use("/", web);

//josn parse
app.use(express.json());

//connecting Database
connectDB(DATABASE_URL);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.user_email,
    pass: process.env.user_pass,
  },
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

export default transporter;
