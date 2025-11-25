'use client'

import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Bell,
  FileText,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

// Map icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Bell,
  FileText,
  TrendingUp,
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: string // Changed from LucideIcon to string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export default function StatsCard({ title, value, icon, color = 'blue' }: StatsCardProps) {
  const Icon = iconMap[icon] || ClipboardList // Fallback to ClipboardList if icon not found
  const gradientClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-indigo-500',
  }

  const bgGradientClasses = {
    blue: 'from-blue-50 to-cyan-50',
    green: 'from-green-50 to-emerald-50',
    yellow: 'from-yellow-50 to-orange-50',
    red: 'from-red-50 to-pink-50',
    purple: 'from-purple-50 to-indigo-50',
  }

  return (
    <div className={`premium-card bg-gradient-to-br ${bgGradientClasses[color]} group cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
            {value}
          </p>
        </div>
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${gradientClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  )
}

