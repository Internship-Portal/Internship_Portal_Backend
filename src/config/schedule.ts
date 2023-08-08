import cron from "node-cron";
import OfficerModel, { Officer } from "../models/officer";

// ----------------------------------------------- Make Students Available

cron.schedule("0 0 * * *", async () => {
  // fetching all the officers
  await OfficerModel.find({}, (err: any, data: any) => {
    if (err) {
      console.log(err);
    } else {
      data.forEach((officer: Officer) => {
        // Checking each officer college details
        officer.college_details.forEach((department) => {
          // Checking each department student details
          department.student_details.forEach((student) => {
            const currentDate = new Date();
            if (
              student.internship_end_date &&
              student.internship_end_date <= currentDate
            ) {
              // making the student available if the internship end
              // date is less than or equal to current date
              student.Internship_status = false;
              student.current_internship = null;
              student.internship_start_date = null;
              student.internship_end_date = null;
            }
          });
        });
        // saving the officer
        officer.save();
      });
      // printing the date on which the students are updated
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}/${month}/${day}`;
      console.log(`Students Updated on date ${formattedDate}`);
    }
  });
});

// ----------------------------------------------- Make Students Available
