import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { jsonResponse } from '@/lib/api-response'

/**
 * POST /api/admin/reset-password
 * Reset password for a user (Admin only)
 * 
 * Body:
 * - email: string (required) - User email to reset password for
 * - newPassword: string (required) - New password (minimum 6 characters)
 * 
 * Security:
 * - Requires admin authentication
 * - Validates password strength
 * - Does not return password in response
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return jsonResponse({ success: false, error: 'Unauthorized. Admin access required.' }, 401)
    }

    await connectDB()

    // Parse request body
    const body = await req.json()
    const { email, newPassword } = body

    // Validate input
    if (!email || typeof email !== 'string') {
      return jsonResponse({ success: false, error: 'Email is required' }, 400)
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return jsonResponse({ success: false, error: 'New password is required' }, 400)
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return jsonResponse({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }, 400)
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return jsonResponse({ success: false, error: 'User not found' }, 404)
    }

    // Set the new password and save (this will trigger the pre-save hook for hashing)
    user.password = newPassword
    await user.save()

    return jsonResponse({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: user.email,
        // Do not return password in response for security
      }
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return jsonResponse({ 
      success: false, 
      error: 'Failed to reset password. Please try again.' 
    }, 500)
  }
}
