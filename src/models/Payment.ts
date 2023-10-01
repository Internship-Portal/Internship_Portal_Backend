import { ObjectId, Schema, model } from "mongoose";
import { paymentInterface } from "../interfaces/Payment";

// ---------------------------------------------------- Payment Schema
const PaymentSchema = new Schema<paymentInterface>(
  {
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    id: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },
  },
  { timestamps: true }
);

const paymentModel = model<paymentInterface>("Payments", PaymentSchema);
export default paymentModel;
