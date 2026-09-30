import fs from "fs";
import path from "path";
import pino, { Logger } from "pino";

const LOGS_DIR = path.resolve("logs");

let current: { date: string; logger: Logger } | null = null;

const getFileLogger = () => {
  const date = new Date().toISOString().slice(0, 10);

  if (current?.date !== date) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    const destination = pino.destination({ dest: path.join(LOGS_DIR, `${date}.log`), sync: true });
    current = { date, logger: pino({ base: null, timestamp: false }, destination) };
  }

  return current.logger;
};

export default getFileLogger;
