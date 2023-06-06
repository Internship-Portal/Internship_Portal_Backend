import express, { Request, Response } from "express";
import cors from "cors";
const app = express();
const PORT: number = 4000;
app.use(cors());

// Officer Routes Connection
import router from "./routes/officer";
app.use("/api/officer", router);

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
