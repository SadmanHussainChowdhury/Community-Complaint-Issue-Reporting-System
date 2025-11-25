# Local Development Setup Guide

This guide will help you set up and run the Community Issue Reporting System locally.

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm** or **yarn** or **pnpm** package manager
- **MongoDB Atlas account** (free tier is fine) - https://www.mongodb.com/cloud/atlas
- **Cloudinary account** (free tier is fine) - https://cloudinary.com
- **Pusher account** (optional, for real-time features) - https://pusher.com

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Step 2: Create Environment Variables File

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Configuration (REQUIRED)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/community-issues?retryWrites=true&w=majority

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Cloudinary Configuration (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Pusher Configuration (OPTIONAL - for real-time features)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
```

### How to Get Each Value:

#### MongoDB URI
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user (Database Access → Add New Database User)
4. Whitelist your IP (Network Access → Add IP Address → Allow Access from Anywhere for dev)
5. Get connection string (Database → Connect → Connect your application)
6. Replace `<username>` and `<password>` with your credentials
7. Add database name: `/community-issues` before `?retryWrites`

#### NEXTAUTH_SECRET
Generate a secure random string:
```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# On Mac/Linux
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

#### Cloudinary Credentials
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy `Cloud name`, `API Key`, and `API Secret`

#### Pusher Credentials (Optional)
1. Sign up at https://pusher.com
2. Create a new app
3. Copy `App ID`, `Key`, `Secret`, and `Cluster`

## Step 3: Create Admin User

After setting up your `.env.local` file, create an admin user:

```bash
# Option 1: Using environment variables
set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=admin123
npx ts-node scripts/create-admin.ts

# Option 2: Edit scripts/create-admin.ts directly with your credentials
```

## Step 4: Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at: **http://localhost:3000**

## Step 5: Verify Setup

1. **Check MongoDB Connection**
   - Visit: http://localhost:3000/api/dashboard
   - Should return dashboard data (may need to sign in first)

2. **Sign In**
   - Go to: http://localhost:3000/auth/signin
   - Use the admin credentials you created

3. **Test Image Upload**
   - Try creating a complaint with an image
   - Should upload to Cloudinary successfully

## Troubleshooting

### "MONGODB_URI is not set"
- Make sure `.env.local` exists in the root directory
- Restart the dev server after creating/modifying `.env.local`
- Check that variable name is exactly `MONGODB_URI` (no typos)

### "MongoServerError: authentication failed"
- Verify username and password in connection string
- URL encode special characters in password
- Check database user has correct permissions

### "IP not whitelisted"
- Go to MongoDB Atlas → Network Access
- Add your current IP or allow `0.0.0.0/0` for development

### "NEXTAUTH_SECRET is missing"
- Make sure `NEXTAUTH_SECRET` is set in `.env.local`
- Must be at least 32 characters long
- Restart dev server after adding

### Image upload fails
- Verify Cloudinary credentials are correct
- Check API key has upload permissions
- Ensure file size is under 10MB

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

## Development Mode

The app runs in **development mode** by default when using `npm run dev`. This provides:
- Hot module reloading
- Detailed error messages
- Source maps for debugging
- Fast refresh for React components

## Next Steps

1. Create additional users (Residents, Staff) through the admin panel
2. Test complaint submission and management
3. Explore the different role-based dashboards
4. Test real-time updates (if Pusher is configured)

## Production Build

To test production build locally:

```bash
npm run build
npm start
```

This will run the app in production mode on http://localhost:3000

---

**Need Help?** Check the main [README.md](./README.md) for more information.

