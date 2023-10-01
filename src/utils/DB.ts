import mongoose from "mongoose";
require("dotenv").config();

const connects = async (): Promise<void> => {
  let DB: string | undefined = process.env.DB;
  if (DB) {
    await mongoose
      .connect(DB)
      .then(() => {
        console.log("Mongo Connected");
      })
      .catch((e: Error) => {
        console.log(e);
      });
  } else {
    console.log("MongoDB connection string is not defined.");
  }
};

mongoose.set("strictQuery", true);

export default connects;
