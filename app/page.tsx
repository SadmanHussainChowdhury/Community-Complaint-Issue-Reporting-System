import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import Link from 'next/link'
import {
  ArrowRight,
  Shield,
  Users,
  MessageSquare,
  Zap,
  CheckCircle2,
  BarChart3,
  Lock,
  Settings,
  TrendingUp,
  Clock,
  FileText,
  Bell,
  Award,
  Star,
  Target,
  Globe,
  Smartphone,
  Server,
  UserCheck,
  Building,
  PieChart,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react'

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

  // Professional landing page for CodeCanyon standards
  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Professional Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container-fluid">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">CommunityHub</span>
                <div className="text-xs text-gray-500 -mt-1">Professional Edition</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group">
                Solutions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Advanced Background Elements */}
        <div className="absolute inset-0">
          {/* Primary blob */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-morph"></div>

          {/* Secondary blob */}
          <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-morph" style={{ animationDelay: '2s' }}></div>

          {/* Tertiary blob */}
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-morph" style={{ animationDelay: '4s' }}></div>

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-300 rounded-full opacity-45 animate-float" style={{ animationDelay: '3s' }}></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
        </div>

        <div className="container-fluid relative">
          <div className="text-center animate-fade-in">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">Trusted by 10,000+ Communities Worldwide</span>
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="gradient-text animate-text-glow">Professional</span>
              <br />
              <span className="text-gray-900 animate-slide-up" style={{ animationDelay: '0.2s' }}>Community</span>
              <br />
              <span className="gradient-text-accent animate-text-glow" style={{ animationDelay: '0.4s' }}>Management</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your community with our enterprise-grade complaint management platform.
              Streamline operations, boost resident satisfaction, and resolve issues faster than ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/auth/register" className="btn-primary text-lg px-12 py-6 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-3 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#demo" className="btn-secondary text-lg px-12 py-6">
                Watch Demo
                <Target className="w-5 h-5 ml-3 inline" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Enhanced Hero Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Communities', icon: Building, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
              { value: '500K+', label: 'Complaints Resolved', icon: CheckCircle2, color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' },
              { value: '99.9%', label: 'Uptime', icon: Activity, color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/20' },
              { value: '24/7', label: 'Support', icon: Shield, color: 'from-orange-500 to-red-500', glow: 'shadow-orange-500/20' },
            ].map((stat, i) => (
              <div
                key={i}
                className="premium-card group cursor-pointer animate-scale-in hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg ${stat.glow}`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-4xl font-black gradient-text mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
                <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-spacing bg-white/60">
        <div className="container-fluid">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 mb-6">
              <span className="text-sm font-semibold gradient-text">🚀 Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools necessary for modern community management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Smart Complaint Submission',
                desc: 'Intuitive mobile-first interface for quick complaint reporting with photo uploads and location tagging',
                color: 'from-blue-500 to-cyan-500',
                bgPattern: 'bg-blue-50',
                textColor: 'text-blue-600'
              },
              {
                icon: Users,
                title: 'Advanced Role Management',
                desc: 'Granular permissions for Admins, Staff, and Residents with customizable access controls',
                color: 'from-purple-500 to-pink-500',
                bgPattern: 'bg-purple-50',
                textColor: 'text-purple-600'
              },
              {
                icon: Activity,
                title: 'Real-time Tracking',
                desc: 'Live status updates, progress tracking, and instant notifications across all devices',
                color: 'from-green-500 to-emerald-500',
                bgPattern: 'bg-green-50',
                textColor: 'text-green-600'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                desc: 'Comprehensive dashboards with performance metrics, trends, and actionable insights',
                color: 'from-orange-500 to-red-500',
                bgPattern: 'bg-orange-50',
                textColor: 'text-orange-600'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Bank-grade encryption, GDPR compliance, and advanced security features',
                color: 'from-indigo-500 to-purple-500',
                bgPattern: 'bg-indigo-50',
                textColor: 'text-indigo-600'
              },
              {
                icon: Zap,
                title: 'Automation Engine',
                desc: 'Smart assignment, escalation rules, and automated workflows for maximum efficiency',
                color: 'from-teal-500 to-cyan-500',
                bgPattern: 'bg-teal-50',
                textColor: 'text-teal-600'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`premium-card group animate-fade-in hover:scale-105 transition-all duration-500 ${feature.bgPattern}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="relative">
                  {/* Icon with enhanced effects */}
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl animate-glow-pulse`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-bounce-gentle"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse"></div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.desc}</p>

                <div className={`inline-flex items-center text-sm font-semibold ${feature.textColor} group-hover:translate-x-2 transition-transform duration-300 cursor-pointer`}>
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Bottom accent line */}
                <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="section-spacing bg-gradient-to-br from-gray-50 to-white">
        <div className="container-fluid">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Perfect for Every Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From small apartment complexes to large residential communities, we scale with your needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">Residential Communities</h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Streamline maintenance requests, improve resident satisfaction, and maintain property values
                with our comprehensive community management solution.
              </p>
              <div className="space-y-4">
                {[
                  'Maintenance request tracking',
                  'Resident communication portal',
                  'Property management integration',
                  'Emergency response coordination',
                  'Community event management'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-slide-in-right">
              <div className="premium-card p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-600">Residents</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2hrs</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-spacing bg-gradient-mesh">
        <div className="container-fluid">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Trusted by Communities</h2>
            <p className="text-xl text-gray-600">See what our clients say about transforming their communities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "CommunityHub has revolutionized how we manage our 500-unit complex. Response times dropped by 75% and resident satisfaction is at an all-time high.",
                author: "Sarah Johnson",
                role: "Property Manager",
                company: "Riverside Apartments",
                rating: 5
              },
              {
                quote: "The analytics and reporting features give us incredible insights into maintenance patterns. We've reduced costs by 30% through preventive maintenance.",
                author: "Michael Chen",
                role: "Operations Director",
                company: "Oakwood Estates",
                rating: 5
              },
              {
                quote: "Staff love the mobile app, and residents appreciate the transparency. It's been a game-changer for our community communication.",
                author: "Jennifer Williams",
                role: "Community Director",
                company: "Sunset Gardens",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="premium-card animate-scale-in" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-spacing bg-white/80">
        <div className="container-fluid">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your community size and needs. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$29',
                period: '/month',
                description: 'Perfect for small communities',
                features: [
                  'Up to 100 residents',
                  'Basic complaint management',
                  'Email notifications',
                  'Mobile app access',
                  'Basic analytics'
                ],
                popular: false
              },
              {
                name: 'Professional',
                price: '$79',
                period: '/month',
                description: 'Ideal for growing communities',
                features: [
                  'Up to 500 residents',
                  'Advanced complaint tracking',
                  'Priority support',
                  'Custom workflows',
                  'Advanced analytics',
                  'API access'
                ],
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large communities',
                features: [
                  'Unlimited residents',
                  'White-label solution',
                  'Dedicated support',
                  'Custom integrations',
                  'Advanced security',
                  'On-premise deployment'
                ],
                popular: false
              }
            ].map((plan, i) => (
              <div key={i} className={`premium-card relative animate-fade-in ${plan.popular ? 'ring-2 ring-blue-500 shadow-floating' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-black gradient-text">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'} text-center`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include 14-day free trial. No credit card required.
              <Link href="#contact" className="text-blue-600 hover:text-blue-700 font-semibold ml-2">
                Need help choosing?
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative section-spacing-sm overflow-hidden">
        {/* Dynamic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-shimmer">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="container-fluid text-center relative">
          <div className="max-w-5xl mx-auto">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-bounce-gentle">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-semibold">Limited Time: Free Setup & Migration</span>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight animate-text-glow">
              Ready to Transform
              <br />
              <span className="gradient-text-sunset">Your Community?</span>
            </h2>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Join thousands of communities already using CommunityHub to improve resident satisfaction and streamline operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/auth/register" className="btn-primary text-xl px-16 py-8 bg-white text-gray-900 hover:bg-gray-50 hover:scale-110 transition-all duration-300 shadow-2xl animate-bounce-gentle">
                <span className="font-black">Start Your Free Trial</span>
                <ArrowRight className="w-6 h-6 ml-4 inline group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="#contact" className="btn-outline text-xl px-16 py-8 border-2 border-white text-white hover:bg-white hover:text-gray-900 hover:scale-110 transition-all duration-300">
                <Target className="w-6 h-6 mr-4 inline" />
                <span className="font-bold">Schedule Demo</span>
              </Link>
            </div>

            {/* Enhanced benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: CheckCircle2, text: '14-day free trial', color: 'text-green-300' },
                { icon: Shield, text: 'No credit card required', color: 'text-blue-300' },
                { icon: Zap, text: 'Cancel anytime', color: 'text-yellow-300' }
              ].map((benefit, i) => (
                <div key={i} className="flex items-center justify-center gap-3 text-white/90 animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                  <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Social proof numbers */}
            <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50,000+</div>
                <div>Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1M+</div>
                <div>Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div>Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">CommunityHub</span>
                  <div className="text-sm text-gray-400">Professional Edition</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The most comprehensive community management platform, trusted by thousands of communities worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 CommunityHub Professional. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

