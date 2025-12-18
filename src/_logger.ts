import { env } from "@env";
import { EventEmitter } from "events";
import pino from "pino";

// In-memory log storage for debug page
const MAX_LOGS = 1000;
const logBuffer: string[] = [];

// Event emitter for real-time log streaming
export const logEmitter = new EventEmitter();

// Create base logger with hooks to capture logs
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  hooks: {
    logMethod(inputArgs, method, level) {
      // Capture the log before it's written
      const logObj: Record<string, unknown> = {};

      // Add level and timestamp
      logObj.level = level;
      logObj.time = Date.now();

      // Handle different argument patterns
      if (inputArgs.length === 0) {
        logObj.msg = "";
      } else if (inputArgs.length === 1) {
        if (typeof inputArgs[0] === "string") {
          // logger.info("message")
          logObj.msg = inputArgs[0];
        } else {
          // logger.info({ data })
          Object.assign(logObj, inputArgs[0]);
          logObj.msg = logObj.msg || "";
        }
      } else if (inputArgs.length >= 2) {
        if (typeof inputArgs[0] === "object" && inputArgs[0] !== null) {
          // logger.info({ data }, "message")
          Object.assign(logObj, inputArgs[0]);
          logObj.msg = inputArgs[1];
        } else {
          // logger.info("message", "extra")
          logObj.msg = inputArgs[0];
          if (inputArgs.length === 2) {
            logObj.extra = inputArgs[1];
          } else {
            logObj.args = inputArgs.slice(1);
          }
        }
      }

      // Convert to JSON string
      const logLine = JSON.stringify(logObj);

      // Store in buffer
      logBuffer.push(logLine);
      if (logBuffer.length > MAX_LOGS) {
        logBuffer.shift();
      }

      // Emit for real-time streaming
      logEmitter.emit("log", logLine);

      // Call the original method
      return method.apply(this, inputArgs);
    },
  },
});

// Export function to get logs
export function getLogs(): string[] {
  return [...logBuffer];
}

// Export function to clear logs
export function clearLogs(): void {
  logBuffer.length = 0;
  logEmitter.emit("clear");
}

// Log startup message
logger.info(`Logger initialized in ${env.NODE_ENV} mode`);
