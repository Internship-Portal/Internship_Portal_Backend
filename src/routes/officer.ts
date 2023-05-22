import express, { Request, Response, Router } from "express";
const router: Router = Router();
import BodyParser from "body-parser";
import {
  createOfficerController,
  findOfficerController,
  deleteOfficerController,
} from "../controller/officer";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

router.get("/createofficer", createOfficerController);
router.get("/getOneOfficer/:id", findOfficerController);
router.get("/deleteOfficer/:id", deleteOfficerController);

export default router;
