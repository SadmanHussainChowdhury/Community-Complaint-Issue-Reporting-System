'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, Sparkles, Users, Building } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        // Force a page refresh to establish session properly
        router.refresh()
        // Redirect to homepage which will handle role-based dashboard redirect
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Morphing Blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-morph"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-morph animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-morph animation-delay-4000"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-pink-400 rounded-full opacity-45 animate-float animation-delay-3000"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-40"></div>
      </div>

      {/* Trust Indicators */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 text-sm text-gray-500 animate-fade-in">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Premium Security</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-purple-500" />
          <span>10,000+ Users</span>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-premium animate-glow-pulse relative overflow-hidden">
                <Lock className="h-12 w-12 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                <div className="absolute -inset-1 bg-gradient-primary rounded-3xl opacity-50 animate-pulse-glow"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce-gentle">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="gradient-text-cosmic animate-text-glow">Welcome Back</span>
          </h1>

          <p className="text-xl text-gray-600 font-medium mb-2">
            Sign in to access your dashboard
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Building className="h-4 w-4" />
            <span>CommunityHub Platform</span>
          </div>
        </div>

        {/* Premium Form Card */}
        <div className="glass-card animate-slide-up p-8 relative overflow-hidden">
          {/* Card Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 transition-colors group-focus-within:text-primary-600">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-14 pr-5 py-5 rounded-2xl border-2 border-gray-200/60 bg-white/70 backdrop-blur-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white/90 transition-all duration-300 text-base font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder="your.email@example.com"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3 transition-colors group-focus-within:text-primary-600">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-14 pr-14 py-5 rounded-2xl border-2 border-gray-200/60 bg-white/70 backdrop-blur-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:bg-white/90 transition-all duration-300 text-base font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder="Enter your secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center hover:scale-110 transition-transform"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-px font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <div className="relative flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-5 px-6 text-lg transition-all group-hover:scale-[1.02] group-active:scale-[0.98]">
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                      <span>Access Dashboard</span>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </div>

        {/* Enhanced Footer Links */}
        <div className="text-center space-y-4 animate-fade-in-delayed">
          <div className="flex items-center justify-center space-x-1 text-gray-600">
            <span className="text-sm">New to our community?</span>
            <Link
              href="/auth/register"
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors relative group"
            >
              Create a resident account
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>🔒 Secure Login</span>
            <span>•</span>
            <span>⚡ NextAuth Powered</span>
            <span>•</span>
            <span>🛡️ Enterprise Security</span>
          </div>
        </div>
      </div>
    </div>
  )
}

