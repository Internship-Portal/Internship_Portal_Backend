import { ObjectId, Schema, model } from "mongoose";
import { projectInterface } from "../interfaces/Project";
import userModel from "./User";

// ---------------------------------------------------- Project Schema
export const ProjectSchema = new Schema<projectInterface>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    bidding_ids: {
      type: [Schema.Types.ObjectId],
      ref: "Bidding",
    },
    closeBid: {
      type: Boolean,
      default: false,
    },
    visibility_time: {
      type: Date,
    },
    pincode: {
      type: String,
    },
    operation: {
      type: [String],
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    orgName: {
      type: String,
      required: true,
    },
    projectCreatorId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    startprice: {
      type: Number,
      required: true,
    },
    endprice: {
      type: Number,
      required: true,
    },
    samples: {
      type: [Schema.Types.ObjectId],
      ref: "Bidding",
    },
    expectedDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    drawing: {
      type: String,
    },
    featureImages: {
      type: [String],
    },
  },
  { timestamps: true }
);

const projectModel = model<projectInterface>("Project", ProjectSchema);
export default projectModel;
