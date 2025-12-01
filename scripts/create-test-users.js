/**
 * Create test users for the application
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function createTestUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    console.log('🔌 Connecting to MongoDB...');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean,
      phone: String,
      apartment: String,
      building: String,
      communityId: String
    }, { timestamps: true }));

    const bcrypt = require('bcryptjs');

    // Test users data
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isActive: true,
        phone: '+1-555-0100',
        building: 'A',
        apartment: '101'
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: await bcrypt.hash('user123', 10),
        role: 'resident',
        isActive: true,
        phone: '+1-555-0101',
        building: 'A',
        apartment: '102'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('user123', 10),
        role: 'resident',
        isActive: true,
        phone: '+1-555-0102',
        building: 'B',
        apartment: '201'
      },
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: await bcrypt.hash('user123', 10),
        role: 'resident',
        isActive: true,
        phone: '+1-555-0103',
        building: 'B',
        apartment: '202'
      },
      {
        name: 'Staff Member',
        email: 'staff@example.com',
        password: await bcrypt.hash('staff123', 10),
        role: 'staff',
        isActive: true,
        phone: '+1-555-0104',
        building: 'Main',
        apartment: 'Office'
      }
    ];

    console.log('👥 Creating test users...');

    // Check for existing users and create only if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      } else {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      }
    }

    // Show final user count
    const totalUsers = await User.countDocuments();
    const userBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 Final user statistics:');
    console.log(`   Total users: ${totalUsers}`);
    userBreakdown.forEach(role => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    console.log('\n🎉 Test users creation completed!');
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Staff: staff@example.com / staff123');
    console.log('   Residents: [user]@example.com / user123');
    console.log('             (john@example.com, sarah@example.com, mike@example.com)');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    console.log('🔌 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Script completed.');
  }
}

createTestUsers();
