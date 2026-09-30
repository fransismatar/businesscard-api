import Joi from "joi";

export const phoneSchema = Joi.string()
  .pattern(/^0[0-9]{1,2}-?\s?[0-9]{3}\s?[0-9]{4}$/)
  .required()
  .messages({ "string.pattern.base": "phone must be a valid Israeli phone number" });

export const emailSchema = Joi.string().trim().lowercase().email().required();

export const imageSchema = Joi.object({
  url: Joi.string().uri().allow(""),
  alt: Joi.string().max(256).allow(""),
});

export const addressSchema = Joi.object({
  state: Joi.string().max(256).allow(""),
  country: Joi.string().min(2).max(256).required(),
  city: Joi.string().min(2).max(256).required(),
  street: Joi.string().min(2).max(256).required(),
  houseNumber: Joi.number().integer().min(1).required(),
  zip: Joi.number().integer().min(0),
}).required();
