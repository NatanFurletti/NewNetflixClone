// src/interfaces/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@/domain/errors/DomainError';

/**
 * Middleware para tratar erros
 * Mapeia DomainError para HTTP status codes
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  // Se for DomainError, usar o código para mapear status HTTP
  if (error instanceof DomainError) {
    const statusMap: Record<string, number> = {
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

    const status = statusMap[error.code] || 500;

    res.status(status).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  // Erro genérico
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
  });
}
