'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, User, Shield, Users } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Signed in successfully')
        // Redirect to root page which will handle role-based redirect
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const quickSignIn = async (role: 'admin' | 'staff' | 'resident') => {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      staff: { email: 'staff@example.com', password: 'staff123' },
      resident: { email: 'resident@example.com', password: 'resident123' },
    }

    const creds = credentials[role]
    setFormData(creds)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: creds.email,
        password: creds.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error || 'Failed to sign in. Make sure test users are created.')
      } else {
        toast.success(`Signed in as ${role} successfully`)
        // Redirect based on role
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else if (role === 'staff') {
          router.push('/staff/dashboard')
        } else if (role === 'resident') {
          router.push('/resident/dashboard')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-glow">
              <Lock className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="gradient-text">Welcome Back</span>
          </h2>
          <p className="text-lg text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="premium-card animate-slide-up">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <Lock className="h-5 w-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Sign In Options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">Quick Sign In (Test Accounts)</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => quickSignIn('admin')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Sign in as Admin"
              >
                <Shield className="h-5 w-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-purple-700">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickSignIn('staff')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Sign in as Staff"
              >
                <Users className="h-5 w-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-blue-700">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => quickSignIn('resident')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Sign in as Resident"
              >
                <User className="h-5 w-5 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-green-700">Resident</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Click any button above to sign in with test credentials
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Create one now
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500">
          Secure login powered by NextAuth
        </p>
      </div>
    </div>
  )
}

