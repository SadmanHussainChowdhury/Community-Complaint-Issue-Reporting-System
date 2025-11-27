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
import { HeroSection } from '@/components/ui'

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

  // Ultra-Premium Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-float">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-premium">CommunityHub</span>
                <div className="text-xs text-gray-500 font-medium">Professional Edition</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-primary transition-all duration-200 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#solutions" className="text-gray-700 hover:text-primary transition-all duration-200 font-medium relative group">
                Solutions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-primary transition-all duration-200 font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/auth/signin" className="text-gray-700 hover:text-primary transition-all duration-200 font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary animate-bounce-in">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Ultra-Premium Hero Section with Cover Photo */}
      <HeroSection
        coverPhoto="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
        title="Professional Community Management"
        subtitle="Transform your community with our enterprise-grade complaint management platform. Streamline operations, boost resident satisfaction, and resolve issues faster than ever."
        ctaText="Start Free Trial"
        ctaLink="/auth/register"
        features={[
          {
            icon: <Shield className="w-5 h-5" />,
            title: "Enterprise Security",
            description: "Bank-grade encryption & GDPR compliance"
          },
          {
            icon: <Activity className="w-5 h-5" />,
            title: "Real-time Updates",
            description: "Live status tracking & instant notifications"
          },
          {
            icon: <Users className="w-5 h-5" />,
            title: "Multi-Role Access",
            description: "Admin, Staff & Resident dashboards"
          }
        ]}
      />

      {/* Trust Indicators & Stats */}
      <section className="relative -mt-16 z-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Trust Badge */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 mb-8 shadow-sm backdrop-blur-sm">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm font-semibold text-success">Trusted by 10,000+ Communities Worldwide</span>
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '10K+', label: 'Communities', icon: Building, color: 'from-primary to-accent' },
              { value: '500K+', label: 'Complaints Resolved', icon: CheckCircle2, color: 'from-success to-emerald-500' },
              { value: '99.9%', label: 'Uptime', icon: Activity, color: 'from-accent to-purple-500' },
              { value: '24/7', label: 'Support', icon: Shield, color: 'from-primary to-blue-600' },
            ].map((stat, i) => (
              <div
                key={i}
                className="card-premium p-4 sm:p-6 lg:p-8 text-center group hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-1 sm:mb-2 group-hover:text-premium transition-colors">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="mt-3 sm:mt-4 h-1 rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-premium animate-slide-up">Everything You Need</h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Our comprehensive platform provides all the tools necessary for modern community management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Smart Complaint Submission',
                desc: 'Intuitive mobile-first interface for quick complaint reporting with photo uploads and location tagging',
                color: 'from-blue-500 to-cyan-500',
                delay: '0.1s'
              },
              {
                icon: Users,
                title: 'Advanced Role Management',
                desc: 'Granular permissions for Admins, Staff, and Residents with customizable access controls',
                color: 'from-purple-500 to-pink-500',
                delay: '0.2s'
              },
              {
                icon: Activity,
                title: 'Real-time Tracking',
                desc: 'Live status updates, progress tracking, and instant notifications across all devices',
                color: 'from-green-500 to-emerald-500',
                delay: '0.3s'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                desc: 'Comprehensive dashboards with performance metrics, trends, and actionable insights',
                color: 'from-orange-500 to-red-500',
                delay: '0.4s'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Bank-grade encryption, GDPR compliance, and advanced security features',
                color: 'from-indigo-500 to-purple-500',
                delay: '0.5s'
              },
              {
                icon: Zap,
                title: 'Automation Engine',
                desc: 'Smart assignment, escalation rules, and automated workflows for maximum efficiency',
                color: 'from-teal-500 to-cyan-500',
                delay: '0.6s'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card-premium p-6 sm:p-8 text-center group hover:scale-105 hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 group-hover:text-premium transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8 group-hover:text-gray-700 transition-colors">{feature.desc}</p>

                <div className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover cursor-pointer group-hover:translate-x-2 transition-all duration-300">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="mt-6 sm:mt-8 h-1 rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

