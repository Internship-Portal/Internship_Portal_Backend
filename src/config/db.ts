import mongoose, { connect } from "mongoose";
require("dotenv").config();
// Connecting to the Mongo DB
const connects = async (): Promise<any> => {
  // Mongo DB String
  // return connect("mongodb+srv://admin:admin@imdb.11npizj.mongodb.net/student")
  const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };
  await connect(process.env.DB || "mongodb://0.0.0.0:27017/Internship_Portal")
    .then(() => {
      // Print Mongo Connected in console if connected
      console.log("Mongo Connected");
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export default connects;
