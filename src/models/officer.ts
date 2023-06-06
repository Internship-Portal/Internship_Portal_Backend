import { Schema, model, Document, Types } from "mongoose";

// ----------------------------------- subscribeRequest Interface
export interface subscribeRequest {
  company_id: string;
}
// ----------------------------------- subscribeRequest Interface

// ----------------------------------- subscribedCompany Interface
export interface subscribedCompany {
  company_id: string;
}
// ----------------------------------- subscribedCompany Interface

// -------------------------------------------- Students Interface
export interface Students {
  name: string;
  email_id: string;
  college_name: string;
  location: string;
  mobile_no: number;
  branch: string;
  roll_no: string;
  achievements: [string];
  skills: [string];
  hobbies: [string];
  cgpa: number;
  unavailable_dates: [Date];
  internship_status: boolean;
  tenth_percentage: number;
  twelve_percentage: number;
  diploma_percentage: number;
}
// -------------------------------------------- Students Interface

// ----------------------------------------- Department Interface
export interface Department {
  department: string;
  year_batch: number;
  student_details: Students[];
}
// ----------------------------------------- Department Interface

// -------------------------------------------- Officer Interface
export interface Officer extends Document {
  name: string;
  email_id: string;
  mobile_no: string;
  imageurl: string;
  subscriberequest: subscribeRequest[];
  subscribedcompany: subscribedCompany[];
  college_name: string;
  college_details: Department[];
}
// -------------------------------------------- Officer Interface

// ----------------------------------- subscribedCompany Schema
export const subscribedCompany = new Schema<subscribedCompany>({
  company_id: {
    type: String,
  },
});
// ----------------------------------- subscribedCompany Schema

// ----------------------------------- subscribeRequest Schema

export const subscribeRequest = new Schema<subscribeRequest>({
  company_id: {
    type: String,
  },
});
// ----------------------------------- subscribeRequest Schema

// --------------------------------------------- Student Schema
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
  location: {
    type: String,
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
  },
  skills: {
    type: [String],
  },
  hobbies: {
    type: [String],
  },
  cgpa: {
    type: Number,
  },
  unavailable_dates: {
    type: [Date],
  },
  internship_status: {
    type: Boolean,
  },
  tenth_percentage: {
    type: Number,
  },
  twelve_percentage: {
    type: Number,
  },
  diploma_percentage: {
    type: Number,
  },
});
// ----------------------------------------------- Student Schema

// --------------------------------------------- Department Schema
export const DepartmentSchema = new Schema<Department>({
  department: {
    type: String,
  },
  year_batch: {
    type: Number,
  },
  student_details: {
    type: [StudentsSchema],
  },
});
// -------------------------------------------- Department Schema

// ----------------------------------------------- Officer Schema
const OfficerSchema = new Schema<Officer>({
  name: {
    type: String,
    required: true,
  },
  imageurl: {
    type: String,
  },
  mobile_no: {
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
  subscriberequest: {
    type: [subscribeRequest],
  },
  subscribedcompany: {
    type: [subscribedCompany],
  },
  college_details: {
    type: [DepartmentSchema],
  },
});
// ----------------------------------------------- Officer Schema

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
