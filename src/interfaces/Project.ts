import { ObjectId } from "mongoose";

// ------------------------------------------------ Project Interface
export interface projectInterface {
  _id: ObjectId;
  pincode: string;
  bidding_ids: Array<ObjectId>; // array of user ids
  visiblity: boolean;
  visibility_time: Date;
  user_id: ObjectId;
  operation: Array<string>; // 5 types che aahe, wireframe madhe aahe
  title: string;
  orgName: string;
  description: string;
  quantity: number;
  startprice: number;
  endprice: number;
  closeBid: boolean;
  expectedDate: Date;
  samples: Array<ObjectId>;
  drawing?: string; // images link as string (one image)
  featureImages?: Array<string>; // array of images link as string
  status: number; // project creation percentage
  projectCreatorId: string;
}

// ------------------------------------------------ Project Interface

// ------------------------------------------------ Create Project Step 1 Interface

export interface createProjectStep1Interface {
  operation: Array<string>;
  title: string;
  description: string;
  quantity: number;
  startprice: number;
  endprice: number;
  expectedDate: Date;
  visibility_time: number;
}
// ------------------------------------------------ Create Project Step 1 Interface

// ------------------------------------------------ Create Project Step 2 Interface
export interface createProjectStep2Interface {
  drawing: string;
  featureImages: Array<string>;
  projectId: string;
}
// ------------------------------------------------ Create Project Step 2 Interface
