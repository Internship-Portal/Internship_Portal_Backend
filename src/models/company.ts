import { model, Schema, Document, Types } from "mongoose";
import { StudentsSchema, Students } from "./officer";

export interface selectedStudentsInterface {
  department_name: string;
  year_batch: number;
  start_date: Date | null;
  end_date: Date | null;
  confirmed: boolean;
  student_details: Students[];
}

// ---------------------------------- batchwise department interface

export interface batchwiseDepartmentsInterface {
  year_batch: number;
  departments: string[];
}

// ---------------------------------- batchwise department interface

// ---------------------------------------------- subscribedOfficer Interface
export interface cancelledOfficer {
  officer_id: string;
  index: number;
  username: string;
  college_name: string;
  message: string;
  cancelled_by: string;
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribedOfficer Interface
export interface subscribedOfficer {
  officer_id: string;
  username: string;
  college_name: string;
  index: number;
  message: string;
  selectedbycompany: selectedStudentsInterface[];
  selectedbyOfficer: selectedStudentsInterface[];
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribeRequest Interface
export interface subscribeRequest {
  officer_id: string;
  index: number;
  username: string;
  college_name: string;
  message: string;
}
// ---------------------------------------------- subscribeRequest Interface

// ---------------------------------------------- Company Interface
export interface Company extends Document {
  index: number;
  username: string;
  email_id: string;
  password: string;
  mobile_no: string;
  company_name: string;
  subscribe_request_from_officer: subscribeRequest[];
  subscribe_request_to_officer: subscribeRequest[];
  subscribed_officer: subscribedOfficer[];
  cancelled_officer: cancelledOfficer[];
}
// ---------------------------------------------- Company Interface

// ---------------------------------------------- selectedStudents Schema

export const selectedStudents = new Schema<selectedStudentsInterface>({
  department_name: {
    type: String,
  },
  year_batch: {
    type: Number,
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  confirmed: {
    type: Boolean,
  },
  student_details: {
    type: [StudentsSchema],
    default: [],
  },
});

// ---------------------------------------------- selectedStudents Schema

// ---------------------------------------------- cancelledOfficer Schema

const cancelledOfficer = new Schema<cancelledOfficer>({
  officer_id: {
    type: String,
  },
  index: {
    type: Number,
  },
  message: {
    type: String,
  },
  username: {
    type: String,
  },
  college_name: {
    type: String,
  },
  cancelled_by: {
    type: String,
  },
});

// ---------------------------------------------- cancelledOfficer Schema

// ---------------------------------------------- batchwiseDepartments Schema

export const batchWiseDepartments = new Schema<batchwiseDepartmentsInterface>({
  year_batch: {
    type: Number,
  },
  departments: {
    type: [String],
  },
});

// ---------------------------------------------- batchwiseDepartment Schema

// ---------------------------------------------- subscribedOfficer Schema

export const subscribedOfficerSchema = new Schema<subscribedOfficer>({
  officer_id: {
    type: String,
  },
  index: {
    type: Number,
  },
  username: {
    type: String,
  },
  college_name: {
    type: String,
  },
  selectedbycompany: {
    type: [selectedStudents],
  },
  message: {
    type: String,
  },
  selectedbyOfficer: {
    type: [selectedStudents],
  },
});

// ---------------------------------------------- subscribedOfficer Schema

// ---------------------------------------------- subscribeRequest Schema

const subscribeRequest = new Schema<subscribeRequest>({
  officer_id: {
    type: String,
  },
  index: {
    type: Number,
  },
  message: {
    type: String,
  },
  username: {
    type: String,
  },
  college_name: {
    type: String,
  },
});

// ---------------------------------------------- subscribeRequest Schema

// ---------------------------------------------- Company Schema

const CompanySchema = new Schema<Company>({
  index: {
    type: Number,
  },
  username: {
    type: String,
  },
  email_id: {
    type: String,
  },
  password: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  company_name: {
    type: String,
  },
  subscribe_request_from_officer: {
    type: [subscribeRequest],
  },
  subscribe_request_to_officer: {
    type: [subscribeRequest],
  },
  subscribed_officer: {
    type: [subscribedOfficerSchema],
  },
  cancelled_officer: {
    type: [cancelledOfficer],
  },
});

// ---------------------------------------------- Company Schema
const CompanyModel = model<Company>("Company", CompanySchema);

export default CompanyModel;
