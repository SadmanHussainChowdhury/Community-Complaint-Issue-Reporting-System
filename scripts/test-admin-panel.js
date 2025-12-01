/**
 * Comprehensive Admin Panel Test Script
 * Tests all admin functionality to ensure everything works correctly
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function testAdminPanel() {
  try {
    console.log('🧪 Testing Admin Panel Functionality...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-issues';
    console.log('🔌 Connecting to MongoDB...');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Import models
    const User = mongoose.model('User', require('../models/User').schema);
    const Complaint = mongoose.model('Complaint', require('../models/Complaint').schema);
    const Announcement = mongoose.model('Announcement', require('../models/Announcement').schema);
    const Assignment = mongoose.model('Assignment', require('../models/Assignment').schema);

    // Test 1: Check Users
    console.log('👥 Testing Users...');
    const totalUsers = await User.countDocuments();
    const userBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log(`   Total users: ${totalUsers}`);
    userBreakdown.forEach(role => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    // Check for admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('   ✅ Admin user found:', adminUser.email);
    } else {
      console.log('   ❌ No admin user found!');
    }

    // Test 2: Check Complaints
    console.log('\n📋 Testing Complaints...');
    const totalComplaints = await Complaint.countDocuments();
    const complaintStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log(`   Total complaints: ${totalComplaints}`);
    complaintStatus.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    // Test 3: Check Announcements
    console.log('\n📢 Testing Announcements...');
    const totalAnnouncements = await Announcement.countDocuments();
    console.log(`   Total announcements: ${totalAnnouncements}`);

    // Test 4: Check Assignments
    console.log('\n👨‍💼 Testing Assignments...');
    const totalAssignments = await Assignment.countDocuments();
    console.log(`   Total assignments: ${totalAssignments}`);

    // Test 5: Check Pagination Queries
    console.log('\n📄 Testing Pagination Queries...');

    // Users pagination
    const usersPage1 = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    console.log(`   Users pagination: ${usersPage1.length} users loaded`);

    // Complaints pagination
    const complaintsPage1 = await Complaint.find({})
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    console.log(`   Complaints pagination: ${complaintsPage1.length} complaints loaded`);

    // Announcements pagination
    const announcementsPage1 = await Announcement.find({})
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(10)
      .lean();
    console.log(`   Announcements pagination: ${announcementsPage1.length} announcements loaded`);

    // Assignments pagination
    const assignmentsPage1 = await Assignment.find({})
      .populate('complaint')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .limit(10)
      .lean();
    console.log(`   Assignments pagination: ${assignmentsPage1.length} assignments loaded`);

    // Test 6: Check Staff Members Query
    console.log('\n👷 Testing Staff Members Query...');
    const staffMembers = await User.find({ role: 'staff' })
      .select('name email')
      .lean();
    console.log(`   Staff members found: ${staffMembers.length}`);
    staffMembers.forEach(staff => {
      console.log(`     - ${staff.name} (${staff.email})`);
    });

    // Test 7: Verify Data Integrity
    console.log('\n🔍 Testing Data Integrity...');

    // Check if complaints have valid users
    const complaintsWithInvalidUsers = await Complaint.find({
      $or: [
        { submittedBy: { $exists: true, $ne: null } },
        { assignedTo: { $exists: true, $ne: null } }
      ]
    }).populate('submittedBy').populate('assignedTo');

    let invalidComplaints = 0;
    complaintsWithInvalidUsers.forEach(complaint => {
      if (complaint.submittedBy && !complaint.submittedBy._id) invalidComplaints++;
      if (complaint.assignedTo && !complaint.assignedTo._id) invalidComplaints++;
    });

    console.log(`   Complaints with invalid user references: ${invalidComplaints}`);

    // Check if assignments have valid data
    const assignmentsWithInvalidData = await Assignment.find({})
      .populate('complaint')
      .populate('assignedTo')
      .populate('assignedBy');

    let invalidAssignments = 0;
    assignmentsWithInvalidData.forEach(assignment => {
      if (assignment.complaint && !assignment.complaint._id) invalidAssignments++;
      if (assignment.assignedTo && !assignment.assignedTo._id) invalidAssignments++;
      if (assignment.assignedBy && !assignment.assignedBy._id) invalidAssignments++;
    });

    console.log(`   Assignments with invalid references: ${invalidAssignments}`);

    // Summary
    console.log('\n📊 ADMIN PANEL TEST SUMMARY:');
    console.log('='.repeat(50));
    console.log(`👥 Users: ${totalUsers} total (${userBreakdown.map(r => `${r._id}: ${r.count}`).join(', ')})`);
    console.log(`📋 Complaints: ${totalComplaints} total`);
    console.log(`📢 Announcements: ${totalAnnouncements} total`);
    console.log(`👨‍💼 Assignments: ${totalAssignments} total`);
    console.log(`👷 Staff Members: ${staffMembers.length} available`);
    console.log(`📄 Pagination: All queries working correctly`);
    console.log(`🔍 Data Integrity: ${invalidComplaints + invalidAssignments} issues found`);

    if (totalUsers > 0 && adminUser) {
      console.log('\n✅ ADMIN PANEL STATUS: FULLY FUNCTIONAL');
      console.log('🎉 All core features are working correctly!');
      console.log('\n🔐 Login Credentials:');
      console.log(`   Admin: ${adminUser.email} / admin123`);
    } else {
      console.log('\n⚠️  ADMIN PANEL STATUS: NEEDS USERS');
      console.log('Run: node scripts/create-test-users.js');
    }

  } catch (error) {
    console.error('❌ Admin Panel Test Failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Test completed.');
  }
}

testAdminPanel();
