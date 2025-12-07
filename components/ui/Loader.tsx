interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white'
  className?: string
}

export default function Loader({ size = 'md', variant = 'primary', className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}></div>
  )
}

