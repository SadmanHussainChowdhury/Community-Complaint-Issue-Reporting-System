# Vercel Deployment Guide

## Environment Variables Setup

Your Vercel deployment is failing because required environment variables are not configured. Follow these steps to set them up:

### 1. Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project: `Community-Complaint-Issue-Reporting-System`
3. Go to **Settings** → **Environment Variables**

### 2. Required Environment Variables

Add these environment variables in your Vercel project settings:

#### **Database (Required)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/community-issues?retryWrites=true&w=majority
```

#### **NextAuth.js (Required)**
```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

#### **Cloudinary (Required for image uploads)**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### **Pusher (Optional - for real-time updates)**
```
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2
```

#### **Email Configuration (Optional - for notifications)**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@communityhub.com
ADMIN_EMAIL_RECIPIENT=admin@yourdomain.com
```

### 3. How to Get These Values

#### **MongoDB Atlas**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (for Vercel)
5. Get connection string from "Connect" → "Connect your application"

#### **NextAuth Secret**
Generate a secure random string:
```bash
openssl rand -base64 32
```
Or use an online generator for a 32+ character random string.

#### **Cloudinary**
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Account Details
3. Copy Cloud Name, API Key, and API Secret

#### **Pusher (Optional)**
1. Create account at [pusher.com](https://pusher.com)
2. Create a new app
3. Copy App ID, Key, Secret, and Cluster

### 4. Vercel Environment Variable Setup

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter each variable with its value
5. Set **Environment** to **Production** (and Preview if needed)
6. Click **Save**

### 5. Redeploy

After setting all environment variables:
1. Go to **Deployments** in your Vercel dashboard
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**

### 6. Troubleshooting

If deployment still fails:

1. **Check Build Logs**: Go to the deployment → **View Logs**
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Check NEXTAUTH_URL**: Must match your Vercel domain exactly
4. **Database Connection**: Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### 7. Required vs Optional Variables

**Required for basic functionality:**
- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `CLOUDINARY_*` (if using image uploads)

**Optional (app works without them):**
- `PUSHER_*` (real-time features)
- `EMAIL_*` (email notifications)

### 8. Security Notes

- Never commit `.env.local` files to Git
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate API keys and secrets
- Use restricted MongoDB Atlas access when possible

---

**Once you've set all the environment variables, redeploy your application and it should work successfully!** 🚀
