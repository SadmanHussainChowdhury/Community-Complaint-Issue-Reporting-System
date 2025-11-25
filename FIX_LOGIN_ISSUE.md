# Fix "Invalid credentials or account is inactive" Error

## Quick Fix

The error means the test users don't exist in your database yet. Follow these steps:

### Step 1: Install dotenv (if needed)

If you get an error about `dotenv` not found, install it:

```bash
npm install dotenv --save-dev
```

### Step 2: Create Test Users

Run this command in your project directory:

```bash
node scripts/create-users-simple.js
```

Or if you have ts-node:

```bash
npm run create-users
```

**Note:** Make sure `MONGODB_URI` is set in your `.env.local` file.

### Step 2: Verify Users Were Created

The script will verify each user and show:
- ✅ User exists and password is valid
- ❌ User not found or password invalid

### Step 3: Try Signing In Again

After creating users, try the quick sign-in buttons on the sign-in page again.

## Troubleshooting

### If the script fails:

1. **Check MongoDB Connection**
   - Make sure `MONGODB_URI` is set in `.env.local`
   - Test connection: The script will show "✅ Connected to MongoDB"

2. **Check if users already exist**
   - The script will show if users already exist
   - It will update passwords if they're incorrect
   - It will activate users if they're inactive

3. **Manual Verification**
   - Check MongoDB directly to see if users exist
   - Verify `isActive` field is `true`
   - Check that email is lowercase

### Common Issues

**Issue: "User already exists" but can't login**
- Solution: The script will update the password automatically
- Run the script again to fix passwords

**Issue: "Account is inactive"**
- Solution: The script will activate users automatically
- Check `isActive: true` in database

**Issue: "Invalid credentials"**
- Solution: The script will reset passwords to the test values
- Make sure you're using the exact credentials:
  - Admin: admin@example.com / admin123
  - Staff: staff@example.com / staff123
  - Resident: resident@example.com / resident123

## Alternative: Create Users via API (After Admin Login)

If you already have an admin account:

1. Sign in as admin
2. Go to `/admin/users` (if available)
3. Create users manually through the UI

## Still Having Issues?

1. Check the console output from the script
2. Verify MongoDB connection string is correct
3. Make sure the database name in the connection string is correct
4. Check that the User model matches the schema

