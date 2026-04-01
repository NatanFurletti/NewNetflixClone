"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthResponse } from "@/types";
import apiClient from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom event for logout
export const logoutEvent = new Event("auth-logout");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Restore user from token (in real app, verify token validity)
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            localStorage.removeItem("user");
          }
        }
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for logout events from API client or other sources
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => window.removeEventListener("auth-logout", handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Validate tokens exist
      if (!access_token || !refresh_token) {
        throw new Error("Token não recebido da API");
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      
      // Only store user if it exists
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", {
        email,
        password,
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Validate tokens exist
      if (!access_token || !refresh_token) {
        throw new Error("Token não recebido da API");
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      
      // Only store user if it exists
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    // Dispatch event for other listeners
    window.dispatchEvent(new Event("auth-logout"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
