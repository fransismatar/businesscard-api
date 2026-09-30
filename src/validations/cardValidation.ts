import Joi from "joi";
import { addressSchema, emailSchema, imageSchema, phoneSchema } from "./sharedValidation.js";

const cardSchema = Joi.object({
  title: Joi.string().min(2).max(256).required(),
  subtitle: Joi.string().min(2).max(256).required(),
  description: Joi.string().min(2).max(1024).required(),
  phone: phoneSchema,
  email: emailSchema,
  web: Joi.string().uri().allow(""),
  image: imageSchema,
  address: addressSchema,
});

export const createCardSchema = cardSchema;
export const updateCardSchema = cardSchema;

export const bizNumberSchema = Joi.object({
  bizNumber: Joi.number().integer().min(1000000).max(9999999).required(),
});
