import mongoose from "mongoose";
import { addressSchema, imageSchema } from "./sharedSchemas.js";

const nameSchema = new mongoose.Schema(
  {
    first: { type: String, required: true, trim: true },
    middle: { type: String, default: "", trim: true },
    last: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: nameSchema, required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    image: { type: imageSchema, default: () => ({}) },
    address: { type: addressSchema, required: true },
    isAdmin: { type: Boolean, default: false },
    isBusiness: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    blockedUntil: { type: Date, default: null },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const { password, __v, failedLoginAttempts, blockedUntil, ...user } = ret;
        return user;
      },
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
