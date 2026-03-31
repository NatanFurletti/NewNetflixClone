// src/interfaces/http/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError';

/**
 * Mapeia DomainError para HTTP status codes
 */
const errorStatusMap: Record<string, number> = {
  INVALID_EMAIL: 400,
  WEAK_PASSWORD: 400,
  USER_NOT_FOUND: 404,
  PROFILE_NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_MEDIA_TYPE: 400,
  DUPLICATE_ITEM: 409,
};

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // Handle DomainError
  if (err instanceof DomainError) {
    const statusCode = errorStatusMap[err.code] || 400;
    res.status(statusCode).json({
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle validation errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid request body',
      code: 'INVALID_REQUEST',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
  });
}
