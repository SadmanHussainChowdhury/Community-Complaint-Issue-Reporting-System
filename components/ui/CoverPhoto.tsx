'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CoverPhotoProps {
  src: string
  alt: string
  title?: string
  subtitle?: string
  className?: string
  overlay?: boolean
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'parallax' | 'none'
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const heightClasses = {
  sm: 'h-64 sm:h-80',
  md: 'h-80 sm:h-96',
  lg: 'h-96 sm:h-[500px]',
  xl: 'h-[500px] sm:h-[600px]',
  full: 'h-screen'
}

export function CoverPhoto({
  src,
  alt,
  title,
  subtitle,
  className,
  overlay = true,
  animation = 'fade-in',
  height = 'xl'
}: CoverPhotoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (animation === 'parallax') {
      const handleScroll = () => setScrollY(window.scrollY)
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [animation])

  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale-in': 'animate-scale-in',
    'parallax': '',
    'none': ''
  }

  return (
    <div className={cn('relative overflow-hidden', heightClasses[height], className)}>
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          />
        ))}
      </div>

      {/* Main Cover Image */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-1000',
          animation === 'parallax' && 'transform-gpu'
        )}
        style={
          animation === 'parallax'
            ? { transform: `translateY(${scrollY * 0.5}px)` }
            : undefined
        }
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-all duration-1000',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            animationClasses[animation]
          )}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Premium Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-primary/30"></div>
        )}

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        </div>
      </div>

      {/* Content Overlay */}
      {(title || subtitle) && (
        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {title && (
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 drop-shadow-2xl animate-slide-up">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-text-glow">
                  {title}
                </span>
              </h1>
            )}
            {subtitle && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
                {subtitle}
              </p>
            )}

            {/* Decorative Elements */}
            <div className="mt-8 flex justify-center space-x-2 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 shadow-2xl"></div>

      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
    </div>
  )
}

// Premium Hero Section Component
interface HeroSectionProps {
  coverPhoto: string
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  features?: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
}

export function HeroSection({
  coverPhoto,
  title,
  subtitle,
  ctaText = "Get Started",
  ctaLink = "/auth/register",
  features
}: HeroSectionProps) {
  return (
    <section className="relative">
      {/* Ultra Premium Cover Photo */}
      <CoverPhoto
        src={coverPhoto}
        alt="Community Hub Premium Platform"
        title={title}
        subtitle={subtitle}
        animation="parallax"
        height="full"
        className="rounded-none"
      />

      {/* CTA Button Overlay */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce-in" style={{ animationDelay: '1.2s' }}>
        <a
          href={ctaLink}
          className="btn-primary btn-lg group shadow-2xl hover:shadow-premium transform hover:scale-105 transition-all duration-300"
        >
          {ctaText}
          <svg
            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      {/* Features Preview */}
      {features && (
        <div className="absolute bottom-24 left-4 right-4 z-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-premium p-4 text-center animate-slide-up bg-white/10 backdrop-blur-sm border-white/20"
                style={{ animationDelay: `${1.5 + index * 0.2}s` }}
              >
                <div className="w-8 h-8 mx-auto mb-2 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
