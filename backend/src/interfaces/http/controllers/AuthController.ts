// src/interfaces/http/controllers/AuthController.ts
import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@/application/usecases/RegisterUser';
import { LoginUseCase } from '@/application/usecases/Login';
import { RefreshTokenUseCase } from '@/application/usecases/RefreshToken';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.registerUserUseCase.execute({
        email,
        password,
      });

      res.status(201).json({
        data: result,
        message: 'Usuário registrado com sucesso',
      });
    } catch (error) {
      throw error;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute({
        email,
        password,
      });

      res.status(200).json({
        data: result,
        message: 'Login realizado com sucesso',
      });
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
      });

      res.status(200).json({
        data: result,
        message: 'Token renovado com sucesso',
      });
    } catch (error) {
      throw error;
    }
  }
}
