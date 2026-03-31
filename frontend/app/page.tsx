"use client";

import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-red-600 mb-4">NETFLIX</h1>
        <p className="text-white text-2xl mb-8">
          Watch movies, TV shows and more online
        </p>
        <p className="text-gray-400 text-lg mb-8">
          Ready to watch? Enter your email to create or restart your membership.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-4 flex-col md:flex-row">
        <Link
          href="/auth/login"
          className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-8 py-3 border-2 border-white text-white font-bold rounded hover:bg-white hover:text-black transition"
        >
          Create Account
        </Link>
      </div>

      {/* Features */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-white font-bold mb-2">Stream Anywhere</h3>
          <p className="text-gray-400">
            Watch on your phones, tablets, laptops and TVs
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">⬇️</div>
          <h3 className="text-white font-bold mb-2">Download & Watch</h3>
          <p className="text-gray-400">
            Save your favorites easily and always have something to watch
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-white font-bold mb-2">Create Profiles</h3>
          <p className="text-gray-400">
            Send kids on adventures with their own space
          </p>
        </div>
      </div>
    </div>
  );
}
