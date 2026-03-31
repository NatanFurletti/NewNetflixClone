// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Profile Types
export interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
  isKids: boolean;
  userId: string;
  createdAt: string;
}

export interface CreateProfileRequest {
  name: string;
  avatarUrl?: string;
  isKids?: boolean;
}

// Watchlist Types
export interface WatchlistItem {
  id: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  profileId: string;
  createdAt: string;
}

export interface AddToWatchlistRequest {
  mediaType: "movie" | "tv";
  tmdbId: number;
  profileId: string;
}

// Movie Types from TMDB
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface TrendingMoviesResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
