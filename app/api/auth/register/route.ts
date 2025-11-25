import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET requests (for testing/debugging)
export async function GET() {
  return NextResponse.json<ApiResponse>(
    {
      success: true,
      message: 'Registration endpoint is working. Use POST method to register.'
    },
    { status: 200 }
  )
}

export async function POST(req: NextRequest) {
  // Ensure we always return JSON, even on errors
  try {
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid JSON in request body' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    const { name, email, password, phone, apartment, building } = body

    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    try {
      await connectDB()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user with RESIDENT role by default
    let user
    try {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // Will be hashed by the pre-save hook
        role: UserRole.RESIDENT,
        phone: phone?.trim(),
        apartment: apartment?.trim(),
        building: building?.trim(),
        isActive: true,
      })
    } catch (createError: any) {
      console.error('User creation error:', createError)
      if (createError.code === 11000) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      throw createError
    }

    const userResponse = user.toJSON()

    return NextResponse.json<ApiResponse<{ user: typeof userResponse }>>(
      {
        success: true,
        data: { user: userResponse },
        message: 'Account created successfully. You can now sign in.',
      },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email already exists' },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }

    // Ensure JSON response even on errors
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Failed to create account' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}


