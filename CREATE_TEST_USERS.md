# Create Test Users for All Roles

This guide will help you create test users for Admin, Staff, and Resident roles.

## Method 1: Using npm script (Recommended)

Run the npm script to create all three test users at once:

```bash
npm run create-users
```

Or using ts-node directly:

```bash
npx ts-node scripts/create-test-users.ts
```

Or using Node.js directly (if you have dotenv installed):

```bash
node scripts/create-test-users.js
```

This will create:
- **Admin**: admin@example.com / admin123
- **Staff**: staff@example.com / staff123
- **Resident**: resident@example.com / resident123

## Method 2: Using the API (After Admin Login)

1. First, sign in as admin using: admin@example.com / admin123
2. Navigate to `/admin/users` (if available) or use the API directly
3. Create users via POST request to `/api/users` (requires admin authentication)

## Method 3: Manual Database Entry

You can also create users directly in MongoDB if needed.

## Test User Credentials

After running the script, use these credentials to sign in:

### 👤 Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: Full system access, can manage all complaints, users, and announcements

### 👤 Staff User
- **Email**: staff@example.com
- **Password**: staff123
- **Access**: Can view and manage assigned complaints, add notes, update status

### 👤 Resident User
- **Email**: resident@example.com
- **Password**: resident123
- **Access**: Can submit complaints, view own complaints, provide feedback

## Sign In Steps

1. Navigate to `/auth/signin`
2. Enter the email and password for the role you want to test
3. You'll be redirected to the appropriate dashboard:
   - Admin → `/admin/dashboard`
   - Staff → `/staff/dashboard`
   - Resident → `/resident/dashboard`

## Notes

- All users are created with `isActive: true`
- Passwords are automatically hashed by the User model
- If a user already exists, the script will skip creating it
- You can change passwords after first login (if password change feature is implemented)

