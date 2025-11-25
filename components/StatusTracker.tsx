'use client'

import { ComplaintStatus } from '@/types/enums'
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react'

interface StatusTrackerProps {
  currentStatus: ComplaintStatus
  className?: string
}

const statusConfig = {
  [ComplaintStatus.PENDING]: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
  },
  [ComplaintStatus.IN_PROGRESS]: {
    label: 'In Progress',
    icon: Circle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  [ComplaintStatus.RESOLVED]: {
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  [ComplaintStatus.CANCELLED]: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
}

const statusOrder = [
  ComplaintStatus.PENDING,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.RESOLVED,
]

export default function StatusTracker({ currentStatus, className = '' }: StatusTrackerProps) {
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {statusOrder.map((status, index) => {
        const config = statusConfig[status]
        const Icon = config.icon
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isCompleted ? config.bgColor : 'bg-gray-100'}
                  ${isCurrent ? 'ring-2 ring-offset-2 ' + config.borderColor : ''}
                  transition-all duration-300
                `}
              >
                <Icon
                  className={`
                    w-6 h-6
                    ${isCompleted ? config.color : 'text-gray-400'}
                  `}
                />
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${isCompleted ? config.color : 'text-gray-400'}
                `}
              >
                {config.label}
              </span>
            </div>
            {index < statusOrder.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2
                  ${isCompleted && index < currentIndex ? config.bgColor : 'bg-gray-200'}
                  transition-all duration-300
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

