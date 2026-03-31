// src/infrastructure/external/TmdbClient.ts
import axios, { AxiosInstance } from 'axios';

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

export interface TmdbTrailer {
  key: string;
  type: string;
  site: string;
}

export class TmdbClient {
  private client: AxiosInstance;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(bearerToken: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: 5000, // 5 second timeout
    });
  }

  /**
   * Busca filmes em tendência
   */
  async getTrendingMovies(): Promise<TmdbMovie[]> {
    try {
      const response = await this.client.get('/trending/movie/day', {
        params: {
          language: 'pt-BR',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw new Error('Failed to fetch trending movies from TMDB');
    }
  }

  /**
   * Busca detalhes de um filme
   */
  async getMovieDetails(movieId: number): Promise<TmdbMovie | null> {
    try {
      const response = await this.client.get(`/movie/${movieId}`, {
        params: {
          language: 'pt-BR',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      return null;
    }
  }

  /**
   * Busca trailers de um filme
   */
  async getMovieTrailers(movieId: number): Promise<TmdbTrailer[]> {
    try {
      const response = await this.client.get(`/movie/${movieId}/videos`, {
        params: {
          language: 'pt-BR',
        },
      });

      return response.data.results?.filter((v: TmdbTrailer) => v.site === 'YouTube') || [];
    } catch (error) {
      console.error(`Error fetching trailers for movie ${movieId}:`, error);
      return [];
    }
  }

  /**
   * Busca filmes por termo
   */
  async searchMovies(query: string, page: number = 1): Promise<TmdbMovie[]> {
    try {
      const response = await this.client.get('/search/movie', {
        params: {
          query,
          language: 'pt-BR',
          page,
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error(`Error searching movies for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Busca séries em tendência
   */
  async getTrendingTvShows(): Promise<any[]> {
    try {
      const response = await this.client.get('/trending/tv/day', {
        params: {
          language: 'pt-BR',
        },
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      return [];
    }
  }
}
