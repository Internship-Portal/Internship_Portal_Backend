import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

// Officer Routes Connection
import OfficerRouter from "./routes/officer";
app.use("/api/officer", OfficerRouter);

// Company Routes Connection
import CompanyRouter from "./routes/Company";
app.use("/api/company", CompanyRouter);

// Connecting to the Mongo DB from config folder
import connects from "./config/db";
connects();

// Listening to the port
app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
