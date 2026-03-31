// src/domain/errors/DomainError.ts
/**
 * Base class para erros de domínio
 * Todos os erros de negócio herdam desta classe
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Erro: Email inválido
 */
export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Email inválido: "${email}"`, "INVALID_EMAIL");
    Object.setPrototypeOf(this, InvalidEmailError.prototype);
  }
}

/**
 * Erro: Senha fraca (< 8 chars, sem maiúscula, sem número, etc)
 */
export class WeakPasswordError extends DomainError {
  constructor() {
    super(
      "Senha deve ter no mínimo 8 caracteres, incluir letra maiúscula e número",
      "WEAK_PASSWORD",
    );
    Object.setPrototypeOf(this, WeakPasswordError.prototype);
  }
}

/**
 * Erro: Usuário não encontrado
 */
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`Usuário com ID "${userId}" não foi encontrado`, "USER_NOT_FOUND");
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

/**
 * Erro: Perfil não encontrado
 */
export class ProfileNotFoundError extends DomainError {
  constructor(profileId: string) {
    super(
      `Perfil com ID "${profileId}" não foi encontrado`,
      "PROFILE_NOT_FOUND",
    );
    Object.setPrototypeOf(this, ProfileNotFoundError.prototype);
  }
}

/**
 * Erro: Email duplicado (já existe na base)
 */
export class DuplicateEmailError extends DomainError {
  constructor(email: string) {
    super(`Email "${email}" já está registrado`, "DUPLICATE_EMAIL");
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}

/**
 * Erro: Não autorizado (credenciais inválidas)
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = "Credenciais inválidas") {
    super(message, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Erro: Acesso negado (sem permissão)
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = "Acesso negado") {
    super(message, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Erro: Tipo de mídia inválido
 */
export class InvalidMediaTypeError extends DomainError {
  constructor(mediaType: string) {
    super(
      `Tipo de mídia inválido: "${mediaType}". Apenas "movie" ou "tv" são permitidos`,
      "INVALID_MEDIA_TYPE",
    );
    Object.setPrototypeOf(this, InvalidMediaTypeError.prototype);
  }
}

/**
 * Erro: Item já existe (por exemplo, na watchlist)
 */
export class DuplicateItemError extends DomainError {
  constructor(message: string = "Item já existe") {
    super(message, "DUPLICATE_ITEM");
    Object.setPrototypeOf(this, DuplicateItemError.prototype);
  }
}

/**
 * Erro: Requisição inválida (problema com validação de input)
 */
export class BadRequestError extends DomainError {
  constructor(message: string = "Requisição inválida") {
    super(message, "BAD_REQUEST");
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
