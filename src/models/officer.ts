import { Schema, model, Document, Types } from "mongoose";

interface Students {
  _id: Types.ObjectId;
  name: string;
  cgpa: number;
  year_batch: number;
}

interface Department {
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
}

const StudentsSchema = new Schema<Students>({
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

const DepartmentSchema = new Schema<Department>({
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
});

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
