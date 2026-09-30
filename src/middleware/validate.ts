import { RequestHandler } from "express";
import { ObjectSchema } from "joi";
import AppError from "../error/AppError.js";

const validate =
  (schema: ObjectSchema): RequestHandler =>
  (req, _res, next) => {
    const { error, value } = schema.required().label("request body").validate(req.body, { abortEarly: false });

    if (error) {
      return next(new AppError(400, error.details.map((detail) => detail.message).join(", ")));
    }

    req.body = value;
    next();
  };

export default validate;
