import mongoose from "mongoose";

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

export const addressSchema = new mongoose.Schema(
  {
    state: { type: String, default: "" },
    country: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    zip: { type: Number, default: 0 },
  },
  { _id: false }
);
