import express, { Request, Response } from "express";
import connects from "./config/db";
import cors from "cors";
const app = express();
const HOSTNAME: string = "127.0.0.1";
const PORT: number = 4000;
app.use(cors());

import router from "./routes/officer";
app.use("/api/officer", router);

import CompanyRouter from "./routes/Company";
app.use("/api/company", CompanyRouter);

connects();

app.listen(PORT, HOSTNAME, () => {
  console.log(`Running on PORT ${PORT}`);
});
