import cors from "cors";
import config from "../config/env.js";
import AppError from "../error/AppError.js";

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new AppError(403, `Origin ${origin} is not allowed by CORS`));
  },
});

export default corsMiddleware;
