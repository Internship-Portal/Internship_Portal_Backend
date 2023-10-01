import {
  CreateTemplateCommand,
  SESClient,
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandInput,
} from "@aws-sdk/client-ses";
require("dotenv").config();

// AWS SES Configuration
const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY || "",
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || "",
  },
  region: process.env.SES_REGION || "",
};

const sesClient = new SESClient(SES_CONFIG);

// Interface to define the parameters required for sending a registration email
interface SendRegisterMailParams {
  templateName: string;
  recipientEmail: string;
  name: string;
  link: string;
}

interface SendVerificationMailParams {
  templateName: string;
  recipientEmail: string;
  otp: string;
}

// Function to send a registration email using AWS SES
export const sendRegisterMail = async ({
  templateName,
  recipientEmail,
  name,
  link,
}: SendRegisterMailParams): Promise<void> => {
  // Prepare the input for sending the templated email
  const sendTemplatedEmailInput: SendTemplatedEmailCommandInput = {
    Source: process.env.SES_EMAIL || "", // Sender email address from environment variable
    Destination: {
      ToAddresses: [recipientEmail], // Recipient email addresses
    },
    Template: templateName, // Template name defined in AWS SES
    TemplateData: JSON.stringify({
      name: name,
      link: link,
    }),
  };

  try {
    // Send the templated email using SES client
    const response = await sesClient.send(
      new SendTemplatedEmailCommand(sendTemplatedEmailInput)
    );

    // console.log("Email has been sent!");
  } catch (error) {
    console.log("Error sending email", error);
  }
};

// Function to send a verification email using AWS SES
export const sendVerificationMail = async ({
  templateName,
  recipientEmail,
  otp,
}: SendVerificationMailParams): Promise<void> => {
  // Prepare the input for sending the templated email
  const sendTemplatedEmailInput: SendTemplatedEmailCommandInput = {
    Source: process.env.SES_EMAIL || "", // Sender email address from environment variable
    Destination: {
      ToAddresses: [recipientEmail], // Recipient email addresses
    },
    Template: templateName, // Template name defined in AWS SES
    TemplateData: JSON.stringify({
      otp: otp,
    }),
  };

  console.log(sendTemplatedEmailInput);

  try {
    // Send the templated email using SES client
    const response = await sesClient.send(
      new SendTemplatedEmailCommand(sendTemplatedEmailInput)
    );

    console.log(response);

    // console.log("Email has been sent!");
  } catch (error) {
    console.log("Error sending email", error);
  }
};

export const askForSampleMail = async ({
  templateName,
  recipientEmail,
  link,
}: {
  templateName: string;
  recipientEmail: string;
  link: string;
}): Promise<void> => {
  const sendTemplatedEmailInput: SendTemplatedEmailCommandInput = {
    Source: process.env.SES_EMAIL || "", // Sender email address from environment variable
    Destination: {
      ToAddresses: [recipientEmail], // Recipient email addresses
    },
    Template: templateName, // Template name defined in AWS SES
    TemplateData: JSON.stringify({
      link: link,
    }),
  };

  console.log(sendTemplatedEmailInput);

  try {
    // Send the templated email using SES client
    const response = await sesClient.send(
      new SendTemplatedEmailCommand(sendTemplatedEmailInput)
    );

    console.log(response);

    // console.log("Email has been sent!");
  } catch (error) {
    console.log("Error sending email", error);
  }
};

// Function to send a recovery email using AWS SES
export const sendRecoveryMail = async ({
  templateName,
  recipientEmail,
  name,
  link,
}: SendRegisterMailParams): Promise<void> => {
  // Prepare the input for sending the templated email
  const sendTemplatedEmailInput: SendTemplatedEmailCommandInput = {
    Source: process.env.SES_EMAIL || "", // Sender email address from environment variable
    Destination: {
      ToAddresses: [recipientEmail], // Recipient email addresses
    },
    Template: templateName, // Template name defined in AWS SES
    TemplateData: JSON.stringify({
      name: name,
      link: link,
    }),
  };

  try {
    // Send the templated email using SES client
    const response = await sesClient.send(
      new SendTemplatedEmailCommand(sendTemplatedEmailInput)
    );

    // console.log("Email has been sent!");
  } catch (error) {
    console.log("Error sending email", error);
  }
};

