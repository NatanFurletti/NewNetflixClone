"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import { Profile } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await apiClient.get<Profile[]>("/profiles");
      setProfiles(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to load profiles";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProfileName.trim()) {
      toast.error("Profile name is required");
      return;
    }

    try {
      await apiClient.post("/profiles", { name: newProfileName });
      toast.success("Profile created!");
      setNewProfileName("");
      setShowCreateForm(false);
      fetchProfiles();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to create profile";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Select a Profile</h2>

      {/* Profiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/dashboard/profile/${profile.id}`}
            className="group"
          >
            <div className="relative aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg overflow-hidden cursor-pointer transform transition group-hover:scale-105">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">{profile.isKids ? "👶" : "👤"}</div>
              </div>
            </div>
            <h3 className="text-white font-semibold mt-2 text-center">
              {profile.name}
            </h3>
          </Link>
        ))}

        {/* Create New Profile */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition group"
        >
          <div className="text-5xl">+</div>
        </button>
      </div>

      {/* Create Profile Form */}
      {showCreateForm && (
        <div className="max-w-md bg-black bg-opacity-75 p-6 rounded-lg border border-gray-700">
          <h3 className="text-white font-bold text-lg mb-4">Add Profile</h3>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Profile name"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none"
              maxLength={20}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trending Movies Link */}
      <div className="mt-12">
        <Link
          href="/trending"
          className="inline-block px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
        >
          Browse Trending Movies
        </Link>
      </div>
    </div>
  );
}
