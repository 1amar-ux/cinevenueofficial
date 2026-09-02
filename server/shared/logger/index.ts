type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "jwt",
  "secret",
  "razorpay_signature",
  "keysecret",
  "otp",
  "encryptedaccountnumber"
]);

function sanitize(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      sanitized[key] = sanitize(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class Logger {
  private format(level: LogLevel, message: string, meta?: any, requestId?: string): string {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(requestId ? { requestId } : {}),
      ...(meta ? { meta: sanitize(meta) } : {})
    };
    return JSON.stringify(payload);
  }

  public info(message: string, meta?: any, requestId?: string): void {
    console.log(this.format("INFO", message, meta, requestId));
  }

  public warn(message: string, meta?: any, requestId?: string): void {
    console.warn(this.format("WARN", message, meta, requestId));
  }

  public error(message: string, meta?: any, requestId?: string): void {
    console.error(this.format("ERROR", message, meta, requestId));
  }

  public debug(message: string, meta?: any, requestId?: string): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.format("DEBUG", message, meta, requestId));
    }
  }
}

export const logger = new Logger();
