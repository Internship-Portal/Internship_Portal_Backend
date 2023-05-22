import mongoose, { Schema, Document, Types } from "mongoose";

// Shared reference schema
interface Department extends Document {
  _id: Types.ObjectId;
  name: string;
  student_details: Types.ObjectId[];
  expirationTime: Date;
}

const DepartmentSchema = new Schema<Department>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
  name: {
    type: String,
  },
  student_details: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  expirationTime: {
    type: Date,
    expires: "0s", // Set the TTL index to expire documents immediately
    default: () => new Date(),
  },
});

const DepartmentModel = mongoose.model<Department>(
  "Department",
  DepartmentSchema
);

// Officer model
interface Officer extends Document {
  _id: Types.ObjectId;
  name: string;
  email_id: string;
  college_name: string;
  details: Types.ObjectId[];
}

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
  details: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
});

const OfficerModel = mongoose.model<Officer>("Officer", OfficerSchema);

// Company model
interface Company extends Document {
  _id: Types.ObjectId;
  name: string;
  companydescription: string;
  details: Types.ObjectId[];
}

const CompanySchema = new Schema<Company>({
  _id: {
    type: Schema.Types.ObjectId,
    default: new Types.ObjectId(),
  },
  name: {
    type: String,
  },
  companydescription: {
    type: String,
  },
  details: [
    {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
});

const CompanyModel = mongoose.model<Company>("Company", CompanySchema);
