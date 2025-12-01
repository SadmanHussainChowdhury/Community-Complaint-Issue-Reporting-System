/**
 * Simple script to reset admin password
 * Run with: node scripts/reset-password-simple.js
 */

const mongoose = require('mongoose');

console.log('Starting password reset script...');

// Connect to MongoDB
async function resetPassword() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    console.log('Connecting to MongoDB...');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    }));

    const adminEmail = 'admin@example.com';
    const newPassword = 'admin123';

    console.log(`Looking for admin user with email: ${adminEmail}`);

    // Find the admin user first
    const existingUser = await User.findOne({ email: adminEmail });
    console.log('Existing user found:', existingUser ? 'Yes' : 'No');

    if (existingUser) {
      console.log('Current user data:', {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        isActive: existingUser.isActive,
        hasPassword: !!existingUser.password
      });
    }

    // Update the password (this will be hashed by the model's pre-save hook)
    const result = await User.findOneAndUpdate(
      { email: adminEmail },
      { password: newPassword },
      { new: true }
    );

    if (result) {
      console.log('✅ Admin password reset successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 New Password: ${newPassword}`);
      console.log('\n⚠️  IMPORTANT: Please change the password after login for security!');
      console.log('\n🔐 You can now sign in with:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('❌ Admin user not found!');
      console.log('💡 Try running the create-admin script first if no admin exists.');
    }

  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('Full error:', error);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Script completed.');
  }
}

resetPassword();
