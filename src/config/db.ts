import mongoose, { connect } from "mongoose";

// Connecting to the Mongo DB
const connects = (): Promise<void> => {
  // Mongo DB String
  return connect("mongodb+srv://admin:admin@imdb.11npizj.mongodb.net/student")
    .then(() => {
      // Print Mongo Connected in console if connected
      console.log("Mongo Connected");
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export default connects;
