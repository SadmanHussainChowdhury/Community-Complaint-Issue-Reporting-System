import mongoose from 'mongoose'
import User from '../models/User'
import connectDB from '../lib/mongodb'

async function createTestUsers() {
  try {
    await connectDB()
    console.log('✅ Connected to MongoDB')

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phone: '123-456-7890',
        isActive: true,
      },
      {
        name: 'Staff Member',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'staff',
        phone: '123-456-7891',
        isActive: true,
      },
      {
        name: 'Resident User',
        email: 'resident@example.com',
        password: 'resident123',
        role: 'resident',
        phone: '123-456-7892',
        apartment: 'A101',
        building: 'Building A',
        isActive: true,
      },
    ]

    console.log('\n📝 Creating test users...\n')

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        continue
      }

      // Create user (password will be hashed by pre-save hook)
      const user = await User.create(userData)
      console.log(`✅ Created ${userData.role}: ${userData.email}`)
      console.log(`   Name: ${userData.name}`)
      console.log(`   Password: ${userData.password}`)
      console.log(`   Role: ${userData.role}\n`)
    }

    console.log('\n✨ All test users created successfully!\n')
    console.log('📋 Login Credentials:\n')
    console.log('👤 ADMIN:')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123\n')
    console.log('👤 STAFF:')
    console.log('   Email: staff@example.com')
    console.log('   Password: staff123\n')
    console.log('👤 RESIDENT:')
    console.log('   Email: resident@example.com')
    console.log('   Password: resident123\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating users:', error)
    process.exit(1)
  }
}

createTestUsers()

