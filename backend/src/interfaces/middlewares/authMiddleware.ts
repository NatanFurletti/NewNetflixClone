// src/interfaces/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { TokenService } from "../../application/services/TokenService";
import { UnauthorizedError } from "../../domain/errors/DomainError";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware de autenticação
 * Valida JWT access token do header Authorization
 */
export function authMiddleware(jwtAccessSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authorization token required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = TokenService.validateToken(token, jwtAccessSecret);

      // Validar que é um access token (não refresh)
      if (decoded.type !== "access") {
        throw new UnauthorizedError("Invalid token type");
      }

      req.userId = decoded.sub;
      next();
    } catch (error) {
      res.status(401).json({
        error: "Invalid or expired token",
        code: "UNAUTHORIZED",
      });
    }
  };
}
