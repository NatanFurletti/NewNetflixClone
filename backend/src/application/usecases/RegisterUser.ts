// src/application/usecases/RegisterUser.ts
import { v4 as uuid } from "uuid";
import { User } from "../../domain/entities/User";
import {
  InvalidEmailError,
  DuplicateEmailError,
} from "../../domain/errors/DomainError";
import { PasswordService } from "../services/PasswordService";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

/**
 * Use Case: Registrar novo usuário
 */
export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<{ id: string; email: string }> {
    // 1. Validar email
    if (!this.isValidEmail(input.email)) {
      throw new InvalidEmailError(input.email);
    }

    // 2. Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new DuplicateEmailError(input.email);
    }

    // 3. Hash password (PasswordService.hash já valida a força internamente)
    const passwordHash = await PasswordService.hash(input.password);

    // 5. Criar user
    const user = User.create(uuid(), input.email, passwordHash);

    // 6. Persistir
    const savedUser = await this.userRepository.create(user);

    // 7. Retornar (sem passwordHash)
    return {
      id: savedUser.id,
      email: savedUser.email,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
