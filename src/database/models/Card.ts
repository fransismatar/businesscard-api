import mongoose from "mongoose";
import { addressSchema, imageSchema } from "./sharedSchemas.js";

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    web: { type: String, default: "", trim: true },
    image: { type: imageSchema, default: () => ({}) },
    address: { type: addressSchema, required: true },
    bizNumber: { type: Number, required: true, unique: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
