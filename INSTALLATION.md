# 📦 Installation Guide - CommunityHub Pro

Complete step-by-step installation guide for CommunityHub Pro Community Management System.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 10.0.0 or higher (comes with Node.js)
- **MongoDB** account (MongoDB Atlas recommended) ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git** (for cloning the repository)

### Optional Services (for full functionality):
- **Cloudinary** account (for image uploads) ([Sign up](https://cloudinary.com/))
- **Twilio** account (for SMS functionality) ([Sign up](https://www.twilio.com/))
- **Pusher** account (for real-time features) ([Sign up](https://pusher.com/))
- **Email SMTP** credentials (for email notifications)

---

## 🚀 Quick Installation

### Step 1: Clone or Download the Repository

```bash
# If using Git
git clone https://github.com/SadmanHussainChowdhury/Community-Complaint-Issue-Reporting-System.git

# Or download and extract the ZIP file
cd Community-Complaint-Issue-Reporting-System
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Or create `.env.local` manually with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/communityhub?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Pusher (Optional - for real-time features)
NEXT_PUBLIC_PUSHER_APP_ID=your-app-id
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@communityhub.com
EMAIL_SECURE=false
```

### Step 4: Generate NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or use an online generator: https://generate-secret.vercel.app/32

### Step 5: Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string
7. Replace `<password>` and `<dbname>` in the connection string
8. Add it to `.env.local` as `MONGODB_URI`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/communityhub`

### Step 6: Run Database Migrations

The application will automatically create collections on first run. No manual migration needed.

### Step 7: Create Admin User

Run the admin creation script:

```bash
npm run create-users
```

Or use the API endpoint:

```bash
# POST request to create admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Step 8: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### Step 9: Access the Application

1. **Landing Page**: http://localhost:3000
2. **Sign In**: http://localhost:3000/auth/signin
3. **Admin Dashboard**: http://localhost:3000/admin/dashboard (after login)

---

## 🔐 Default Test Credentials

After creating the admin user, you can log in with:

```
Email: admin@example.com
Password: admin123
```

**⚠️ Important**: Change the default password immediately after first login!

---

## 📝 Post-Installation Setup

### 1. Configure Cloudinary (For Image Uploads)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to `.env.local`
4. Image uploads will now work for complaints

### 2. Configure Twilio (For SMS)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID, Auth Token, and Phone Number
3. Add them to `.env.local`
4. SMS bulk messaging will now work

### 3. Configure Email (For Notifications)

1. Set up SMTP credentials (Gmail, SendGrid, etc.)
2. Add email configuration to `.env.local`
3. Email notifications will now work

### 4. Configure Pusher (For Real-Time)

1. Sign up at [Pusher](https://pusher.com/)
2. Create a new app
3. Get App ID, Key, Secret, and Cluster
4. Add them to `.env.local`
5. Real-time updates will now work

---

## 🏗️ Production Build

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Update `.env.local` with production values:

```env
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=your-production-mongodb-uri
# ... other production credentials
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity
- Check MongoDB Atlas status

### Issue: NextAuth Errors

**Solution:**
- Verify `NEXTAUTH_SECRET` is at least 32 characters
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check console for specific errors

### Issue: Images Not Uploading

**Solution:**
- Verify Cloudinary credentials
- Check account storage limits
- Ensure file size < 10MB
- Check supported file formats (JPG, PNG, GIF, WebP)

### Issue: Build Errors

**Solution:**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version: `node --version` (should be 18+)
- Verify all dependencies are installed

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Additional Resources

- **Quick Start Guide**: See [QUICKSTART.md](QUICKSTART.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Features List**: See [FEATURES.md](FEATURES.md)
- **API Documentation**: See [README.md](README.md#-api-reference)

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Application starts without errors
- [ ] Can access landing page
- [ ] Can sign in with admin credentials
- [ ] Admin dashboard loads correctly
- [ ] Can create a new user
- [ ] Can submit a complaint (if Cloudinary configured)
- [ ] Database connection is working
- [ ] No console errors

---

## 🆘 Need Help?

- **Documentation**: Check [README.md](README.md)
- **Issues**: Open a GitHub issue
- **Support**: Contact support@communityhub.pro

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Installation completed successfully?** 🎉 Start using CommunityHub Pro!

