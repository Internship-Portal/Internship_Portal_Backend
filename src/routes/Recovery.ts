import { Router } from "express";
const router: Router = Router();

import {
  recoverUsernameController,
  recoverPasswordController,
  recoverAccountController,
} from "../controller/Recovery";

import {
  recoveryIntialMiddleware,
  recoveryFinalMiddleware,
} from "../middleware/Recovery";

router.post("/username", recoveryIntialMiddleware, recoverUsernameController);

router.post("/password", recoveryIntialMiddleware, recoverPasswordController);

router.post("/account/:id", recoveryFinalMiddleware, recoverAccountController);

export default router;
