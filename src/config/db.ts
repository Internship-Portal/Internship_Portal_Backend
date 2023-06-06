import mongoose, { connect } from "mongoose";

function connects() {
  return connect("mongodb+srv://admin:admin@imdb.11npizj.mongodb.net/student")
    .then(() => {
      console.log("Mongo Connected");
    })
    .catch((e: any) => console.log(e));
}

export default connects;
