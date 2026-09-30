import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import AppError from "./AppError.js";
import logger from "../logger/logger.js";

const getErrorResponse = (err: unknown): { status: number; message: string } => {
  if (err instanceof AppError) {
    return { status: err.statusCode, message: err.message };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, message: `Invalid ${err.path}: ${String(err.value)}` };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return { status: 400, message: err.message };
  }
  if (typeof err === "object" && err !== null) {
    const e = err as { code?: number; type?: string; keyValue?: Record<string, unknown> };
    if (e.code === 11000) {
      const field = Object.keys(e.keyValue ?? {})[0] ?? "field";
      return { status: 409, message: `${field} already exists` };
    }
    if (e.type === "entity.parse.failed") {
      return { status: 400, message: "Invalid JSON body" };
    }
  }
  return { status: 500, message: "Internal server error" };
};

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { status, message } = getErrorResponse(err);

  if (status >= 500) {
    logger.error({ err }, `Unexpected error on ${req.method} ${req.originalUrl}`);
  }

  res.locals.errorMessage = message;
  res.status(status).json({ message });
};

export default errorHandler;