// askForSampleTemplate("askForSampleTemplate");
// export const askForSampleTemplate = async (template_name: string) => {
//   const createTemplateCommand = new CreateTemplateCommand({
//     Template: {
//       TemplateName: template_name,
//       HtmlPart: `<!DOCTYPE html>
// <html lang="en" >
// <head>
//   <meta charset="UTF-8">
//   <title>Manufacturing Adda - Asked For Sample</title>
// </head>
// <body>
// <!-- partial:index.partial.html -->
// <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
//   <div style="margin:50px auto;width:70%;padding:20px 0">
//     <div style="border-bottom:1px solid #eee">
//       <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Manufacturing Adda</a>
//     </div>
//     <p style="font-size:1.1em">Hello,</p>
//     <p>Thank you for choosing Manufacturing Adda. Use the following Link to the profile of user to contact</p>
//     <a href="{{link}}" style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">{{link}}</a>
//     <p style="font-size:0.9em;">Regards,<br />Manufacturing Adda</p>
//     <hr style="border:none;border-top:1px solid #eee" />
//     <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
//       <p>Manufacturing Adda Inc</p>
//       <p>Pimpri Chinchwad</p>
//       <p>Pune</p>
//     </div>
//   </div>
// </div>
// <!-- partial -->

// </body>
// </html>
// `,
//       TextPart: `Hello,

// Thank you for choosing Manufacturing Adda. Please use the following Link to the user Profile.

// Link: {{link}}

// Regards,
// Hrishikesh Namade
// Manufacturing Adda Inc
// Pimpri Chinchwad, Pune`,
//       SubjectPart: "Manufacturing Adda - Asked For Sample",
//     },
//   });

//   try {
//     const res = await sesClient.send(createTemplateCommand);
//     console.log("Template has been created!", res);
//   } catch (e) {
//     console.log(e);
//   }
// };

// verificationAccountTemplate("newverificationAccountTemplate");
// export const verificationAccountTemplate = async (template_name: string) => {
//   const createTemplateCommand = new CreateTemplateCommand({
//     Template: {
//       TemplateName: template_name,
//       HtmlPart: `<!DOCTYPE html>
// <html lang="en" >
// <head>
//   <meta charset="UTF-8">
//   <title>Manufacturing Adda - OTP Verification</title>
// </head>
// <body>
// <!-- partial:index.partial.html -->
// <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
//   <div style="margin:50px auto;width:70%;padding:20px 0">
//     <div style="border-bottom:1px solid #eee">
//       <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Manufacturing Adda</a>
//     </div>
//     <p style="font-size:1.1em">Hello,</p>
//     <p>Thank you for choosing Manufacturing Adda. Use the following OTP to complete your validation Procedure. OTP is valid for 5 minutes</p>
//     <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">{{otp}}</h2>
//     <p style="font-size:0.9em;">Regards,<br />Manufacturing Adda</p>
//     <hr style="border:none;border-top:1px solid #eee" />
//     <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
//       <p>Manufacturing Adda Inc</p>
//       <p>Pimpri Chinchwad</p>
//       <p>Pune</p>
//     </div>
//   </div>
// </div>
// <!-- partial -->

// </body>
// </html>
// `,
//       TextPart: `Hello,

// Thank you for choosing Manufacturing Adda. Please use the following OTP to complete your Verification procedure.

// OTP: {{otp}}

// Regards,
// Hrishikesh Namade
// Manufacturing Adda Inc
// Pimpri Chinchwad, Pune`,
//       SubjectPart: "Manufacturing Adda - Verification Page",
//     },
//   });

//   try {
//     const res = await sesClient.send(createTemplateCommand);
//     console.log("Template has been created!", res);
//   } catch (e) {
//     console.log(e);
//   }
// };

