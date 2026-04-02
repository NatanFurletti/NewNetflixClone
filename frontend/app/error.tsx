"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-white text-lg mb-6">Something went wrong</p>
        <p className="text-gray-400 mb-8">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
