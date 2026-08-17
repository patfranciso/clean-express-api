import { env } from "@/env";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${JSON.stringify(
    message,
    null,
    2
  )}`;
});

const transport: DailyRotateFile = new DailyRotateFile({
  filename: "app-%DATE%.log",
  dirname: "logs",
  datePattern: "YYYY-MM-DD", // -HH-mm
  frequency: "1d",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const testsTransport: DailyRotateFile = new DailyRotateFile({
  filename: "_test-%DATE%.log",
  dirname: "logs",
  datePattern: "YYYY-MM-DD", // -HH-mm
  frequency: "1d",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

transport.on("rotate", function (oldFilename, newFilename) {
  // do something fun
  console.log(
    "File for logger changed from: " + oldFilename + " to " + newFilename
  );
});

export const fileLogger = winston.createLogger({
  format: combine(
    // winston.format.colorize(),
    label({ label: "api" }),
    timestamp(),
    myFormat
  ),
  // format: winston.format.json(),
  transports: [transport, new winston.transports.Console()], // debug
  // transports: [transport],
});
export const cliLogger = winston.createLogger({
  format: combine(
    winston.format.colorize(),
    label({ label: "api" }),
    timestamp(),
    myFormat
  ),
  // format: winston.format.json(),
  // transports: [testsTransport, new winston.transports.Console()],  // debug tests
  transports: [testsTransport], // debug
});

export const logger = env.NODE_ENV !== "test" ? fileLogger : cliLogger;
