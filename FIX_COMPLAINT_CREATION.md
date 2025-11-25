# Fix Complaint Creation Issues

## Problem
"Failed to create complaint" error when submitting complaints

## Root Cause
Missing environment variables required for database connection and authentication

## Solution

### 1. Create Environment File

Create a `.env.local` file in the project root directory with the following content:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/community-issues

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars-long-random-string

# Cloudinary (Optional - for image uploads)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Optional - for notifications)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# EMAIL_FROM=your-email@gmail.com
# ADMIN_EMAIL_RECIPIENT=admin@yourdomain.com

# Pusher (Optional - for real-time updates)
# PUSHER_APP_ID=your-app-id
# PUSHER_KEY=your-key
# PUSHER_SECRET=your-secret
# PUSHER_CLUSTER=us2
```

### 2. Generate NEXTAUTH_SECRET

You can generate a secure secret using OpenSSL:

```bash
openssl rand -base64 32
```

Or use an online generator for a random 32-character string.

### 3. Set Up MongoDB

Make sure MongoDB is running locally on port 27017, or update the MONGODB_URI to point to your MongoDB instance.

### 4. Create Admin User

After setting up the environment, create an admin user:

```bash
npx ts-node scripts/create-admin.ts
```

### 5. Restart Development Server

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

## Testing Complaint Creation

1. Sign in with admin credentials
2. Go to resident dashboard: `/resident/dashboard`
3. Click "Submit New Complaint"
4. Fill out the form and submit
5. Check admin panel: `/admin/complaints` to verify the complaint appears

## Troubleshooting

### If Still Getting Errors:

1. **Check Browser Console**: Look for network errors or authentication issues
2. **Check Server Logs**: Look for database connection errors
3. **Verify Environment Variables**: Make sure all required variables are set
4. **Check MongoDB**: Ensure MongoDB is running and accessible

### Common Issues:

- **401 Unauthorized**: Check if user is properly authenticated
- **Database Connection Failed**: Verify MONGODB_URI is correct
- **Missing Required Fields**: Ensure title, description, and category are provided
- **Image Upload Failed**: Cloudinary configuration may be missing (optional)

## Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | ✅ | Database connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret |
| `NEXTAUTH_URL` | ✅ | Application URL for NextAuth |
| `CLOUDINARY_*` | ❌ | Image upload functionality |
| `EMAIL_*` | ❌ | Email notifications |
| `PUSHER_*` | ❌ | Real-time updates |

## Quick Test

After setup, test with:

1. Visit `http://localhost:3000/auth/signin`
2. Use quick admin access button
3. Submit a test complaint
4. Verify it appears in admin panel
