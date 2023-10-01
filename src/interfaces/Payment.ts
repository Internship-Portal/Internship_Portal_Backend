import { ObjectId } from "mongoose";

// ---------------------------------------------------- Payment Interface

export interface paymentInterface {
  _id?: ObjectId;
  amount: number;
  paymentDate: Date;
  id: string;
  currency: string;
  receipt: string;
  emailId: string;
  paymentId: string;
  status: string;
  orderId: string;
  signature: string;
}

// ---------------------------------------------------- Payment Interface

// ---------------------------------------------------- order Interface

export interface orderInterface {
  amount: number;
  emailID: string;
}

// ---------------------------------------------------- order Interface

// ---------------------------------------------------- verify Interface

export interface verifyInterface {
  orderId: string;
  paymentId: string;
  signature: string;
  emailID: string;
  id: string;
}

// ---------------------------------------------------- verify Interface
