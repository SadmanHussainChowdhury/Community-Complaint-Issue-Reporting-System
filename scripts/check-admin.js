/**
 * Check if admin user exists and show current status
 */

const mongoose = require('mongoose');

async function checkAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    console.log('Connecting to MongoDB...');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    }));

    const adminEmail = 'admin@example.com';

    console.log(`\n🔍 Looking for admin user: ${adminEmail}`);

    const adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('✅ Admin user found!');
      console.log('📊 User details:');
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Has Password: ${!!adminUser.password}`);
      console.log(`   Password Length: ${adminUser.password ? adminUser.password.length : 0}`);

      // Test password comparison
      console.log('\n🔐 Testing password...');
      const bcrypt = require('bcryptjs');
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`   Password 'admin123' valid: ${isValid ? '✅ YES' : '❌ NO'}`);

    } else {
      console.log('❌ Admin user not found!');
      console.log('💡 You may need to create the admin user first.');
    }

    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}, 'name email role isActive');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
}

checkAdmin();
