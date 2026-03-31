// src/interfaces/http/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
