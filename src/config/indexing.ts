import cron from "node-cron";
import { MongoClient } from "mongodb";
import { Officer } from "../models/officer";

cron.schedule("0 1 * * *", async () => {
  try {
    const client = new MongoClient(process.env.DB!);
    await client.connect();

    // Database Name and Collection Name
    const db = client.db("Internship_Portal");
    const officerCollection = db.collection("Officer");

    // Creating Indexes
    const officerIndex = await officerCollection.createIndex(
      {
        email: 1,
      },
      { background: true }
    );

    // Closing Connection
    await client.close();
  } catch (e) {
    console.log("Cannot create Officer Indexing => ", e);
  }
});

cron.schedule("0 1 * * *", async () => {
  try {
    const client = new MongoClient(process.env.DB!);
    await client.connect();

    // Database Name and Collection Name
    const db = client.db("Internship_Portal");
    const officerCollection = db.collection("Company");

    // Creating Indexes
    const officerIndex = await officerCollection.createIndex(
      {
        email: 1,
      },
      { background: true }
    );

    // Closing Connection
    await client.close();
  } catch (e) {
    console.log("Cannot create Officer Indexing => ", e);
  }
});

export const createStudentsIndexing = async (
  officer: Officer,
  department: string,
  year_batch: number
): Promise<void> => {
  try {
    const client = new MongoClient(
      "mongodb+srv://admin:admin@imdb.11npizj.mongodb.net"
    );
    await client.connect();

    const db = client.db("Internship_Portal"); // Replace 'yourDatabaseName' with your actual database name
    const officerCollection = db.collection("officers"); // Replace 'officers' with the name of your collection

    // Extract the college_details index where department_name matches
    const collegeDetailsIndex = officer.college_details.findIndex(
      (details: any) =>
        details.department_name === department &&
        details.year_batch === year_batch
    );

    // Access the college_details subdocument and create the index for student_details field
    await officerCollection.createIndex(
      {
        [`college_details.${collegeDetailsIndex}.student_details.achievements`]: 1,
        [`college_details.${collegeDetailsIndex}.student_details.skills`]: 1,
      },
      { background: true } // Optional: You can specify additional index options
    );

    await client.close();
  } catch (error) {
    console.error("Error creating index:", error);
  }
};
