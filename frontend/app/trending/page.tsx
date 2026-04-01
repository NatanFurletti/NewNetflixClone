"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import apiClient from "@/lib/api/client";
import { Movie } from "@/types";
import toast from "react-hot-toast";

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  const fetchTrendingMovies = async () => {
    try {
      const response = await apiClient.get<Movie[]>("/trending");
      setMovies(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to load trending movies";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading trending movies...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      {movies.length > 0 && (
        <div className="relative h-96 bg-gradient-to-b from-gray-900 to-black">
          <div className="absolute inset-0 opacity-30 bg-black" />
          <div className="relative h-full flex items-end pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {movies[0].title}
              </h1>
              <p className="text-gray-300 text-lg line-clamp-3 mb-6">
                {movies[0].overview}
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition">
                  ▶ Watch Now
                </button>
                <button className="px-8 py-3 bg-gray-600 bg-opacity-50 text-white font-bold rounded hover:bg-opacity-75 transition">
                  ℹ More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Trending Now</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group cursor-pointer relative aspect-video bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition transform"
            >
              {movie.poster_path ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:brightness-75 transition"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                  No Image
                </div>
              )}

              {/* Hover Info */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-80 flex flex-col justify-end p-4 transition">
                <h3 className="text-white font-bold line-clamp-2 mb-2">
                  {movie.title}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                  {movie.overview}
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <span>⭐ {movie.vote_average.toFixed(1)}</span>
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
