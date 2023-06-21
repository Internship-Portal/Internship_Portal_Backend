import { model, Schema, Document, Types } from "mongoose";
import {
  Students,
  selectedStudentsDepartwise,
  StudentsSchema,
} from "./officer";

// --------------- selected students department of Officer Interface
export interface departments {
  department_name: string;
  year_batch: number;
  internship_start_date: Date;
  internship_end_date: Date;
  students_details: Students[];
}
// --------------- selected students department of Officer Interface

// ---------------------------------- batchwise department interface

export interface batchwiseDepartmentsInterface {
  year_batch: number;
  departments: [string];
}

// ---------------------------------- batchwise department interface

// ---------------------------------------------- subscribedOfficer Interface
export interface cancelledOfficer {
  officer_id: string;
  index: number;
  message: string;
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribedOfficer Interface
export interface subscribedOfficer {
  officer_id: string;
  index: number;
  message: string;
  access: batchwiseDepartmentsInterface[];
  selectedstudents: departments[];
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribeRequest Interface
export interface subscribeRequest {
  officer_id: string;
  index: number;
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
  company_description: string;
  subscribe_request_from_officer: subscribeRequest[];
  subscribe_request_to_officer: subscribeRequest[];
  subscribed_officer: subscribedOfficer[];
  cancelled_officer: cancelledOfficer[];
  selected_students: departments[];
}
// ---------------------------------------------- Company Interface

// ---------------------selected student Department wise Officer Schema

const departmentDetails = new Schema<departments>({
  department_name: {
    type: String,
  },
  year_batch: {
    type: Number,
  },
  internship_start_date: {
    type: Date,
  },
  internship_end_date: {
    type: Date,
  },
  students_details: {
    type: [StudentsSchema],
  },
});

// ---------------------selected student Department wise Officer Schema

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

const subscribedOfficer = new Schema<subscribedOfficer>({
  officer_id: {
    type: String,
  },
  index: {
    type: Number,
  },
  access: {
    type: [batchWiseDepartments],
  },
  message: {
    type: String,
  },
  selectedstudents: {
    type: [departmentDetails],
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
  company_description: {
    type: String,
  },
  subscribe_request_from_officer: {
    type: [subscribeRequest],
  },
  subscribe_request_to_officer: {
    type: [subscribeRequest],
  },
  subscribed_officer: {
    type: [subscribedOfficer],
  },
  cancelled_officer: {
    type: [cancelledOfficer],
  },
});

// ---------------------------------------------- Company Schema
const CompanyModel = model<Company>("Company", CompanySchema);

export default CompanyModel;
