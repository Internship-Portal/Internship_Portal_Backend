import express from "express";
import cors from "cors";
import connects from "./utils/DB";
import helmet from "helmet";
import bodyParser from "body-parser";
import logger from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 8000;

// Express
const app = express();
app.use(express.json());

// Helmet (Security)
app.use(helmet());

// Cors
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

// Cookie Parser
app.use(cookieParser());

// Logger of Requests //! Remove in production
app.use(logger("dev"));

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin"
  );
  next();
});

// Mongo Connection
connects();

app.get("/", (req, res) => {
  res.send("Hello World");
});

import UserRoutes from "./routes/User";
app.use("/api/user", UserRoutes);

import PaymentRoutes from "./routes/Payment";
app.use("/api/payment", PaymentRoutes);

import ProjectRoutes from "./routes/Project";
app.use("/api/project", ProjectRoutes);

import VerificationRoutes from "./routes/Verification";
app.use("/api/verification", VerificationRoutes);

import RecoveryRoutes from "./routes/Recovery";
app.use("/api/recovery", RecoveryRoutes);

import BiddingRoutes from "./routes/Bidding";
app.use("/api/bidding", BiddingRoutes);

//error handlings
app.use(function (req, res, next) {
  next(
    createError(
      404,
      "Invalid API. Use the official documentation to get the list of valid APIS."
    )
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
