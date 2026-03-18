import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || req.body?.request_id || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ` +
      `Status: ${res.statusCode} - Duration: ${duration}ms`
    );
  });
  
  next();
}

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  console.error(err.stack);
  next(err);
}
