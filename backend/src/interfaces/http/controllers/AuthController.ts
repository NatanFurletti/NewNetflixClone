// src/interfaces/http/controllers/AuthController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { RegisterUserUseCase } from '../../../application/usecases/RegisterUser';
import { LoginUseCase } from '../../../application/usecases/Login';
import { RefreshTokenUseCase } from '../../../application/usecases/RefreshToken';
import { 
  RegisterSchema, 
  LoginSchema, 
  RefreshTokenSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '../../../application/validation/schemas';
import { BadRequestError } from '../../../domain/errors/DomainError';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData: RegisterInput = RegisterSchema.parse(req.body);

      // Register user
      await this.registerUserUseCase.execute({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Auto-login after registration
      const loginResult = await this.loginUseCase.execute({
        email: validatedData.email,
        password: validatedData.password,
      });

      res.status(201).json({
        data: loginResult,
        message: 'Usuário registrado com sucesso',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData: LoginInput = LoginSchema.parse(req.body);

      const result = await this.loginUseCase.execute({
        email: validatedData.email,
        password: validatedData.password,
      });

      res.status(200).json({
        data: result,
        message: 'Login realizado com sucesso',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const tokenData = req.body.refresh_token
        ? { refresh_token: req.body.refresh_token }
        : { refresh_token: req.body.refreshToken };

      const validatedData: RefreshTokenInput = RefreshTokenSchema.parse(tokenData);
      await this.refreshTokenUseCase.revokeToken(validatedData.refresh_token);

      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate input - try refresh_token first, fall back to refreshToken
      const tokenData = req.body.refresh_token 
        ? { refresh_token: req.body.refresh_token }
        : { refresh_token: req.body.refreshToken };
      
      const validatedData: RefreshTokenInput = RefreshTokenSchema.parse(tokenData);
      const token = validatedData.refresh_token;

      const result = await this.refreshTokenUseCase.execute({
        refreshToken: token,
      });

      res.status(200).json({
        data: result,
        message: 'Token renovado com sucesso',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }
}
