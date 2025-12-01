/**
 * Generate thousands of test users for pagination testing
 */

const mongoose = require('mongoose');

async function generateTestUsers() {
  try {
    console.log('🚀 Generating test users for pagination testing...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', require('../models/User').schema);

    // Clear existing test users (keep real admin if exists)
    console.log('🧹 Cleaning existing test users...');
    await User.deleteMany({
      email: { $regex: /^test-user-\d+@example\.com$/ }
    });

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Generate 5000 test users
    const batchSize = 500;
    const totalUsers = 5000;
    const testUsers = [];

    console.log(`📝 Generating ${totalUsers} test users...`);

    for (let i = 1; i <= totalUsers; i++) {
      const user = {
        name: `Test User ${i.toString().padStart(4, '0')}`,
        email: `test-user-${i}@example.com`,
        password: hashedPassword,
        role: i <= 50 ? 'staff' : 'resident', // First 50 are staff, rest are residents
        isActive: Math.random() > 0.05, // 95% active, 5% inactive
        phone: `+1-555-${Math.floor(Math.random() * 9000 + 1000)}`,
        building: String.fromCharCode(65 + Math.floor(Math.random() * 10)), // A-J
        apartment: `${Math.floor(Math.random() * 50 + 1).toString().padStart(3, '0')}`,
        communityId: 'test-community',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
      };

      testUsers.push(user);

      // Insert in batches
      if (i % batchSize === 0 || i === totalUsers) {
        console.log(`📦 Inserting batch ${Math.ceil(i / batchSize)} (${testUsers.length} users)...`);
        await User.insertMany(testUsers);
        testUsers.length = 0; // Clear array

        // Progress update
        const progress = ((i / totalUsers) * 100).toFixed(1);
        console.log(`📊 Progress: ${progress}% (${i}/${totalUsers} users)`);
      }
    }

    // Final count
    const finalCount = await User.countDocuments();
    const staffCount = await User.countDocuments({ role: 'staff' });
    const residentCount = await User.countDocuments({ role: 'resident' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('\n🎉 Test users generation completed!');
    console.log('📊 Final Statistics:');
    console.log(`   Total Users: ${finalCount}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Staff Users: ${staffCount}`);
    console.log(`   Resident Users: ${residentCount}`);

    console.log('\n🔐 Test Login Credentials:');
    console.log('   Any test user: test-user-1@example.com / password123');
    console.log('   Staff user: test-user-1@example.com / password123');
    console.log('   Resident user: test-user-51@example.com / password123');

    console.log('\n📄 Pagination Test:');
    console.log(`   With 10 users per page: ${Math.ceil(finalCount / 10)} pages`);
    console.log(`   With 25 users per page: ${Math.ceil(finalCount / 25)} pages`);
    console.log(`   With 50 users per page: ${Math.ceil(finalCount / 50)} pages`);

    console.log('\n✅ Ready for pagination testing!');

  } catch (error) {
    console.error('❌ Error generating test users:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

generateTestUsers();
