import { Router } from "express";
const router: Router = Router();

import { order, verify } from "../controller/Payment";
import { orderMiddleware, verifyMiddleware } from "../middleware/Payment";

router.post("/order", orderMiddleware, order);

router.post("/verify", verifyMiddleware, verify);

export default router;
