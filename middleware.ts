import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from './types/enums'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    const userRole = token.role as UserRole

    // Admin routes
    if (path.startsWith('/admin') && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Staff routes
    if (path.startsWith('/staff') && userRole !== UserRole.STAFF && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Resident routes
    if (path.startsWith('/resident') && userRole !== UserRole.RESIDENT) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/resident/:path*',
    '/api/complaints/:path*',
    '/api/announcements/:path*',
    '/api/users/:path*',
    '/api/assignments/:path*',
  ],
}

