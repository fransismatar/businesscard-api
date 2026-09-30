import { RequestHandler } from "express";
import logger from "../logger/logger.js";
import getFileLogger from "../logger/fileLogger.js";

const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    if (res.statusCode < 400) return;

    const entry = {
      date: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      message: res.locals.errorMessage ?? res.statusMessage,
      responseTime: Date.now() - start,
    };

    const level = res.statusCode >= 500 ? "error" : "warn";
    logger[level](entry, "Request failed");
    getFileLogger()[level](entry, "Request failed");
  });

  next();
};

export default requestLogger;
