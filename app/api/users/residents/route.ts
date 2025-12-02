import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse, IUser } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can access resident data
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let query: Record<string, unknown> = { role: UserRole.RESIDENT }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await User.countDocuments(query)
    const residents = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log(`📊 Found ${residents.length} residents for page ${page}`)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        residents: residents as IUser[],
        total,
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching residents:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch residents' },
      { status: 500 }
    )
  }
}
