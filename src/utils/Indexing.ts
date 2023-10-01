import { MongoClient } from "mongodb";
import { paymentInterface } from "../interfaces/Payment";
import { userInterface } from "../interfaces/User";

export const createPaymentIndexing = async (
  payment: paymentInterface
): Promise<any> => {
  try {
    const client = new MongoClient(process.env.DB!);
    await client.connect();

    // Database Name and Collection Name
    const db = client.db("test");
    const PaymentCollection = db.collection("payments");

    // Creating Indexes
    if (payment.emailId !== null) {
      const paymentIndex = await PaymentCollection.createIndex(
        {
          emailId: 1,
          id: 1,
        },
        { background: true }
      );
    }

    // Closing Connection
    await client.close();
  } catch (error) {
    console.error("Error creating index:", error);
  }
};

export const createUserIndexing = async () => {
  try {
    const client = new MongoClient(process.env.DB!);
    await client.connect();

    // Database Name and Collection Name
    const db = client.db("test");
    const userCollection = db.collection("users");

    // Creating Indexes
    const userIndex = await userCollection.createIndex(
      {
        email: 1,
        username: 1,
      },
      { background: true }
    );

    // Closing Connection
    await client.close();
  } catch (error) {
    console.error("Error creating index:", error);
  }
};
