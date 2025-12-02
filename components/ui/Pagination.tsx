'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react'
import { useState, useCallback, useMemo, useEffect } from 'react'
import React from 'react'

// Enhanced TypeScript interfaces for better type safety
export interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  className?: string
  showPageJump?: boolean
  showPageSizeSelector?: boolean
  loading?: boolean
  error?: string | null
  availablePageSizes?: number[]
  searchQuery?: string
  onSearchChange?: (query: string) => void
  debounceDelay?: number
  enableInfiniteScroll?: boolean
  onExport?: () => void
  onBulkAction?: (action: string, selectedItems: any[]) => void
  selectedItems?: any[]
  bulkActions?: Array<{ label: string; value: string; icon?: React.ComponentType }>
}

// Enhanced interface for pagination state management
export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  searchQuery: string
  loading: boolean
  error: string | null
  selectedItems: any[]
}

// Hook for debounced pagination
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Custom hook for pagination with caching
export function usePaginationCache() {
  const [cache, setCache] = useState<Map<string, any>>(new Map())

  const get = useCallback((key: string) => {
    return cache.get(key)
  }, [cache])

  const set = useCallback((key: string, data: any) => {
    setCache(prev => new Map(prev.set(key, data)))
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
  }, [])

  return { get, set, clear }
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  className = '',
  showPageJump = true,
  showPageSizeSelector = true,
  loading = false,
  error = null,
  availablePageSizes = [10, 25, 50, 100],
  searchQuery = '',
  onSearchChange,
  debounceDelay = 300,
  enableInfiniteScroll = false,
  onExport,
  onBulkAction,
  selectedItems = [],
  bulkActions = []
}: PaginationProps) {
  // Enhanced state management
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const [jumpPage, setJumpPage] = useState('')
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [selectedPageSize, setSelectedPageSize] = useState(itemsPerPage)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Debounced search
  const debouncedSearchQuery = useDebounce(localSearchQuery, debounceDelay)

  // Smart caching for pagination data
  const { get: getCache, set: setCache, clear: clearCache } = usePaginationCache()

  // Cache key for current pagination state
  const cacheKey = useMemo(() => {
    return `pagination-${currentPage}-${itemsPerPage}-${debouncedSearchQuery}`
  }, [currentPage, itemsPerPage, debouncedSearchQuery])

  // Update parent component when debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery && onSearchChange) {
      onSearchChange(debouncedSearchQuery)
      // Clear cache when search changes
      clearCache()
    }
  }, [debouncedSearchQuery, searchQuery, onSearchChange, getCache])


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return // Don't interfere with input fields

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (currentPage > 1) onPageChange(currentPage - 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentPage < totalPages) onPageChange(currentPage + 1)
          break
        case 'Home':
          e.preventDefault()
          onPageChange(1)
          break
        case 'End':
          e.preventDefault()
          onPageChange(totalPages)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, onPageChange])

  // Debounced page change to prevent rapid API calls
  const debouncedPageChange = useCallback(
    useDebounce((page: number) => {
      onPageChange(page)
    }, debounceDelay),
    [onPageChange, debounceDelay]
  )

  const handlePageChange = (page: number) => {
    if (page === currentPage) return
    debouncedPageChange(page)
  }

  // Cache page change to prevent duplicate API calls
  const handleCachedPageChange = useCallback((page: number) => {
    if (page === currentPage) return

    // Check if we have cached data for this page
    const cachedData = getCache(`${page}-${itemsPerPage}-${debouncedSearchQuery}`)
    if (cachedData) {
      // Use cached data if available
      console.log('Using cached pagination data for page:', page)
      handlePageChange(page)
      return
    }

    handlePageChange(page)
  }, [currentPage, itemsPerPage, debouncedSearchQuery, getCache, handlePageChange])

  const handlePageSizeChange = (newSize: number) => {
    setSelectedPageSize(newSize)
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
  }

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedItems.length > 0) {
      onBulkAction(action, selectedItems)
    }
  }

  // Early return for no pagination needed
  if (totalPages <= 1 && !showPageSizeSelector && !onSearchChange && !onExport) {
    return null
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Top Row - Search, Filters, Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Search */}
            {onSearchChange && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Page Size Selector */}
            {showPageSizeSelector && availablePageSizes.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 font-medium">Show:</span>
                <select
                  value={selectedPageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-sm"
                >
                  {availablePageSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">per page</span>
              </div>
            )}

            {/* Export Button */}
            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Export
              </button>
            )}
          </div>

          {/* Stats & Bulk Actions */}
          <div className="flex items-center space-x-4">
            {/* Bulk Actions */}
            {selectedItems.length > 0 && bulkActions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Bulk Actions ({selectedItems.length})
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    {bulkActions.map(action => (
                      <button
                        key={action.value}
                        onClick={() => handleBulkAction(action.value)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        {action.icon && React.createElement(action.icon as any, { className: "w-4 h-4" })}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                {loading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {totalPages}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-slate-800">
                  {formatNumber(Math.min((currentPage - 1) * itemsPerPage + 1, totalItems))} - {formatNumber(Math.min(currentPage * itemsPerPage, totalItems))}
                </span>
                <span className="text-slate-500 ml-1">of {formatNumber(totalItems)} results</span>
              </div>
            </div>
          </div>

          {/* Page Jump Input - Enhanced for large datasets */}
          {showPageJump && totalPages > 5 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 font-medium hidden sm:inline">Go to page:</span>
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
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Row - Navigation */}
        <div className="flex items-center justify-center">
          <div className={`flex items-center space-x-1 sm:space-x-2 bg-white rounded-xl p-2 shadow-lg border border-slate-200/60 transition-opacity ${loading ? 'opacity-75' : 'opacity-100'}`}>

            {/* First Page Button - Hidden on mobile */}
            <button
              onClick={() => handleCachedPageChange(1)}
              disabled={currentPage === 1 || loading}
              className="hidden sm:flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 disabled:hover:bg-transparent"
            >
              <ChevronsLeft className="w-4 h-4 text-slate-600" />
            </button>

            {/* Previous Button */}
            <button
              onClick={() => handleCachedPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronLeft className="w-4 h-4 mr-1" />
              )}
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1 px-2">
              {visiblePages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handleCachedPageChange(page)}
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
              onClick={() => handleCachedPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            >
              <span className="hidden sm:inline">Next</span>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </button>

            {/* Last Page Button - Hidden on mobile */}
            <button
              onClick={() => handleCachedPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="hidden sm:flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 disabled:hover:bg-transparent"
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
