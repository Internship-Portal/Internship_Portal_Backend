import cron from "node-cron";
import { createUserIndexing } from "./Indexing";
import paymentModel from "../models/Payment";
import userModel from "../models/User";

function monthToNumber(monthName: any) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months.indexOf(monthName);
}

export const convertToDateIfValidFormat = (dateString: any) => {
  // Regular expressions to match various date formats
  const dateFormatRegexes = [
    /^(\d{2})-(\d{2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{2})-(\d{2})-(\d{2})$/, // dd-mm-yy
    /^(\d{2})\/(\d{2})\/(\d{2})$/, // dd/mm/yy
    /^(\d{2})\s([a-zA-Z]{3})\s(\d{4})$/, // dd Mon yyyy
    /^([a-zA-Z]{3})\s(\d{2}),\s(\d{4})$/, // Mon dd, yyyy
  ];

  for (const dateFormatRegex of dateFormatRegexes) {
    const match = dateString.match(dateFormatRegex);

    if (match) {
      // Extract day, month, and year values from the matched groups
      let day, month, year;
      if (dateFormatRegex.toString().includes("Mon")) {
        // If the format includes abbreviated month names like "Mar"
        [day, month, year] = match.slice(1); // Use slice(1) to skip the full match at index 0
        month = monthToNumber(month);
      } else {
        // If the format uses numeric month representation
        [day, month, year] = match.slice(1); // Use slice(1) to skip the full match at index 0
        month = parseInt(month) - 1; // Months are zero-indexed in JavaScript Date object
      }

      // Create a new Date object
      const convertedDate = new Date(year, month, day);

      return convertedDate;
    }
  }

  // If the date is not in any of the expected formats, return the input date string as is
  return dateString;
};

// creating user indexing at 12:00 AM everyday
cron.schedule("0 0 * * *", async () => {
  try {
    createUserIndexing();
  } catch (e) {
    console.log(e);
  }
});

// deleting payment request after 7 days
cron.schedule("0 1 * * *", async () => {
  try {
    const allPaymentRequest = await paymentModel.find({});
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

    const filteredPaymentRequests = allPaymentRequest.filter(
      (paymentRequest) => {
        if (paymentRequest.status === "Order Not Verified") {
          const paymentDate = new Date(paymentRequest.paymentDate);
          const currentDate = new Date();
          const difference = currentDate.getTime() - paymentDate.getTime();

          return difference >= oneWeekInMilliseconds;
        }
      }
    );

    // Get the IDs of the payment requests to be deleted
    const paymentRequestIdsToDelete = filteredPaymentRequests.map(
      (paymentRequest) => paymentRequest._id
    );

    // Delete the payment requests with the matching IDs
    await paymentModel.deleteMany({ _id: { $in: paymentRequestIdsToDelete } });
  } catch (e) {
    console.log(e);
  }
});

// make users plans inactive after plan end date
cron.schedule("0 2 * * *", async () => {
  try {
    const allUsers = await userModel.find({});
    const currentDate = new Date();

    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // Two days in milliseconds

    const filteredUsers = allUsers.filter((user) => {
      if (user.planEndDate) {
        const planEndDate = new Date(user.planEndDate);
        const currentDate = new Date();
        const difference = planEndDate.getTime() - currentDate.getTime();

        return (
          difference >= twoDaysInMillis && difference < twoDaysInMillis * 3
        );
      }
    });

    for (const user of filteredUsers) {
      user.planEndDate = null;
      user.planID = null;
      await user.save();
    }
  } catch (e) {
    console.log(e);
  }
});
