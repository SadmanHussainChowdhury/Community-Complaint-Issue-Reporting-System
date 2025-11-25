/**
 * Script to create an initial admin user
 * Run with: npx ts-node scripts/create-admin.ts
 */

import connectDB from '../lib/mongodb'
import User from '../models/User'

async function createAdmin() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    const adminData = {
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true,
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email })
    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }

    const admin = await User.create(adminData)
    console.log('✅ Admin user created successfully!')
    console.log(`Email: ${admin.email}`)
    console.log(`Password: ${adminData.password}`)
    console.log('\n⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

createAdmin()

