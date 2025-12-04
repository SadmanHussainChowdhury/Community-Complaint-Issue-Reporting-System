import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/enums'
import { Wrench, Shield, Sparkles, Volume2, Car, Zap, AlertTriangle, HelpCircle } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [ComplaintStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ComplaintStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [ComplaintStatus.RESOLVED]: 'bg-green-100 text-green-800',
    [ComplaintStatus.CANCELLED]: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    [ComplaintPriority.LOW]: 'bg-gray-100 text-gray-800',
    [ComplaintPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
    [ComplaintPriority.HIGH]: 'bg-orange-100 text-orange-800',
    [ComplaintPriority.URGENT]: 'bg-red-100 text-red-800',
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    [ComplaintCategory.MAINTENANCE]: '🔧',
    [ComplaintCategory.SECURITY]: '🛡️',
    [ComplaintCategory.CLEANLINESS]: '✨',
    [ComplaintCategory.NOISE]: '🔊',
    [ComplaintCategory.PARKING]: '🚗',
    [ComplaintCategory.UTILITIES]: '⚡',
    [ComplaintCategory.SAFETY]: '⚠️',
    [ComplaintCategory.OTHER]: '❓',
  }
  return icons[category] || '📋'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date consistently for display (prevents hydration mismatches)
export function formatDateForDisplay(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  // Use consistent locale and options to prevent hydration mismatches
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}