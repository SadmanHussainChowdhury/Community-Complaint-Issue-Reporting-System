'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, Sparkles, Users, Building } from 'lucide-react'

// Prevent static generation for this page
export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Ultra-Premium Header Section */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-glow-pulse">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur opacity-50 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-6 text-premium animate-slide-up">
            Welcome Back
          </h1>

          <p className="text-xl text-gray-600 mb-4 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Sign in to access your dashboard
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Building className="h-4 w-4" />
            <span className="font-medium">CommunityHub Platform</span>
          </div>
        </div>

        {/* Premium Form Card */}
        <div className="card-premium animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input pl-12"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input pl-12 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Premium Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full btn-lg group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Access Dashboard
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Premium Footer Links */}
        <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-success" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Premium Security</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-primary" />
              <span>10,000+ Users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

