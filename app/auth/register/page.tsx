'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    apartment: '',
    building: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          apartment: formData.apartment || undefined,
          building: formData.building || undefined,
        }),
      }).catch((fetchError) => {
        console.error('Fetch error:', fetchError)
        throw new Error('Network error. Please check your connection.')
      })

      // Get response text first to check if it's JSON
      const responseText = await res.text()
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Received HTML error page:', responseText.substring(0, 500))
        toast.error('Server error. The registration endpoint may not be available. Please try again later.')
        setLoading(false)
        return
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (jsonError) {
        console.error('JSON parse error. Response:', responseText.substring(0, 200))
        toast.error('Invalid response from server. Please try again.')
        setLoading(false)
        return
      }

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to create account')
        setLoading(false)
        return
      }

      toast.success('Account created successfully! Signing you in...')

      // Automatically sign in the user after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Account created but sign in failed. Please sign in manually.')
        router.push('/auth/signin')
      } else {
        toast.success('Welcome! Redirecting to your dashboard...')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow animate-glow-pulse">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-premium animate-slide-up">
            Create Account
          </h2>
          <p className="text-lg text-gray-600">
            Join your community and start reporting issues
          </p>
        </div>

        <div className="card-premium animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address *
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
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Create a password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label htmlFor="apartment" className="block text-sm font-semibold text-gray-700 mb-2">
                    Apartment (Optional)
                  </label>
                  <input
                    id="apartment"
                    name="apartment"
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="Apartment number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="building" className="block text-sm font-semibold text-gray-700 mb-2">
                  Building (Optional)
                </label>
                <input
                  id="building"
                  name="building"
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                  placeholder="Building name/number"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}


