import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth";
import { Toaster } from "react-hot-toast";
import React from "react";

export const metadata: Metadata = {
  title: "Netflix Clone - Watch Movies & TV Shows",
  description: "Stream your favorite movies and TV shows on Netflix Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-black to-gray-900">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
