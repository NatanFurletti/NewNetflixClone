// src/interfaces/http/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '@/application/services/TokenService';
import { UnauthorizedError } from '@/domain/errors/DomainError';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(jwtAccessSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token não fornecido');
      }

      const token = authHeader.substring(7);

      const decoded = TokenService.validateToken(token, jwtAccessSecret);

      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Token inválido');
      }

      req.userId = decoded.sub;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          error: error.message,
          code: error.code,
        });
      } else {
        res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }
    }
  };
}
