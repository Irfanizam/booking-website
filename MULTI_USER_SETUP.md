# Multi-User Setup Guide

## 🔍 Current Architecture Explanation

### What localStorage Does (Client-Side Only)
- **Purpose:** Stores session information in the user's browser
- **Contains:** User ID, user data, merchant ID (temporary session data)
- **Location:** Each user's browser
- **Purpose:** So the app knows "who is logged in" without asking every time

### What Database Does (Server-Side - Shared)
- **Purpose:** Stores ALL actual data (users, bookings, merchants)
- **Location:** `backend/Merchantdb/merchant.db` and `backend/BookingDb/bookings.db`
- **Shared:** YES - All users access the SAME database
- **This is where your friend's account will be stored!**

## ✅ Good News!

**Your database IS shared!** When your friend signs up:
1. Their account is saved in `backend/Merchantdb/merchant.db` (users table)
2. Their bookings go to `backend/BookingDb/bookings.db`
3. Everyone uses the SAME database files

## ⚠️ The Problem: Local Development

Right now, your backend runs on `localhost:5000`, which means:
- Only accessible on YOUR computer
- Your friend can't access it from their computer
- You need to deploy it to a shared server

## 🚀 Solutions for Multi-User Access

### Option 1: Deploy to a Cloud Service (Recommended)

#### A. Deploy to Railway (Easiest - Free tier available)
1. Go to https://railway.app
2. Create account
3. New Project → Deploy from GitHub
4. Add environment variables
5. Your backend will be live at `https://your-app.railway.app`
6. Update frontend API URL to point to Railway URL

#### B. Deploy to Render (Free tier available)
1. Go to https://render.com
2. Create account
3. New Web Service
4. Connect GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Your backend will be live

#### C. Deploy to Heroku
1. Go to https://heroku.com
2. Create account
3. Create new app
4. Deploy via Git
5. Add buildpacks for Node.js
6. Deploy

### Option 2: Use a VPS (Virtual Private Server)

#### Recommended Providers:
- **DigitalOcean** ($5/month)
- **Linode** ($5/month)
- **Vultr** ($5/month)
- **AWS EC2** (Free tier available)

#### Steps:
1. Create VPS instance
2. Install Node.js
3. Upload your backend code
4. Run `npm install`
5. Run `npm start` (or use PM2 for production)
6. Set up domain name (optional)
7. Configure firewall

### Option 3: Use Your Own Computer as Server (Temporary)

If you want to test with your friend quickly:

1. **Find your local IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address
   ```

2. **Update backend to accept connections:**
   ```javascript
   // In backend/server.js
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

3. **Update frontend API URL:**
   ```typescript
   // In Merchant Portal Design/src/services/api.ts
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   // Example: 'http://192.168.1.100:5000/api'
   ```

4. **Configure firewall:**
   - Allow port 5000 through Windows Firewall
   - Your friend connects to `http://YOUR_IP:5000`

**⚠️ Note:** This only works if you're on the same network (same WiFi)

## 📋 Step-by-Step: Deploy to Railway (Recommended)

### 1. Prepare Your Code

Create `Procfile` in backend folder:
```
web: node server.js
```

### 2. Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### 3. Deploy Backend
1. Click "New" → "GitHub Repo"
2. Select your repository
3. Railway auto-detects Node.js
4. Set root directory to `backend`
5. Deploy!

### 4. Get Your Backend URL
- Railway gives you a URL like: `https://your-app.up.railway.app`
- Copy this URL

### 5. Update Frontend
```typescript
// Merchant Portal Design/src/services/api.ts
const API_BASE_URL = 'https://your-app.up.railway.app/api';
```

### 6. Deploy Frontend (Optional)
- Use Vercel, Netlify, or Railway
- Point to your frontend folder
- Set environment variables if needed

## 🔐 Database Considerations

### SQLite in Production
SQLite works for:
- ✅ Small to medium applications
- ✅ Up to ~100 concurrent users
- ✅ Simple deployments

For larger scale, consider:
- PostgreSQL (Railway, Render support this)
- MySQL
- MongoDB

### Migrating to PostgreSQL (If Needed Later)

If you outgrow SQLite:
1. Create PostgreSQL database on Railway/Render
2. Update database connection in `server.js`
3. Migrate data from SQLite to PostgreSQL

## 📊 Current Setup Summary

```
┌─────────────────┐
│   Your Friend   │
│   (Browser)     │
└────────┬────────┘
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Backend       │
│   (Node.js)     │
│   localhost:5000 │ ← Only accessible on YOUR computer
└────────┬────────┘
         │
         │ SQL Queries
         │
┌────────▼────────┐
│   Database      │
│   (SQLite)      │
│   merchant.db   │ ← Shared database (but local file)
│   bookings.db   │
└─────────────────┘
```

## 🎯 Quick Answer

**Question:** Can my friend create their own account?

**Answer:** YES! But you need to:
1. Deploy backend to a cloud service (Railway, Render, etc.)
2. Update frontend to point to deployed backend
3. Your friend can then sign up and their account will be in the shared database

**localStorage is just for session management** - the actual accounts are in the database, which IS shared once deployed!

## 🚀 Recommended Next Steps

1. **For Testing (Quick):**
   - Use Option 3 (local IP) if on same network
   - Or use ngrok to expose localhost

2. **For Production (Best):**
   - Deploy to Railway (free tier)
   - Update frontend API URL
   - Share the frontend URL with your friend

3. **For Better Performance:**
   - Consider PostgreSQL instead of SQLite
   - Use proper hosting with database support

## 📝 Environment Variables Needed

When deploying, you may need:
- `PORT` (usually auto-set by hosting)
- `NODE_ENV=production`
- Database path (if using SQLite)
- CORS origins (for frontend URL)

## 🔗 Additional Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Deploying Node.js: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/


