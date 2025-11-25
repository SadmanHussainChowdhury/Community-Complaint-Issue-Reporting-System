/**
 * Simple script to create test users
 * Run: node scripts/create-users-simple.js
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

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...')
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
      try {
        // Check if user exists
        const existing = await User.findOne({ email: userData.email })
        
        if (existing) {
          console.log(`⚠️  User ${userData.email} already exists`)
          
          // Update if needed
          if (!existing.isActive) {
            existing.isActive = true
            await existing.save()
            console.log(`   ✅ Activated user`)
          }
          
          // Verify password works
          const userWithPassword = await User.findOne({ email: userData.email }).select('+password')
          const isValid = await userWithPassword.comparePassword(userData.password)
          
          if (!isValid) {
            // Update password
            userWithPassword.password = userData.password
            await userWithPassword.save()
            console.log(`   ✅ Updated password`)
          }
          
          continue
        }

        // Create new user
        const user = new User(userData)
        await user.save()

        console.log(`✅ Created ${userData.role}: ${userData.email}`)
        console.log(`   Name: ${userData.name}`)
        console.log(`   Password: ${userData.password}`)
        console.log(`   Role: ${userData.role}`)
        console.log(`   Active: ${user.isActive}\n`)
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  User ${userData.email} already exists (duplicate key)`)
        } else {
          console.error(`❌ Error creating ${userData.email}:`, err.message)
        }
      }
    }

    // Verify all users exist and can authenticate
    console.log('\n🔍 Verifying users...\n')
    for (const userData of users) {
      const user = await User.findOne({ email: userData.email }).select('+password')
      if (user) {
        const isValid = await user.comparePassword(userData.password)
        console.log(`${isValid ? '✅' : '❌'} ${userData.email} - Password: ${isValid ? 'Valid' : 'Invalid'} - Active: ${user.isActive}`)
      } else {
        console.log(`❌ ${userData.email} - Not found`)
      }
    }

    console.log('\n✨ Done!\n')
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

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createUsers()

