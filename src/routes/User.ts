import { Router } from "express";
const router: Router = Router();

import {
  createUserFirstController,
  loginUserController,
  createUserSecondController,
  verifyTokenController,
  getUserByUsernameController,
  getProfileStatusController,
  uniqueUsernameController,
} from "../controller/User";

import {
  userCreateFirstMiddleware,
  userCreateSecondMiddleware,
  userLoginMiddleware,
  userVerifyTokenMiddleware,
  getUsernameMiddleware,
  getProfileStatusMiddleware,
  uniqueUsernameMiddleware,
} from "../middleware/User";

router.post("/login", userLoginMiddleware, loginUserController);

router.get("/verifyToken", userVerifyTokenMiddleware, verifyTokenController);

router.post(
  "/uniqueUsername",
  uniqueUsernameMiddleware,
  uniqueUsernameController
);

router.post(
  "/createfirst",
  userCreateFirstMiddleware,
  createUserFirstController
);

router.post(
  "/createsecond/:id",
  userCreateSecondMiddleware,
  createUserSecondController
);

router.post(
  "/getuser/:username",
  getUsernameMiddleware,
  getUserByUsernameController
);

router.post(
  "/getprofilestatus/:id",
  getProfileStatusMiddleware,
  getProfileStatusController
);

export default router;
