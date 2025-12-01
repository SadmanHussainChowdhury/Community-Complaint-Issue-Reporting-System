import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { jsonResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Test users data
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        phone: '+1-555-0100',
        building: 'A',
        apartment: '101'
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: 'user123',
        role: 'resident',
        isActive: true,
        phone: '+1-555-0101',
        building: 'A',
        apartment: '102'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'user123',
        role: 'resident',
        isActive: true,
        phone: '+1-555-0102',
        building: 'B',
        apartment: '201'
      },
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: 'user123',
        role: 'resident',
        isActive: true,
        phone: '+1-555-0103',
        building: 'B',
        apartment: '202'
      },
      {
        name: 'Staff Member',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'staff',
        isActive: true,
        phone: '+1-555-0104',
        building: 'Main',
        apartment: 'Office'
      }
    ]

    const results = []

    // Create users if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email })

      if (existingUser) {
        results.push({
          email: userData.email,
          status: 'exists',
          message: 'User already exists'
        })
      } else {
        const newUser = new User(userData)
        await newUser.save()
        results.push({
          email: userData.email,
          status: 'created',
          message: 'User created successfully',
          role: userData.role
        })
      }
    }

    // Get final count
    const totalUsers = await User.countDocuments()

    return jsonResponse({
      success: true,
      message: 'Test users creation completed',
      data: {
        results,
        totalUsers,
        loginCredentials: {
          admin: { email: 'admin@example.com', password: 'admin123' },
          staff: { email: 'staff@example.com', password: 'staff123' },
          residents: [
            { email: 'john@example.com', password: 'user123' },
            { email: 'sarah@example.com', password: 'user123' },
            { email: 'mike@example.com', password: 'user123' }
          ]
        }
      }
    })

  } catch (error) {
    console.error('Error creating test users:', error)
    return jsonResponse({ success: false, error: 'Failed to create test users' }, 500)
  }
}

// Also allow GET for easy access
export async function GET(req: NextRequest) {
  // Same logic as POST
  return POST(req)
}
