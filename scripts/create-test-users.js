/**
 * Script to create test users for all roles (Admin, Staff, Resident)
 * Run with: node scripts/create-test-users.js
 * Make sure MONGODB_URI is set in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  process.exit(1)
}

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['resident', 'staff', 'admin'], default: 'resident', required: true },
  phone: { type: String, trim: true },
  apartment: { type: String, trim: true },
  building: { type: String, trim: true },
  communityId: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createTestUsers() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

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

    console.log('📝 Creating test users...\n')

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        continue
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password, salt)

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      })

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
    console.log('🌐 Sign in at: http://localhost:3000/auth/signin\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating users:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createTestUsers()

