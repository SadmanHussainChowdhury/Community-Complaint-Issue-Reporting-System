# 🔐 Login Credentials

## Quick Reference

After running the user creation script, use these credentials to sign in:

### 👤 Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Dashboard**: `/admin/dashboard`
- **Access**: Full system access - manage all complaints, users, announcements, and assignments

### 👤 Staff User
- **Email**: `staff@example.com`
- **Password**: `staff123`
- **Dashboard**: `/staff/dashboard`
- **Access**: View and manage assigned complaints, add notes, update status, upload resolution proof

### 👤 Resident User
- **Email**: `resident@example.com`
- **Password**: `resident123`
- **Dashboard**: `/resident/dashboard`
- **Access**: Submit complaints, view own complaints, track status, provide feedback on resolved complaints

## 🚀 How to Sign In

1. Navigate to: `http://localhost:3000/auth/signin`
2. Enter the email and password for the role you want to test
3. Click "Sign in"
4. You'll be automatically redirected to the appropriate dashboard based on your role

## 📝 Create Users

If users don't exist yet, run:

```bash
npm run create-users
```

Or:

```bash
npx ts-node scripts/create-test-users.ts
```

## ⚠️ Security Note

These are test credentials. In production, use strong passwords and implement proper password policies.