// recoveryAccountTemplate("recoveryAccountTemplate");
// export const recoveryAccountTemplate = async (template_name: string) => {
//   const createTemplateCommand = new CreateTemplateCommand({
//     Template: {
//       TemplateName: template_name,
//       HtmlPart: `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <title>Manufacturing Adda - Recovery Page</title>
//   </head>
//   <body>
//     <!-- partial:index.partial.html -->
//     <div
//       style="
//         font-family: Helvetica, Arial, sans-serif;
//         min-width: 1000px;
//         overflow: auto;
//         line-height: 2;
//       "
//     >
//       <div style="margin: 50px auto; width: 70%; padding: 20px 0">
//         <div style="border-bottom: 1px solid #eee">
//           <a
//             href=""
//             style="
//               font-size: 1.4em;
//               color: #00466a;
//               text-decoration: none;
//               font-weight: 600;
//             "
//             >Manufacturing Adda</a
//           >
//         </div>
//         <p style="font-size: 1.1em">Hi {{name}},</p>
//         <p>
//           Thank you for choosing Manufacturing Adda. Please use the following
//           link to complete your recovery procedure.
//         </p>
//         <a
//           style="
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             flex-wrap: wrap;
//             background: #f1f1f1;
//             margin: 0 auto;
//             width: max-content;
//             padding: 0 10px;
//             border-radius: 4px;
//           "
//           href="{{link}}"
//         >
//           {{link}}
//         </a>
//         <p style="font-size: 0.9em">Regards,<br />Hrishikesh Namade</p>
//         <hr style="border: none; border-top: 1px solid #eee" />
//         <div
//           style="
//             float: right;
//             padding: 8px 0;
//             color: #aaa;
//             font-size: 0.8em;
//             line-height: 1;
//             font-weight: 300;
//           "
//         >
//           <p>Manufacturing Adda Inc</p>
//           <p>Pimpri Chinchwad</p>
//           <p>Pune</p>
//         </div>
//       </div>
//     </div>
//     <!-- partial -->
//   </body>
// </html>
// `,
//       TextPart: `Hi {{name}},

// Thank you for choosing Manufacturing Adda. Please use the following link to complete your recovery procedure.

// Link: {{link}}

// Regards,
// Hrishikesh Namade
// Manufacturing Adda Inc
// Pimpri Chinchwad, Pune`,
//       SubjectPart: "Manufacturing Adda - Recovery Page",
//     },
//   });

//   try {
//     const res = await sesClient.send(createTemplateCommand);
//     console.log("Template has been created!", res);
//   } catch (e) {
//     console.log(e);
//   }
// };

// createAccountTemplate("createAccountTemplate");
// export const createAccountTemplate = async (template_name: string) => {
//   const createTemplateCommand = new CreateTemplateCommand({
//     Template: {
//       TemplateName: template_name,
//       HtmlPart: `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <title>Manufacturing Adda - Registration/Validation Page</title>
//   </head>
//   <body>
//     <!-- partial:index.partial.html -->
//     <div
//       style="
//         font-family: Helvetica, Arial, sans-serif;
//         min-width: 1000px;
//         overflow: auto;
//         line-height: 2;
//       "
//     >
//       <div style="margin: 50px auto; width: 70%; padding: 20px 0">
//         <div style="border-bottom: 1px solid #eee">
//           <a
//             href=""
//             style="
//               font-size: 1.4em;
//               color: #00466a;
//               text-decoration: none;
//               font-weight: 600;
//             "
//             >Manufacturing Adda</a
//           >
//         </div>
//         <p style="font-size: 1.1em">Hi {{name}},</p>
//         <p>
//           Thank you for choosing Manufacturing Adda. Please use the following
//           link to complete your registration procedure.
//         </p>
//         <a
//           style="
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             flex-wrap: wrap;
//             background: #f1f1f1;
//             margin: 0 auto;
//             width: max-content;
//             padding: 0 10px;
//             border-radius: 4px;
//           "
//           href="{{link}}"
//         >
//           {{link}}
//         </a>
//         <p style="font-size: 0.9em">Regards,<br />Hrishikesh Namade</p>
//         <hr style="border: none; border-top: 1px solid #eee" />
//         <div
//           style="
//             float: right;
//             padding: 8px 0;
//             color: #aaa;
//             font-size: 0.8em;
//             line-height: 1;
//             font-weight: 300;
//           "
//         >
//           <p>Manufacturing Adda Inc</p>
//           <p>Pimpri Chinchwad</p>
//           <p>Pune</p>
//         </div>
//       </div>
//     </div>
//     <!-- partial -->
//   </body>
// </html>
// `,
//       TextPart: `Hi {{name}},

// Thank you for choosing Manufacturing Adda. Please use the following link to complete your registration procedure.

// Link: {{link}}

// Regards,
// Hrishikesh Namade
// Manufacturing Adda Inc
// Pimpri Chinchwad, Pune`,
//       SubjectPart: "Manufacturing Adda - Registration/Validation Page",
//     },
//   });

//   try {
//     const res = await sesClient.send(createTemplateCommand);
//     console.log("Template has been created!", res);
//   } catch (e) {
//     console.log(e);
//   }
// };
