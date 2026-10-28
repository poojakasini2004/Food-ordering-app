type LogContext = Record<string, unknown>;

interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: "info" | "warn" | "error", message: string, context?: LogContext) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
};
