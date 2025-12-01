import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse, IUser } from '@/types'

// GET /api/users - Get all users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let query: Record<string, unknown> = {}

    if (role) query.role = role
    if (isActive !== null) query.isActive = isActive === 'true'

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await User.countDocuments(query)

    return NextResponse.json<ApiResponse<{ users: IUser[]; total: number; page: number; limit: number }>>({
      success: true,
      data: {
        users,
        total,
        page,
        limit
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { name, email, password, role, phone, apartment, building, communityId } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      apartment,
      building,
      communityId: communityId || session.user.communityId,
      isActive: true,
    })

    const userResponse = user.toJSON()

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'user_created',
      entityType: 'user',
      entityId: user._id.toString(),
      details: { name, email, role },
      communityId: session.user.communityId,
    })

    return NextResponse.json<ApiResponse<{ user: IUser }>>(
      {
        success: true,
        data: { user: userResponse },
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

