"use client";

import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black bg-opacity-95 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-red-600">NETFLIX</h1>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/trending"
                className="text-gray-400 hover:text-white transition"
              >
                Trending
              </Link>
              <Link
                href="/dashboard/profiles"
                className="text-gray-400 hover:text-white transition"
              >
                Profiles
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
