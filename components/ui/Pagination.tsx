'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

export interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
  showPageJump?: boolean
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
  showPageJump = true
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const [jumpPage, setJumpPage] = useState('')

  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 3 // Show more pages for better UX with large datasets
    const range = []
    const rangeWithDots = []

    // For very large datasets (100+ pages), show fewer intermediate pages
    const maxVisible = totalPages > 100 ? 2 : delta

    for (let i = Math.max(2, currentPage - maxVisible); i <= Math.min(totalPages - 1, currentPage + maxVisible); i++) {
      range.push(i)
    }

    if (currentPage - maxVisible > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + maxVisible < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const handlePageJump = () => {
    const page = parseInt(jumpPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpPage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageJump()
    }
  }

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className={`bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Row - Stats & Page Jump */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Stats */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">
                  {Math.ceil(totalItems / itemsPerPage)}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-slate-800">
                  {formatNumber(Math.min((currentPage - 1) * itemsPerPage + 1, totalItems))} - {formatNumber(Math.min(currentPage * itemsPerPage, totalItems))}
                </span>
                <span className="text-slate-500 ml-1">of {formatNumber(totalItems)} results</span>
              </div>
            </div>
          </div>

          {/* Page Jump Input - Only show for large datasets */}
          {showPageJump && totalPages > 10 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 font-medium">Go to page:</span>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`${currentPage}`}
                  className="w-16 px-3 py-2 text-sm text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                  / {totalPages}
                </span>
              </div>
              <button
                onClick={handlePageJump}
                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Go
              </button>
            </div>
          )}
        </div>

        {/* Bottom Row - Navigation */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-lg border border-slate-200/60">

            {/* First Page Button */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 disabled:hover:bg-transparent"
            >
              <ChevronsLeft className="w-4 h-4 text-slate-600" />
            </button>

            {/* Previous Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1 px-2">
              {visiblePages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={page === '...'}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 min-w-[44px] ${
                    page === currentPage
                      ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg transform scale-105 border-2 border-indigo-400'
                      : page === '...'
                      ? 'text-slate-400 cursor-default bg-transparent hover:bg-transparent'
                      : 'text-slate-700 bg-white border border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {page === '...' ? (
                    <MoreHorizontal className="w-4 h-4" />
                  ) : (
                    <>
                      {page}
                      {page === currentPage && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 disabled:hover:bg-transparent"
            >
              <ChevronsRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Performance Indicator for Large Datasets */}
        {totalItems > 1000 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
              Ultra-fast pagination optimized for {formatNumber(totalItems)}+ records
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
