import { Schema, model, Document, Types } from "mongoose";
import { Buffer } from "node:buffer";
import validator from "validator";

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
  index: number;
  name: string;
  email_id: string;
  college_name: string;
  location: string;
  mobile_no: string;
  branch: string;
  roll_no: string;
  achievements: [string];
  skills: [string];
  hobbies: [string];
  cgpa: number;
  backlog: boolean;
  year_batch: number;
  internship_start_date: Date | null;
  internship_end_date: Date | null;
  Internship_status: boolean;
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
  email_id: string;
  mobile_no: string;
  image: string;
  college_name: string;
  subscribe_request_from_company: subscribeRequest[];
  subscribe_request_to_company: subscribeRequest[];
  subscribed_company: subscribedCompany[];
  cancelled_company: cancelledCompany[];
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

// ----------------------------------- subscribeRequestFromCompany Schema

export const subscribeRequestFromCompany = new Schema<subscribeRequest>({
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

// ----------------------------------- subscribeRequestFromCompany Schema

// ----------------------------------- subscribeRequestFromCompany Schema

export const subscribeRequesttoCompany = new Schema<subscribeRequest>({
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

// ----------------------------------- subscribeRequestFromCompany Schema

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
  index: {
    type: Number,
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
  location: {
    type: String,
  },
  mobile_no: {
    type: String,
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
  year_batch: {
    type: Number,
  },
  backlog: {
    type: Boolean,
  },
  internship_start_date: {
    type: Date,
    default: null,
  },
  internship_end_date: {
    type: Date,
    default: null,
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
  Internship_status: {
    type: Boolean,
  },
});

StudentsSchema.path("Internship_status").set(function (
  this: Students,
  value: boolean
) {
  if (this.internship_start_date && this.internship_end_date) {
    const currentDate = new Date();
    this.Internship_status =
      currentDate >= this.internship_start_date &&
      currentDate <= this.internship_end_date;
    if (this.Internship_status === false) {
      this.internship_start_date = null;
      this.internship_end_date = null;
    }
  } else {
    this.Internship_status = false;
  }
});

// ----------------------------------------------- Student Schema

// --------------------------------------------- Department Schema

export const DepartmentSchema = new Schema<Department>({
  department_name: {
    type: String,
    minlength: [2, "minimum 2 letters required"],
    required: true,
  },
  year_batch: {
    type: Number,
    validate: {
      validator: function (value: number): void {
        if (value.toString().length != 4) {
          throw new Error("The number should be of 4 digits long.");
        }
      },
    },
    required: true,
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
    required: [true, "username is required"],
    minlength: [3, "minimum 3 letters required"],
  },

  image: {
    type: String,
  },
  mobile_no: {
    type: String,
    required: true,
    minlength: [4, "minimum 4 number required"],
  },
  email_id: {
    type: String,
    validate(value: string): void {
      if (!validator.isEmail(value)) {
        throw new Error("email is invalid");
      }
    },
    required: true,
  },
  college_name: {
    type: String,
    required: true,
    minlength: [3, "minimum 3 letters required"],
  },
  subscribe_request_from_company: {
    type: [subscribeRequestFromCompany],
  },
  subscribe_request_to_company: {
    type: [subscribeRequesttoCompany],
  },
  subscribed_company: {
    type: [subscribedCompany],
  },
  cancelled_company: {
    type: [cancelledCompany],
  },
  college_details: {
    type: [DepartmentSchema],
  },
});

// ----------------------------------------------- Officer Schema

const OfficerModel = model<Officer>("Officer", OfficerSchema);

export default OfficerModel;
