'use client'

import { BarChart3, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header Section */}
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-premium">Admin Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-500 -mt-1 font-medium">Professional Community Management</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-600 mt-3 sm:mt-4 max-w-2xl">
                Comprehensive analytics and management tools for efficient community operations
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Last updated</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <button className="btn btn-secondary w-full sm:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <div className="card-premium max-w-2xl mx-auto p-6 sm:p-8 lg:p-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-glow">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Dashboard Coming Soon</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              We&apos;re building comprehensive analytics and management tools for your community platform.
              Check back soon for detailed insights and performance metrics.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button className="btn btn-secondary">
                View Complaints
              </button>
              <button className="btn btn-primary">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

