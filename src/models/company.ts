import { model, Schema, Document, Types } from "mongoose";
import { Department, DepartmentSchema } from "./officer";

export interface Details {
  name: string;
  email_id: string;
  college_name: string;
  details: Department[];
}

const DetailsSchema = new Schema<Details>({
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

// Company model
export interface Company extends Document {
  name: string;
  companydescription: string;
  imageURL: string;
  email_id: string;
  detailsOfficer: Details[];
}

const CompanySchema = new Schema<Company>({
  name: {
    type: String,
  },
  email_id: {
    type: String,
  },
  imageURL: {
    type: String,
  },
  companydescription: {
    type: String,
  },
  detailsOfficer: {
    type: [DetailsSchema],
  },
});

const CompanyModel = model<Company>("Company", CompanySchema);

export default CompanyModel;
