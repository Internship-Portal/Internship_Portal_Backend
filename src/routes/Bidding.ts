import { Router } from "express";
import {
  AddBiddingMiddleware,
  askForSampleMiddleware,
} from "../middleware/Bidding";
import { addBidding, askForSampleController } from "../controller/Bidding";
const router: Router = Router();

router.post("/create", AddBiddingMiddleware, addBidding);

router.put("/askForSample", askForSampleMiddleware, askForSampleController);

export default router;
