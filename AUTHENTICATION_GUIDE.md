# Authentication Guide - All Roles

## Overview

The authentication system supports three roles:
- **Admin** - Full system access
- **Staff** - Manage assigned complaints
- **Resident** - Submit and track complaints

## Authentication Flow

### 1. Sign In Process

All users sign in through `/auth/signin`:

1. Enter email and password
2. Or use quick sign-in buttons (Admin, Staff, Resident)
3. System authenticates via NextAuth.js
4. User is redirected to their role-specific dashboard

### 2. Role-Based Redirects

After successful sign-in:
- **Admin** → `/admin/dashboard`
- **Staff** → `/staff/dashboard`
- **Resident** → `/resident/dashboard`

### 3. Route Protection

Middleware protects routes based on role:

- `/admin/*` - Admin only
- `/staff/*` - Staff and Admin
- `/resident/*` - Resident only

Unauthorized access attempts redirect to home page or sign-in.

## Test Credentials

### Admin
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Access**: Full system management

### Staff
- **Email**: `staff@example.com`
- **Password**: `staff123`
- **Access**: View and manage assigned complaints

### Resident
- **Email**: `resident@example.com`
- **Password**: `resident123`
- **Access**: Submit complaints, view own complaints, provide feedback

## Creating Test Users

Run this command to create all test users:

```bash
node scripts/create-users-simple.js
```

Or:

```bash
npm run create-users
```

## Authentication Features

### ✅ What Works

1. **Email/Password Authentication**
   - All roles can sign in with email and password
   - Passwords are hashed with bcrypt
   - Email is case-insensitive

2. **Session Management**
   - JWT-based sessions
   - 30-day session duration
   - Automatic session refresh

3. **Role-Based Access Control**
   - Middleware enforces role restrictions
   - Dashboard pages check role on load
   - API routes verify role permissions

4. **Quick Sign-In**
   - One-click sign-in buttons for testing
   - Auto-fills credentials
   - Direct redirect to appropriate dashboard

5. **Automatic Redirects**
   - Root page redirects authenticated users to their dashboards
   - Sign-in page redirects based on role after authentication
   - Protected routes redirect unauthorized users

### 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based sessions
- Role-based route protection
- Account activation check (`isActive` field)
- Email normalization (lowercase)
- Session expiration

## Troubleshooting

### "Invalid credentials or account is inactive"

**Cause**: User doesn't exist or account is inactive

**Solution**:
1. Run `node scripts/create-users-simple.js` to create test users
2. Check that `isActive: true` in database
3. Verify email is correct (case-insensitive)

### "Access denied" on dashboard

**Cause**: User role doesn't match route requirements

**Solution**:
1. Check user role in database
2. Verify middleware configuration
3. Ensure user has correct role assigned

### Session not persisting

**Cause**: NEXTAUTH_SECRET not set or invalid

**Solution**:
1. Set `NEXTAUTH_SECRET` in `.env.local`
2. Use a strong random string
3. Restart the development server

## API Authentication

All API routes check authentication:

```typescript
const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Role checks for admin-only routes:

```typescript
if (session.user.role !== UserRole.ADMIN) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Dashboard Access

### Admin Dashboard (`/admin/dashboard`)
- View all complaints
- Manage users
- Create announcements
- View analytics
- Manage assignments

### Staff Dashboard (`/staff/dashboard`)
- View assigned complaints
- Update complaint status
- Add notes and resolution proof
- Track assigned complaint statistics

### Resident Dashboard (`/resident/dashboard`)
- View own complaints
- Submit new complaints
- Track complaint status
- Provide feedback on resolved complaints

## Sign Out

All roles can sign out:
- Click "Sign Out" in navbar
- Redirects to `/auth/signin`
- Session is cleared

## Next Steps

1. **Create Test Users**: Run the user creation script
2. **Test Sign-In**: Use quick sign-in buttons or manual entry
3. **Verify Access**: Check that each role can access their dashboard
4. **Test Protection**: Try accessing other role's routes (should be blocked)

