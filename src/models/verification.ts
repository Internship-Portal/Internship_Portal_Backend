import { model, Schema, Document } from "mongoose";

// --------------------------- verification Interface

export interface verification extends Document {
  user_token: string;
  user: string;
  otp: number;
  otpverified: boolean;
  expiresAt: Date;
}

// --------------------------- verification Interface

// --------------------------- verification Schema

const verificationSchema = new Schema<verification>({
  user_token: {
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

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --------------------------- verification Schema

// --------------------------- verification Model
const verificationModel = model<verification>(
  "verification",
  verificationSchema
);

export default verificationModel;
