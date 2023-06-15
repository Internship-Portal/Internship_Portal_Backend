import { model, Schema, Document, Types } from "mongoose";
import { Students, selectedStudentsDepartwise } from "./officer";

// --------------- selected students department of Officer Interface
export interface departments {
  department_name: string;
  year_batch: number;
  internship_start_date: Date;
  internship_end_date: Date;
  students_details: [Students];
}
// --------------- selected students department of Officer Interface

// ---------------------------------------------- selectedStudents Interface
export interface selectedStudents {
  officer_id: string;
  index: string;
  departments: departments[];
}
// ---------------------------------------------- selectedStudents Interface

// ---------------------------------------------- subscribedOfficer Interface
export interface cancelledOfficer {
  officer_id: string;
  index: number;
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribedOfficer Interface
export interface subscribedOfficer {
  officer_id: string;
  index: number;
}
// ---------------------------------------------- subscribedOfficer Interface

// ---------------------------------------------- subscribeRequest Interface
export interface subscribeRequest {
  officer_id: string;
  index: number;
}
// ---------------------------------------------- subscribeRequest Interface

// ---------------------------------------------- Company Interface
export interface Company extends Document {
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
  selected_students: selectedStudents[];
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
  students_details: [selectedStudentsDepartwise],
});

// ---------------------selected student Department wise Officer Schema

// ---------------------------------------------- selectedStudents Schema

const selectedStudents = new Schema<selectedStudents>({
  officer_id: {
    type: String,
  },
  index: {
    type: String,
  },
  departments: [departmentDetails],
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
});

// ---------------------------------------------- cancelledOfficer Schema

// ---------------------------------------------- subscribedOfficer Schema

const subscribedOfficer = new Schema<subscribedOfficer>({
  officer_id: {
    type: String,
  },
  index: {
    type: Number,
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
});

// ---------------------------------------------- subscribeRequest Schema

// ---------------------------------------------- Company Schema

const CompanySchema = new Schema<Company>({
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
  selected_students: {
    type: [selectedStudents],
  },
});

// ---------------------------------------------- Company Schema
const CompanyModel = model<Company>("Company", CompanySchema);

export default CompanyModel;
