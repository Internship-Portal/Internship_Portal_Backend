import { model, Schema, Document } from "mongoose";

// --------------------------- verification Interface

export interface verification extends Document {
  email_id: string;
  otp: number;
  otpverified: boolean;
  expiresAt: Date;
}

// --------------------------- verification Interface

// --------------------------- verification Schema

const verificationSchema = new Schema<verification>({
  email_id: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
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
