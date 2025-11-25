# Quick Start Guide

Get your Community Complaint & Issue Reporting System up and running in minutes!

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env.local`

### Step 4: Create Admin User
```bash
# Set admin credentials in .env.local first
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Then run the script
npx ts-node scripts/create-admin.ts
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Access the Application
Open [http://localhost:3000](http://localhost:3000)

Sign in with:
- Email: `admin@example.com`
- Password: `admin123`

## 📋 What's Next?

1. **Create Users**
   - Go to Admin Dashboard → Users
   - Create Resident and Staff accounts

2. **Test Complaints**
   - Sign in as a Resident
   - Submit a test complaint
   - Assign it to Staff (as Admin)
   - Update status (as Staff)

3. **Explore Features**
   - Create announcements
   - View analytics
   - Test real-time updates

## 🔧 Troubleshooting

### MongoDB Connection Error
- Verify your connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your URL
- Clear browser cookies

### Image Upload Fails
- Verify Cloudinary credentials
- Check API key permissions
- Ensure file size is under 10MB

## 📚 Need More Help?

- See [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review [FEATURES.md](./FEATURES.md) for feature list

---

**Happy Coding! 🎉**

