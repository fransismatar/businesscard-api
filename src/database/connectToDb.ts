import mongoose from "mongoose";
import config from "../config/env.js";
import logger from "../logger/logger.js";

const connectToDb = async () => {
  await mongoose.connect(config.mongoUri);
  logger.info(`Connected to MongoDB (${config.nodeEnv})`);

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });
};

export default connectToDb;
