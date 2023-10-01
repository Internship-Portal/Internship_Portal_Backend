import { model, Schema } from "mongoose";
import { verification } from "../interfaces/Verification";

// --------------------------- verification Schema

const verificationSchema = new Schema<verification>({
  email_id: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpverified: {
    type: Boolean,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --------------------------- verification Schema

// --------------------------- verification Model
const verificationModel = model<verification>(
  "verification",
  verificationSchema
);

export default verificationModel;
