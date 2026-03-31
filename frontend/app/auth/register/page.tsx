'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await register(email, password)
      toast.success('Account created! Redirecting to dashboard...')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black bg-opacity-75 p-8 rounded-lg">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-red-600 mb-8 text-center">
          NETFLIX
        </h1>

        <h2 className="text-white text-2xl font-bold mb-6">Create Account</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-600 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
