import { ObjectId, Schema, model } from "mongoose";
import { Bidding } from "../interfaces/Bidding";

const biddingSchema = new Schema<Bidding>(
  {
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    askForSample: {
      type: Boolean,
      default: false,
    },
    sampleAskedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const BiddingModel = model<Bidding>("Bidding", biddingSchema);
export default BiddingModel;
