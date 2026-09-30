import Joi from "joi";
import { addressSchema, emailSchema, imageSchema, phoneSchema } from "./sharedValidation.js";

const nameSchema = Joi.object({
  first: Joi.string().min(2).max(256).required(),
  middle: Joi.string().max(256).allow(""),
  last: Joi.string().min(2).max(256).required(),
}).required();

const passwordSchema = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*\-_]).{8,20}$/)
  .required()
  .messages({
    "string.pattern.base":
      "password must be 8-20 characters and contain an uppercase letter, a lowercase letter, a number and one of !@#$%^&*-_",
  });

export const registerUserSchema = Joi.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  password: passwordSchema,
  image: imageSchema,
  address: addressSchema,
  isBusiness: Joi.boolean(),
});

export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: nameSchema,
  phone: phoneSchema,
  image: imageSchema,
  address: addressSchema,
});
