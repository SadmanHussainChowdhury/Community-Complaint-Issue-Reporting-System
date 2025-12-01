import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { jsonResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasSession: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name
      } : null,
      environmentVariables: {
        hasMongoDB: !!process.env.MONGODB_URI,
        mongoDBLength: process.env.MONGODB_URI?.length || 0,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    }

    // Test database connection
    try {
      await connectDB()
      debugInfo.databaseConnection = 'SUCCESS'

      // Count users
      const userCount = await User.countDocuments()
      debugInfo.userCount = userCount

      // Get sample users (first 3)
      const sampleUsers = await User.find({}, 'name email role isActive').limit(3).lean()
      debugInfo.sampleUsers = sampleUsers

    } catch (dbError: any) {
      debugInfo.databaseConnection = 'FAILED'
      debugInfo.databaseError = dbError.message
    }

    return jsonResponse({
      success: true,
      message: 'Debug information retrieved',
      data: debugInfo
    })

  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: 'Debug failed',
      details: error.message
    }, 500)
  }
}
