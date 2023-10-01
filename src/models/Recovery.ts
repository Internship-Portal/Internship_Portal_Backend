import { model, Schema } from "mongoose";
import { recovery } from "../interfaces/Recovery";

// --------------------------- Recovery Schema

const recoverySchema = new Schema<recovery>({
  user_id: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  userverified: {
    type: Boolean,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

recoverySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --------------------------- Recovery Schema

// --------------------------- Recovery Model
const recoveryModel = model<recovery>("Recovery", recoverySchema);

export default recoveryModel;
