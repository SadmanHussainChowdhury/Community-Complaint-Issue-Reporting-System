/**
 * Create a simple admin user
 */

const mongoose = require('mongoose');

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    await mongoose.connect(mongoUri);

    const User = mongoose.model('User', {
      name: String,
      email: String,
      password: String,
      role: String,
      isActive: Boolean
    });

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
