import pino from "pino";
import config from "../config/env.js";

const logger = pino({
  level: config.isProduction ? "info" : "debug",
  transport: config.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

export default logger;
