import { Schema, model, Document, Types } from "mongoose";

// Selected Students by Company Department wise student storing--

export interface selectedStudentsDepartwise {
  student_id: string;
  index: number;
}

// Selected Students by Company Department wise student storing--

// Selected Students by Company Interface --------------------------

export interface selectedStudents {
  department_name: string;
  year_batch: string;
  date: Date;
  selectedstudents: selectedStudentsDepartwise[];
}

// Selected Students by Company Interface --------------------------

// ----------------------------------- subscribeRequest Interface

export interface subscribeRequest {
  company_id: string;
  username: string;
  imageurl: string;
  mobile_no: string;
  email_id: string;
  company_name: string;
  company_description: string;
}

// ----------------------------------- subscribeRequest Interface

// ----------------------------------- subscribedCompany Interface

export interface subscribedCompany {
  company_id: string;
  username: string;
  imageurl: string;
  mobile_no: string;
  email_id: string;
  company_name: string;
  company_description: string;
  selectedstudents: selectedStudents[];
}

// ----------------------------------- subscribedCompany Interface

// ----------------------------------- cancelledCompany Interface

export interface cancelledCompany {
  company_id: string;
  username: string;
  imageurl: string;
  mobile_no: string;
  email_id: string;
  company_name: string;
  company_description: string;
}

// ----------------------------------- cancelledCompany Interface

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
  department_name: string;
  year_batch: number;
  student_details: Students[];
}

// ----------------------------------------- Department Interface

// -------------------------------------------- Officer Interface

export interface Officer extends Document {
  username: string;
  index: number;
  email_id: string;
  mobile_no: string;
  imageurl: string;
  college_name: string;
  subscriberequest: subscribeRequest[];
  subscribedcompany: subscribedCompany[];
  cancelledcompany: cancelledCompany[];
  college_details: Department[];
}

// -------------------------------------------- Officer Interface

// Selected Students by Company Department wise student storing Schema

export const selectedStudentsDepartwise =
  new Schema<selectedStudentsDepartwise>({
    student_id: {
      type: String,
    },
    index: {
      type: Number,
    },
  });

// Selected Students by Company Department wise student storing Schema

// Selected Students by Company Schema --------------------------

export const selectedStudents = new Schema<selectedStudents>({
  department_name: {
    type: String,
  },
  year_batch: {
    type: String,
  },
  date: {
    type: Date,
  },
  selectedstudents: {
    type: [selectedStudentsDepartwise],
  },
});

// Selected Students by Company Schema --------------------------

// ----------------------------------- subscribedCompany Schema

export const subscribedCompany = new Schema<subscribedCompany>({
  company_id: {
    type: String,
  },
  username: {
    type: String,
  },
  imageurl: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  email_id: {
    type: String,
  },
  company_name: {
    type: String,
  },
  company_description: {
    type: String,
  },
  selectedstudents: {
    type: [selectedStudents],
  },
});

// ----------------------------------- subscribedCompany Schema

// ----------------------------------- subscribeRequest Schema

export const subscribeRequest = new Schema<subscribeRequest>({
  company_id: {
    type: String,
  },
  username: {
    type: String,
  },
  imageurl: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  email_id: {
    type: String,
  },
  company_name: {
    type: String,
  },
  company_description: {
    type: String,
  },
});

// ----------------------------------- subscribeRequest Schema

// ----------------------------------- cancelledCompany Schema

export const cancelledCompany = new Schema<cancelledCompany>({
  company_id: {
    type: String,
  },
  username: {
    type: String,
  },
  imageurl: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  email_id: {
    type: String,
  },
  company_name: {
    type: String,
  },
  company_description: {
    type: String,
  },
});

// ----------------------------------- cancelledCompany Schema

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
  department_name: {
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
  username: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
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
  cancelledcompany: {
    type: [cancelledCompany],
  },
  college_details: {
    type: [DepartmentSchema],
  },
});

// ----------------------------------------------- Officer Schema

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
