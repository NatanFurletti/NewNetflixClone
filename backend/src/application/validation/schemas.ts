// src/application/validation/schemas.ts
import { z } from 'zod';

/**
 * Schemas de validação usando Zod
 * Validam input em controllers e use cases
 */

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(/^[a-zA-Z0-9@$!%*?&]*$/, 'Apenas letras, números e @$!%*?&'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Token obrigatório'),
  refreshToken: z.string().min(1, 'Token obrigatório').optional(),
});

// Profile Schemas
export const CreateProfileSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter mínimo 3 caracteres')
    .max(20, 'Nome muito longo (máximo 20 caracteres)'),
  avatarUrl: z.string().url().optional().nullable(),
  isKids: z.boolean().optional().default(false),
});

// Watchlist Schemas — IDs usam CUID (gerado pelo Prisma), não UUID
export const AddToWatchlistSchema = z.object({
  profileId: z.string().cuid('Profile ID inválido'),
  tmdbId: z.number().int().positive('Filme/série ID inválido'),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1).max(255),
  posterPath: z.string().nullable().optional(),
});

export const RemoveFromWatchlistSchema = z.object({
  watchlistItemId: z.string().cuid('Item ID inválido'),
});

// Query Schemas
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// Export types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;
export type AddToWatchlistInput = z.infer<typeof AddToWatchlistSchema>;
export type RemoveFromWatchlistInput = z.infer<typeof RemoveFromWatchlistSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
