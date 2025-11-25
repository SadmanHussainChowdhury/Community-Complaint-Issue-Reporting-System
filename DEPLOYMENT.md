# Deployment Guide

This guide covers deploying the Community Complaint & Issue Reporting System to production.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- MongoDB Atlas account
- Cloudinary account
- Pusher account (optional, for real-time features)

## Step 1: Prepare Your Code

1. **Ensure all environment variables are documented**
   - Check `.env.local.example` for all required variables

2. **Test locally**
   ```bash
   npm run build
   npm start
   ```

3. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

## Step 2: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create a Cluster**
   - Choose your preferred cloud provider and region
   - Select M0 (Free) tier for development

3. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Save username and password securely

4. **Whitelist IP Addresses**
   - Go to Network Access
   - Add IP Address
   - For Vercel, you can use `0.0.0.0/0` (all IPs) or add Vercel's IP ranges

5. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 3: Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

## Step 4: Pusher Setup (Optional)

1. **Create Pusher Account**
   - Go to [pusher.com](https://pusher.com)
   - Sign up for free tier

2. **Create App**
   - Create a new Channels app
   - Choose your cluster (e.g., us2)
   - Get credentials:
     - App ID
     - Key
     - Secret
     - Cluster

## Step 5: Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub
   - Select your repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   
   Add all variables from `.env.local.example`:
   
   ```
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   PUSHER_APP_ID=your-app-id
   PUSHER_KEY=your-key
   PUSHER_SECRET=your-secret
   PUSHER_CLUSTER=us2
   ```

4. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app.vercel.app`

## Step 6: Post-Deployment

1. **Update NEXTAUTH_URL**
   - After first deployment, update `NEXTAUTH_URL` in Vercel
   - Redeploy if necessary

2. **Create Admin User**
   - Use MongoDB Compass or a script to create first admin user
   - Or create via MongoDB Atlas web interface

3. **Test the Application**
   - Visit your deployed URL
   - Sign in with admin credentials
   - Test all features

## Step 7: Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update NEXTAUTH_URL**
   - Update to your custom domain
   - Redeploy

## Environment Variables Reference

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Secret for JWT signing (min 32 chars)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Optional
- `PUSHER_APP_ID` - Pusher app ID (for real-time features)
- `PUSHER_KEY` - Pusher key
- `PUSHER_SECRET` - Pusher secret
- `PUSHER_CLUSTER` - Pusher cluster (e.g., us2)
- `ENABLE_MULTI_COMMUNITY` - Enable multi-community support
- `DEFAULT_COMMUNITY_ID` - Default community ID

## Troubleshooting

### Build Errors

1. **TypeScript Errors**
   ```bash
   npm run type-check
   ```
   Fix any TypeScript errors before deploying

2. **Missing Dependencies**
   ```bash
   npm install
   ```

### Runtime Errors

1. **Database Connection Issues**
   - Verify MongoDB Atlas IP whitelist includes Vercel IPs
   - Check connection string format
   - Verify database user credentials

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your deployment URL
   - Clear cookies and try again

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check API key permissions
   - Verify file size limits

### Performance Optimization

1. **Enable Caching**
   - Vercel automatically caches static assets
   - Use `revalidate` in Next.js for ISR

2. **Database Indexes**
   - Ensure MongoDB indexes are created
   - Check query performance

3. **Image Optimization**
   - Cloudinary automatically optimizes images
   - Use Next.js Image component

## Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor performance and errors

2. **MongoDB Atlas Monitoring**
   - Use Atlas dashboard for database metrics
   - Set up alerts

3. **Error Tracking**
   - Consider adding Sentry or similar
   - Monitor application errors

## Backup Strategy

1. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Configure backup schedule in Atlas

2. **Code Backups**
   - GitHub serves as code backup
   - Tag releases for version control

## Security Checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] MongoDB user with limited permissions
- [ ] IP whitelist configured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] Regular dependency updates

## Scaling Considerations

1. **Database**
   - Upgrade MongoDB Atlas tier as needed
   - Monitor connection pool usage

2. **Serverless Functions**
   - Vercel handles scaling automatically
   - Monitor function execution time

3. **CDN**
   - Vercel Edge Network for static assets
   - Cloudinary CDN for images

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Review environment variables
4. Test locally with production env vars

---

**Happy Deploying! 🚀**

