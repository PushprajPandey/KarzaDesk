import type { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
      "user-agent": req.headers["user-agent"],
    },
    ip: req.ip || req.connection.remoteAddress,
  });

  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
    );

    if (res.statusCode >= 400) {
      console.error(`Error Response:`, {
        statusCode: res.statusCode,
        body: body,
        duration: `${duration}ms`,
      });
    }

    return originalSend.call(this, body);
  };

  next();
};
