# Quick Fix: Staff & Resident Login Error

## Problem
Getting "Invalid credentials or account is inactive" when trying to sign in as staff or resident.

## Solution: Create Test Users

### Step 1: Install dotenv (if not already installed)
```bash
npm install dotenv --save-dev
```

### Step 2: Run the User Creation Script
```bash
node scripts/create-users-simple.js
```

This will create:
- ✅ **Admin**: admin@example.com / admin123
- ✅ **Staff**: staff@example.com / staff123  
- ✅ **Resident**: resident@example.com / resident123

### Step 3: Verify Users Were Created
The script will show:
- ✅ User created successfully
- ✅ Password verification passed
- ✅ User is active

### Step 4: Try Signing In Again
Use the quick sign-in buttons on the sign-in page or enter credentials manually.

## What the Script Does

1. **Connects to MongoDB** using your `MONGODB_URI` from `.env.local`
2. **Creates all three test users** (admin, staff, resident)
3. **Hashes passwords** automatically
4. **Sets isActive to true** for all users
5. **Verifies each user** can authenticate successfully
6. **Updates existing users** if they already exist (fixes passwords, activates accounts)

## Troubleshooting

### Error: "MONGODB_URI not found"
- Make sure `.env.local` file exists in the project root
- Add: `MONGODB_URI=your_mongodb_connection_string`

### Error: "dotenv is not defined"
- Run: `npm install dotenv --save-dev`

### Error: "Cannot connect to MongoDB"
- Check your MongoDB connection string
- Make sure MongoDB is running
- Verify network connectivity

### Users exist but still can't login
- The script will automatically fix passwords and activate accounts
- Run the script again - it will update existing users

## Manual Verification

After running the script, you should see output like:

```
✅ Created staff: staff@example.com
   Name: Staff Member
   Password: staff123
   Role: staff
   Active: true

✅ Created resident: resident@example.com
   Name: Resident User
   Password: resident123
   Role: resident
   Active: true

🔍 Verifying users...

✅ staff@example.com - Password: Valid - Active: true
✅ resident@example.com - Password: Valid - Active: true
```

## After Creating Users

1. Go to `/auth/signin`
2. Click the **Staff** or **Resident** quick sign-in button
3. Or manually enter:
   - Staff: staff@example.com / staff123
   - Resident: resident@example.com / resident123

