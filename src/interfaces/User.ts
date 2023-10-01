import { ObjectId, Schema } from "mongoose";

// ---------------------------------------------------- User Interface

export interface userInterface {
  username: string;
  password: string;
  _id?: ObjectId;
  email: string;
  orgName: string;
  phoneNumber: string;
  gstNumber: string;
  planID: string | null;
  operations?: Array<string>;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  city?: string;
  pincode?: string;
  establishedDate?: Date;
  vision?: string;
  mission?: string;
  description?: string;
  topClients?: Array<string>;
  representative: string;
  planEndDate: Date | null;
  projects?: Schema.Types.ObjectId[];
  logo?: string;
  featureImages?: Array<string>;
  status: number;
}

// ---------------------------------------------------- User Interface

// --------------------------------------------------- Login Interface

export interface loginInterface {
  email: string;
  password: string;
}

// --------------------------------------------------- Login Interface

// --------------------------------------- Create First User Interface

export interface userCreateFirstInterface {
  username: string;
  password: string;
  email: string;
  orgName: string;
  phoneNumber: string;
  gstNumber: string;
  planID: string;
  representative: string;
}

// --------------------------------------- Create First User Interface

// -------------------------------------- Create Second User Interface

export interface userCreateSecondInterface {
  operations: Array<string>;
  addressLine1: string;
  addressLine2: string;
  state: string;
  city: string;
  pincode: string;
  establishedDate: Date;
  vision: string;
  mission: string;
  description: string;
  topClients: Array<string>;
  logo: string;
  featureImages: Array<string>;
}

// -------------------------------------- Create Second User Interface

export interface userPaymentInterface {
  _id: string;
  planID: string;
}
