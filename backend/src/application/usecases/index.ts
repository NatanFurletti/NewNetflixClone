// src/application/usecases/index.ts
export { RegisterUserUseCase } from "./RegisterUser";
export { LoginUseCase } from "./Login";
export { RefreshTokenUseCase } from "./RefreshToken";
export { CreateProfileUseCase } from "./CreateProfile";
export { GetProfilesUseCase } from "./GetProfiles";
export { AddToWatchlistUseCase } from "./AddToWatchlist";
export { RemoveFromWatchlistUseCase } from "./RemoveFromWatchlist";
export { GetWatchlistItemsUseCase } from "./GetWatchlistItems";
export {
  GetTrendingMoviesUseCase,
  type ICacheService,
  type ITmdbClient,
} from "./GetTrendingMovies";
