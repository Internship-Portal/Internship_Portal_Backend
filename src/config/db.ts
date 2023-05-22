import mongoose, { connect } from "mongoose";

function connects() {
  return connect("mongodb://0.0.0.0:27017/student")
    .then(() => {
      console.log("Mongo Connected");
    })
    .catch((e: any) => console.log(e));
}

export default connects;
