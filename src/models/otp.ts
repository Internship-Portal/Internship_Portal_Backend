import { model, Schema, Document } from "mongoose";

// --------------------------- OTP Interface

export interface OTP extends Document {
  user_id: string;
  user: string;
  otp: number;
  otpverified: boolean;
  expiresAt: Date;
}

// --------------------------- OTP Interface

// --------------------------- OTP Schema

const otpSchema = new Schema<OTP>({
  user_id: {
    type: String,
    required: true,
  },
  user: {
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

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --------------------------- OTP Schema

// --------------------------- OTP Model
const otpModel = model<OTP>("otp", otpSchema);

export default otpModel;
