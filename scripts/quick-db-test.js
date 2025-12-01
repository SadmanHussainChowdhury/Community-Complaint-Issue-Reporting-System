/**
 * Quick Database Connection Test
 */

const mongoose = require('mongoose');

async function quickTest() {
  try {
    console.log('🔌 Testing database connection...');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    console.log('MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@'));

    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully!');

    const User = mongoose.model('User', require('../models/User').schema);
    const userCount = await User.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Creating test admin user...');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        phone: '+1-555-0100',
        building: 'A',
        apartment: '101'
      });

      await admin.save();
      console.log('✅ Test admin user created!');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        console.log('✅ Admin user found:', admin.email);
      }
    }

    console.log('🎉 Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

quickTest();
