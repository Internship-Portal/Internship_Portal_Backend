import { ObjectId } from "mongoose";
import { userInterface } from "./User";
import { projectInterface } from "./Project";

// --------------------------- Bidding Interface

export interface Bidding {
  _id?: ObjectId;
  price: number;
  userId: ObjectId | userInterface;
  projectId: ObjectId | projectInterface;
  askForSample: boolean;
  sampleAskedDate: Date;
}

// --------------------------- Bidding Interface
