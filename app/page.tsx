import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './api/auth/[...nextauth]/route'
import { UserRole } from '@/types/enums'
import Link from 'next/link'
import { ArrowRight, Shield, Users, MessageSquare, Zap, CheckCircle2, BarChart3, Lock, Settings, TrendingUp, Clock, FileText, Bell, Award } from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to their dashboards
  if (session) {
    switch (session.user.role) {
      case UserRole.ADMIN:
        redirect('/admin/dashboard')
      case UserRole.STAFF:
        redirect('/staff/dashboard')
      case UserRole.RESIDENT:
        redirect('/resident/dashboard')
    }
  }

  // Premium frontend landing page (Admin panel is separate)
  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Premium Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">CommunityHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Features</Link>
              <Link href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">About</Link>
              <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">Sign In</Link>
              <Link href="/auth/register" className="premium-button text-sm">
                Create Account
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 mb-6">
              <span className="text-sm font-semibold gradient-text">✨ Premium Community Management Platform</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">Community Complaint</span>
              <br />
              <span className="text-gray-900">Management System</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline community issues, track complaints, and ensure quick resolutions with our premium platform. 
              Built for modern communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register" className="premium-button text-lg px-10 py-5">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link href="/auth/signin" className="px-10 py-5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all">
                Sign In
              </Link>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade security' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Real-time updates' },
              { icon: BarChart3, title: 'Analytics', desc: 'Comprehensive insights' },
            ].map((feature, i) => (
              <div key={i} className="premium-card text-center animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 gradient-text">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage community complaints efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: 'Easy Reporting', desc: 'Submit complaints in seconds with our intuitive interface' },
              { icon: Users, title: 'Role Management', desc: 'Admin, Staff, and Resident roles with proper access control' },
              { icon: CheckCircle2, title: 'Track Status', desc: 'Real-time status updates and progress tracking' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive insights and performance metrics' },
              { icon: Zap, title: 'Real-time Updates', desc: 'Instant notifications and live status changes' },
              { icon: Lock, title: 'Secure Platform', desc: 'Your data is protected with industry-standard security' },
            ].map((feature, i) => (
              <div key={i} className="premium-card group">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 gradient-text">About CommunityHub</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A modern platform designed to streamline community management and improve resident satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security to protect your community data' },
              { icon: Zap, title: 'Real-time Updates', desc: 'Instant notifications and live status tracking' },
              { icon: Users, title: 'Community Focused', desc: 'Built for residents, staff, and administrators' },
            ].map((feature, i) => (
              <div key={i} className="premium-card text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="premium-card bg-gradient-premium text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of communities using our platform</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="inline-block bg-white text-primary-600 px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link href="/auth/signin" className="inline-block bg-white/10 text-white border-2 border-white/30 px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">CommunityHub</span>
            </div>
            <p className="text-gray-400">© 2024 CommunityHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

