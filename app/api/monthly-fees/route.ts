import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import MonthlyFee from '@/models/MonthlyFee'
import User from '@/models/User'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/monthly-fees - Get all monthly fees
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view all fees
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const residentId = searchParams.get('residentId')
    const search = searchParams.get('search')

    let query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (month) {
      query.month = parseInt(month)
    }

    if (year) {
      query.year = parseInt(year)
    }

    if (residentId) {
      query.resident = residentId
    }

    let feesQuery = MonthlyFee.find(query).populate('resident', 'name email phone apartment building').populate('createdBy', 'name').sort({ year: -1, month: -1, createdAt: -1 })

    // Search functionality
    if (search) {
      const userQuery = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id')

      const userIds = userQuery.map(user => user._id)
      query.resident = { $in: userIds }
      feesQuery = MonthlyFee.find(query).populate('resident', 'name email phone apartment building').populate('createdBy', 'name').sort({ year: -1, month: -1, createdAt: -1 })
    }

    const total = await MonthlyFee.countDocuments(query)
    const fees = await feesQuery.skip(skip).limit(limit).lean()

    // Calculate totals
    const totals = await MonthlyFee.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      totalCount: total,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    }

    totals.forEach((item) => {
      stats.totalAmount += item.total
      if (item._id === 'paid') {
        stats.paidAmount = item.total
        stats.paidCount = item.count
      } else if (item._id === 'pending') {
        stats.pendingAmount = item.total
        stats.pendingCount = item.count
      } else if (item._id === 'overdue') {
        stats.overdueAmount = item.total
        stats.overdueCount = item.count
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        fees,
        total,
        page,
        limit,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching monthly fees:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch monthly fees' },
      { status: 500 }
    )
  }
}

// POST /api/monthly-fees - Create a new monthly fee
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can create fees
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await req.json()
    const { residentId, month, year, amount, description, dueDate } = body

    if (!residentId || !month || !year || !amount || !dueDate) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if fee already exists for this resident, month, and year
    const existingFee = await MonthlyFee.findOne({
      resident: residentId,
      month: parseInt(month),
      year: parseInt(year),
    })

    if (existingFee) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Monthly fee already exists for this resident, month, and year' },
        { status: 400 }
      )
    }

    // Verify resident exists
    const resident = await User.findById(residentId)
    if (!resident || resident.role !== UserRole.RESIDENT) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid resident' },
        { status: 400 }
      )
    }

    const fee = await MonthlyFee.create({
      resident: residentId,
      month: parseInt(month),
      year: parseInt(year),
      amount: parseFloat(amount),
      description,
      dueDate: new Date(dueDate),
      status: 'pending',
      createdBy: session.user.id,
      communityId: session.user.communityId,
    })

    await fee.populate('resident', 'name email phone apartment building')
    await fee.populate('createdBy', 'name')

    return NextResponse.json<ApiResponse>({
      success: true,
      data: fee,
      message: 'Monthly fee created successfully',
    })
  } catch (error: any) {
    console.error('Error creating monthly fee:', error)
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Monthly fee already exists for this resident, month, and year' },
        { status: 400 }
      )
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create monthly fee' },
      { status: 500 }
    )
  }
}
