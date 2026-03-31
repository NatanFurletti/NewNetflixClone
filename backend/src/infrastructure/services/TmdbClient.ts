// src/infrastructure/services/TmdbClient.ts
import axios, { AxiosInstance } from 'axios';

export interface MovieResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

export interface TrendingResponse {
  results: MovieResult[];
  page: number;
  total_pages: number;
}

export class TmdbClient {
  private client: AxiosInstance;
  private readonly TIMEOUT_MS = 5000;

  constructor(bearerToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        accept: 'application/json',
      },
      timeout: this.TIMEOUT_MS,
    });
  }

  async getTrendingMovies(page: number = 1): Promise<MovieResult[]> {
    try {
      const response = await this.client.get<TrendingResponse>(
        '/trending/movie/week',
        {
          params: { page },
        }
      );

      return response.data.results;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  }

  async getTrendingTv(page: number = 1): Promise<MovieResult[]> {
    try {
      const response = await this.client.get<TrendingResponse>(
        '/trending/tv/week',
        {
          params: { page },
        }
      );

      return response.data.results;
    } catch (error) {
      console.error('Error fetching trending TV:', error);
      throw error;
    }
  }

  async getMovieDetails(movieId: number): Promise<MovieResult> {
    try {
      const response = await this.client.get<MovieResult>(
        `/movie/${movieId}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${movieId}:`, error);
      throw error;
    }
  }

  async getTvDetails(tvId: number): Promise<MovieResult> {
    try {
      const response = await this.client.get<MovieResult>(
        `/tv/${tvId}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching TV ${tvId}:`, error);
      throw error;
    }
  }

  async search(query: string, type: 'movie' | 'tv' = 'movie'): Promise<MovieResult[]> {
    try {
      const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
      const response = await this.client.get<TrendingResponse>(endpoint, {
        params: { query },
      });

      return response.data.results;
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      throw error;
    }
  }
}
