import { Request, Response, NextFunction } from 'express';
import { ErrorResponse, ResponseMeta } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const startTime = (req as unknown as { startTime: number }).startTime || Date.now();
  const elapsed_ms = Date.now() - startTime;
  
  const meta: ResponseMeta = {
    request_id: req.body?.request_id || uuidv4(),
    capability: req.body?.capability || 'unknown',
    elapsed_ms
  };

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta
    };
    res.status(400).json(response);
    return;
  }

  // 未知错误
  const response: ErrorResponse = {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
    },
    meta
  };
  res.status(500).json(response);
}
