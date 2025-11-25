# Troubleshooting: Staff & Resident Authentication

## Quick Diagnostic

Run this command to check if users exist:

```bash
node scripts/check-users.js
```

This will show:
- ✅ If users exist
- ✅ If passwords are correct
- ✅ If users are active
- ✅ If roles match

## Common Issues & Solutions

### Issue 1: "Invalid credentials or account is inactive"

**Cause**: Users don't exist in database

**Solution**:
```bash
node scripts/create-users-simple.js
```

This will:
- Create all three test users
- Set correct passwords
- Activate all accounts
- Verify authentication works

### Issue 2: Users exist but can't sign in

**Possible Causes**:
1. Password is incorrect
2. User is inactive (`isActive: false`)
3. Role doesn't match

**Solution**:
Run the create script again - it will fix existing users:
```bash
node scripts/create-users-simple.js
```

### Issue 3: Sign in works but redirect fails

**Cause**: Session not updating fast enough

**Solution**: 
The code now redirects to root page (`/`) which automatically redirects based on role. This is more reliable.

### Issue 4: Can sign in but can't access dashboard

**Cause**: Role mismatch or middleware blocking

**Check**:
1. Verify user role in database matches enum values:
   - `'admin'` (not `'Admin'` or `'ADMIN'`)
   - `'staff'` (not `'Staff'` or `'STAFF'`)
   - `'resident'` (not `'Resident'` or `'RESIDENT'`)

2. Check middleware is allowing access:
   - Staff can access `/staff/*`
   - Resident can access `/resident/*`

## Step-by-Step Fix

### Step 1: Check Users Exist
```bash
node scripts/check-users.js
```

### Step 2: Create/Fix Users
```bash
node scripts/create-users-simple.js
```

### Step 3: Verify Users
```bash
node scripts/check-users.js
```

You should see:
```
✅ staff@example.com
   Role: staff (expected: staff)
   Active: true
   Password Valid: true

✅ resident@example.com
   Role: resident (expected: resident)
   Active: true
   Password Valid: true
```

### Step 4: Test Sign-In

1. Go to `/auth/signin`
2. Click "Staff" button
3. Should redirect to `/staff/dashboard`

Or:

1. Go to `/auth/signin`
2. Click "Resident" button
3. Should redirect to `/resident/dashboard`

## Manual Database Check

If you have MongoDB access, check directly:

```javascript
// In MongoDB shell or Compass
db.users.find({ email: { $in: ['staff@example.com', 'resident@example.com'] } })
```

Verify:
- `role` is exactly `'staff'` or `'resident'` (lowercase)
- `isActive` is `true`
- `password` field exists (hashed)

## Authentication Flow

1. User enters credentials
2. NextAuth calls `authorize()` function
3. Function checks:
   - User exists
   - User is active
   - Password is correct
4. Returns user object with role
5. Role is stored in JWT token
6. Session includes role
7. Redirect based on role

## Still Not Working?

1. **Check browser console** for errors
2. **Check server logs** for authentication errors
3. **Verify MongoDB connection** is working
4. **Check `.env.local`** has correct `MONGODB_URI`
5. **Restart dev server** after creating users

## Test Credentials

After running the create script, use:

**Staff**:
- Email: `staff@example.com`
- Password: `staff123`

**Resident**:
- Email: `resident@example.com`
- Password: `resident123`

