import express from "express";
import config from "./config/env.js";
import logger from "./logger/logger.js";
import connectToDb from "./database/connectToDb.js";
import seedDatabase from "./database/seed.js";
import corsMiddleware from "./middleware/cors.js";
import requestLogger from "./middleware/requestLogger.js";
import usersRouter from "./routes/usersRouter.js";
import cardsRouter from "./routes/cardsRouter.js";
import AppError from "./error/AppError.js";
import errorHandler from "./error/errorHandler.js";

const app = express();

app.use(requestLogger);
app.use(corsMiddleware);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Business Cards API is running");
});

app.use("/users", usersRouter);
app.use("/cards", cardsRouter);

app.use((req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToDb();
    await seedDatabase();

    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    logger.fatal({ err }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
