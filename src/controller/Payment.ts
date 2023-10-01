import { Response, Request } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

import paymentModel from "../models/Payment";
import {
  orderInterface,
  paymentInterface,
  verifyInterface,
} from "../interfaces/Payment";
import { createPaymentIndexing } from "../utils/Indexing";

export const order = async (req: Request, res: Response) => {
  try {
    const { amount, emailID }: orderInterface = req.body;

    // Initializing Razorpay client with API keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Generating a random number for the receipt ID
    const min = 10000000;
    const max = 99999999;
    const randomNum = Math.floor(Math.random() * (max - min + 1) + min);

    // Creating options object for Razorpay order creation
    var options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `order_rcptid_${randomNum}`, // unique receipt ID for the order
    };

    // Creating the order on Razorpay server
    razorpay.orders.create(options, async function (err: any, order: any) {
      if (err) {
        // Error
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }

      // Creating a payment record in the database for the order
      const payment: paymentInterface = await paymentModel.create({
        amount: options.amount / 100, // Converting back to currency unit (rupees)
        currency: order.currency,
        receipt: order.receipt,
        id: order.id,
        paymentDate: new Date(),
        emailId: emailID,
        signature: null,
        paymentId: null,
        status: "Order Not Verified", // Initial status for the payment
        orderId: null,
      });

      // Creating indexing for the payment record (not shown in the provided code)
      createPaymentIndexing(payment);

      if (payment.emailId !== null) {
        // Success
        return res
          .status(200)
          .json({ message: "Order Created", data: { id: payment.id } });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, emailID, id }: verifyInterface =
      req.body;

    // Generating signature based on orderId and paymentId using HMAC-SHA256 algorithm
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Comparing the generated signature with the received signature for verification
    if (generatedSignature !== signature) {
      // Error
      return res.status(400).json({
        message: "Invalid Payment Request",
      });
    }

    // Finding the payment record based on the provided 'id'
    const payment = await paymentModel.findOne({
      id: id,
    });

    if (!payment) {
      // Error
      return res.status(400).json({
        message: "Invalid Payment Request",
      });
    } else {
      // Updating the payment record with the verified payment details
      payment.status = "Payment Successfully Verified";
      payment.paymentDate = new Date();
      payment.paymentId = paymentId;
      payment.orderId = orderId;
      payment.signature = signature;

      // Saving the updated payment record
      const savedPayment = await payment.save();

      if (savedPayment.signature) {
        // Success
        return res.status(200).json({
          message: "Payment Successful",
          data: { id: savedPayment.id },
        });
      } else {
        // Error
        return res.status(400).json({
          message: "Invalid Payment Request",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};
