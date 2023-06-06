import { Schema, model, Document, Types } from "mongoose";

export interface Students {
  name: string;
  email_id: string;
  college_name: string;
  mobile_no: number;
  // imageURL: string;
  branch: string;
  roll_no: string;
  achievements: [string];
  hobbies: [string];
  cgpa: number;
  year_batch: number;
}

export interface details_shared {
  shared_id: string;
  details_id: string;
}

export interface SharedDetails {
  company_id: string;
  details_shared: details_shared[];
}

export interface Department {
  name: string;
  student_details: Students[];
}

export interface subscribeRequest {
  company_id: string;
}

export interface subscribedCompany {
  company_id: string;
}

export interface Officer extends Document {
  name: string;
  email_id: string;
  mobile_no: number;
  imageURL: string;
  subscribeRequest: subscribeRequest[];
  subscribedCompany: subscribedCompany[];
  college_name: string;
  college_details: Department[];
  sharedtoCompany: SharedDetails[];
}

export const subscribedCompany = new Schema<subscribedCompany>({
  company_id: {
    type: String,
  },
});

export const subscribeRequest = new Schema<subscribeRequest>({
  company_id: {
    type: String,
  },
});

export const details_shared = new Schema<details_shared>({
  shared_id: {
    type: String,
  },
  details_id: {
    type: String,
  },
});

export const SharedDetailsSchema = new Schema<SharedDetails>({
  company_id: {
    type: String,
  },
  details_shared: {
    type: [details_shared],
  },
});

export const StudentsSchema = new Schema<Students>({
  name: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
  },
  college_name: {
    type: String,
    required: true,
  },
  mobile_no: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  roll_no: {
    type: String,
    required: true,
  },
  achievements: {
    type: [String],
    required: true,
  },
  hobbies: {
    type: [String],
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
  },
  year_batch: {
    type: Number,
    required: true,
  },
});

export const DepartmentSchema = new Schema<Department>({
  name: {
    type: String,
  },
  student_details: {
    type: [StudentsSchema],
  },
});

const OfficerSchema = new Schema<Officer>({
  name: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
  },
  mobile_no: {
    type: Number,
    required: true,
  },
  subscribeRequest: {
    type: [subscribeRequest],
  },
  subscribedCompany: {
    type: [subscribedCompany],
  },
  email_id: {
    type: String,
    required: true,
  },
  college_name: {
    type: String,
    required: true,
  },
  college_details: {
    type: [DepartmentSchema],
  },
  sharedtoCompany: {
    type: [SharedDetailsSchema],
  },
});

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
