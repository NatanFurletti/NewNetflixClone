// src/interfaces/controllers/ProfileController.ts
import { Request, Response } from 'express';
import { CreateProfileUseCase } from '@/application/usecases/CreateProfile';
import { GetProfilesUseCase } from '@/application/usecases/GetProfiles';

export class ProfileController {
  constructor(
    private createProfileUseCase: CreateProfileUseCase,
    private getProfilesUseCase: GetProfilesUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;
    const { name, avatarUrl, isKids } = req.body;

    const result = await this.createProfileUseCase.execute({
      userId,
      name,
      avatarUrl,
      isKids,
    });

    res.status(201).json(result);
  }

  async list(req: Request, res: Response): Promise<void> {
    const userId = req.userId!;

    const result = await this.getProfilesUseCase.execute({
      userId,
    });

    res.status(200).json(result);
  }
}
