import { Schema, model, Document, Types } from "mongoose";

export interface Students {
  _id: Types.ObjectId;
  name: string;
  cgpa: number;
  year_batch: number;
}

export interface SharedDetails {
  _id: Types.ObjectId;
  company_id: string;
  details_id: string;
}

export interface Department {
  _id: Types.ObjectId;
  name: string;
  student_details: Students[];
}

export interface Officer extends Document {
  _id: Types.ObjectId;
  name: string;
  email_id: string;
  college_name: string;
  details: Department[];
  sharedCompany: SharedDetails[];
}

export const SharedDetailsSchema = new Schema<SharedDetails>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
  company_id: {
    type: String,
  },
  details_id: {
    type: String,
  },
});

export const StudentsSchema = new Schema<Students>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
  name: {
    type: String,
  },
  cgpa: {
    type: Number,
  },
  year_batch: {
    type: Number,
  },
});

export const DepartmentSchema = new Schema<Department>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
  name: {
    type: String,
  },
  student_details: {
    type: [StudentsSchema],
  },
});

const OfficerSchema = new Schema<Officer>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
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
  details: {
    type: [DepartmentSchema],
  },
  sharedCompany: {
    type: [SharedDetailsSchema],
  },
});

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
