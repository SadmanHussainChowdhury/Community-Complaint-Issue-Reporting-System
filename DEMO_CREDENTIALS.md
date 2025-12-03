# 🔐 Demo & Test Credentials

This document provides test credentials for evaluating CommunityHub Pro.

## ⚠️ Important Security Notice

**These are default test credentials. Change all passwords immediately after installation!**

For production deployments, always:
- Change default passwords
- Use strong, unique passwords
- Enable two-factor authentication (if available)
- Regularly rotate credentials

---

## 🎯 Quick Start Test Accounts

### Admin Account

```
Email: admin@example.com
Password: Admin123!
Role: Admin
Access: Full system access
```

**Capabilities:**
- Manage all users (Create, Edit, Delete)
- View and manage all complaints
- Create announcements
- Assign complaints to staff
- Access analytics dashboard
- Configure system settings
- Manage monthly fees
- Send bulk SMS/Email
- Generate resident cards

### Staff Account

```
Email: staff@example.com
Password: Staff123!
Role: Staff
Access: Staff dashboard and assigned complaints
```

**Capabilities:**
- View assigned complaints
- Update complaint status
- Upload resolution proof
- Add notes to complaints
- View performance metrics

### Resident Account

```
Email: resident@example.com
Password: Resident123!
Role: Resident
Access: Resident dashboard and own complaints
```

**Capabilities:**
- Submit new complaints
- View own complaints
- Edit pending complaints
- Track complaint status
- View announcements
- Rate resolved complaints

---

## 🛠️ Creating Test Users

### Method 1: Using API Endpoint

```bash
# Create Admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "admin"
  }'

# Create Staff
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staff User",
    "email": "staff@example.com",
    "password": "Staff123!",
    "role": "staff"
  }'

# Create Resident
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Resident User",
    "email": "resident@example.com",
    "password": "Resident123!",
    "role": "resident",
    "apartment": "101",
    "building": "A"
  }'
```

### Method 2: Using Script

```bash
npm run create-users
```

This will create test users for all roles.

### Method 3: Using Admin Panel

1. Log in as admin
2. Go to **Users** → **Add User**
3. Fill in user details
4. Select role
5. Click **Create**

---

## 📋 Test Scenarios

### Scenario 1: Complete Complaint Workflow

1. **Login as Resident**
   - Email: `resident@example.com`
   - Password: `Resident123!`

2. **Submit a Complaint**
   - Go to Dashboard → New Complaint
   - Fill in complaint details
   - Upload images
   - Submit

3. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `Admin123!`

4. **Assign to Staff**
   - Go to Complaints → Select complaint
   - Assign to staff member
   - Set priority and due date

5. **Login as Staff**
   - Email: `staff@example.com`
   - Password: `Staff123!`

6. **Update Status**
   - View assigned complaint
   - Update status to "In Progress"
   - Add notes
   - Upload resolution proof
   - Mark as "Resolved"

7. **Resident Feedback**
   - Login as resident
   - View resolved complaint
   - Submit feedback and rating

### Scenario 2: Admin Operations

1. **User Management**
   - Create new users
   - Edit user details
   - Activate/Deactivate users
   - Delete users

2. **Monthly Fees**
   - Create monthly fees for residents
   - Mark fees as paid
   - Export fee reports

3. **Bulk Messaging**
   - Send SMS to all residents
   - Send email announcements
   - Target specific user groups

4. **Analytics**
   - View dashboard statistics
   - Analyze complaint trends
   - Check staff performance

---

## 🔄 Resetting Test Data

### Clear All Data (Development Only)

```bash
# Connect to MongoDB
mongosh "your-mongodb-uri"

# Drop collections (CAUTION: This deletes all data!)
use communityhub
db.users.deleteMany({})
db.complaints.deleteMany({})
db.announcements.deleteMany({})
db.assignments.deleteMany({})
db.monthlyfees.deleteMany({})
```

### Recreate Test Users

After clearing data, run:

```bash
npm run create-users
```

---

## 🎭 Demo Data Script

For a complete demo experience, you can create sample data:

```bash
# Run test data generation script
node scripts/generate-test-users.js
```

This creates:
- 10 Resident users
- 3 Staff users
- 1 Admin user
- Sample complaints
- Sample announcements

---

## 🔒 Security Best Practices

1. **Never use default passwords in production**
2. **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
3. **Enable HTTPS** in production
4. **Regularly update dependencies**
5. **Monitor access logs**
6. **Implement rate limiting**
7. **Use environment variables** for all secrets
8. **Regular security audits**

---

## 📞 Support

If you encounter issues with test credentials:

1. Check the [Troubleshooting Guide](README.md#-troubleshooting)
2. Verify MongoDB connection
3. Check environment variables
4. Review [Installation Guide](INSTALLATION.md)
5. Contact support: support@communityhub.pro

---

**Note**: These credentials are for testing purposes only. Always change default passwords before deploying to production!

