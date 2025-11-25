/**
 * Script to check if test users exist and can authenticate
 * Run: node scripts/check-users.js
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  process.exit(1)
}

// User Schema
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

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const testUsers = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'staff@example.com', password: 'staff123', role: 'staff' },
      { email: 'resident@example.com', password: 'resident123', role: 'resident' },
    ]

    console.log('🔍 Checking test users...\n')

    for (const testUser of testUsers) {
      const user = await User.findOne({ email: testUser.email }).select('+password')
      
      if (!user) {
        console.log(`❌ ${testUser.email} - NOT FOUND`)
        console.log(`   Role: ${testUser.role}`)
        console.log(`   Status: User does not exist in database\n`)
        continue
      }

      const isValidPassword = await user.comparePassword(testUser.password)
      
      console.log(`${isValidPassword ? '✅' : '❌'} ${testUser.email}`)
      console.log(`   Role: ${user.role} (expected: ${testUser.role})`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Password Valid: ${isValidPassword}`)
      console.log(`   Name: ${user.name}`)
      
      if (user.role !== testUser.role) {
        console.log(`   ⚠️  WARNING: Role mismatch!`)
      }
      
      if (!user.isActive) {
        console.log(`   ⚠️  WARNING: User is inactive!`)
      }
      
      if (!isValidPassword) {
        console.log(`   ⚠️  WARNING: Password is incorrect!`)
      }
      
      console.log('')
    }

    console.log('\n📋 Summary:')
    console.log('If any users are missing or have issues, run:')
    console.log('  node scripts/create-users-simple.js\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

checkUsers()

