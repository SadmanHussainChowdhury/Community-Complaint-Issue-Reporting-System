import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

/**
 * Helper function to create JSON responses with proper Content-Type headers
 * This ensures all API responses are JSON, preventing HTML error pages
 */
export function jsonResponse<T = any>(
  data: ApiResponse<T>,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

