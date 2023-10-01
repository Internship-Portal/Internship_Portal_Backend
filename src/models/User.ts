import { ObjectId, Schema, model } from "mongoose";
import { userInterface } from "../interfaces/User";

// ---------------------------------------------------- User Schema
const UserSchema = new Schema<userInterface>(
  {
    username: {
      type: String,
      unique: true,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    orgName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      unique: true,
      required: true,
    },
    planID: {
      type: String,
      required: true,
    },
    operations: {
      type: [String],
      required: false,
    },
    addressLine1: {
      type: String,
      required: false,
    },
    addressLine2: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    establishedDate: {
      type: Date,
      required: false,
    },
    vision: {
      type: String,
      required: false,
    },
    mission: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    topClients: {
      type: [String],
      required: false,
    },
    representative: {
      type: String,
      required: true,
    },
    planEndDate: {
      type: Date,
      required: false,
    },
    status: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
    },
    featureImages: {
      type: [String],
    },
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  { timestamps: true }
);
// ---------------------------------------------------- User Schema

const userModel = model<userInterface>("User", UserSchema);
export default userModel;
