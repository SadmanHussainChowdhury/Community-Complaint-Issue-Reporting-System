/**
 * Script to reset admin password
 * Run with: npx ts-node scripts/reset-admin-password.ts
 */

import connectDB from '../lib/mongodb'
import User from '../models/User'

async function resetAdminPassword() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const newPassword = process.env.ADMIN_NEW_PASSWORD || 'admin123'

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail })

    if (!adminUser) {
      console.log(`❌ Admin user with email ${adminEmail} not found!`)
      console.log('Please run the create-admin script first.')
      process.exit(1)
    }

    // Update the password
    adminUser.password = newPassword // This will be hashed by the pre-save hook
    await adminUser.save()

    console.log('✅ Admin password reset successfully!')
    console.log(`Email: ${adminEmail}`)
    console.log(`New Password: ${newPassword}`)
    console.log('\n⚠️  Please change the password after login for security!')

  } catch (error) {
    console.error('Error resetting admin password:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

resetAdminPassword()
