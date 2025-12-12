# Deployment Guide - Make Your App Accessible to Multiple Users

## 🎯 Quick Answer

**Your database IS shared!** The problem is your backend is only running on your local computer. You need to deploy it to a cloud server so your friend can access it.

## 📊 Architecture Explanation

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR CURRENT SETUP                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Friend's Browser  →  Can't reach →  Your Computer    │
│                                                          │
│  Your Browser      →  ✅ Works →  localhost:5000      │
│                                                          │
│  Database Files:                                        │
│  - backend/Merchantdb/merchant.db  (SHARED - all users) │
│  - backend/BookingDb/bookings.db   (SHARED - all users) │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  AFTER DEPLOYMENT                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Friend's Browser  →  ✅ Works →  Cloud Server         │
│  Your Browser      →  ✅ Works →  Cloud Server         │
│                                                          │
│  Database Files:                                        │
│  - On Cloud Server (SHARED - all users can access)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Option 1: Deploy to Railway (Easiest - FREE)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (free)
3. Click "New Project"

### Step 2: Prepare Your Backend

Create `backend/Procfile`:
```
web: node server.js
```

Update `backend/server.js` to use environment variable for port:
```javascript
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend Server is running on port ${PORT}`);
});
```

### Step 3: Deploy to Railway
1. In Railway, click "New" → "GitHub Repo"
2. Select your repository
3. Set **Root Directory** to `backend`
4. Railway will auto-detect Node.js
5. Click "Deploy"

### Step 4: Get Your Backend URL
- Railway gives you a URL like: `https://your-app.up.railway.app`
- Copy this URL

### Step 5: Update Frontend

Update `Merchant Portal Design/src/services/api.ts`:
```typescript
// Change this line:
const API_BASE_URL = 'http://localhost:5000/api';

// To this (use your Railway URL):
const API_BASE_URL = 'https://your-app.up.railway.app/api';
```

### Step 6: Deploy Frontend (Optional)

**Option A: Vercel (Recommended)**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Set root directory to `Merchant Portal Design`
5. Deploy!

**Option B: Netlify**
1. Go to https://netlify.com
2. Sign up
3. Deploy from Git
4. Set build command: `npm run build`
5. Set publish directory: `build`

## 🚀 Option 2: Deploy to Render (Also FREE)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up (free)

### Step 2: Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name:** `fein-booking-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Click "Create Web Service"

### Step 3: Update Frontend API URL
Same as Railway - update to Render URL

## 🚀 Option 3: Quick Test - Use ngrok (Temporary)

For quick testing with your friend:

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com
# Or use npm
npm install -g ngrok
```

### Step 2: Start Your Backend
```bash
cd backend
npm start
```

### Step 3: Expose with ngrok
```bash
ngrok http 5000
```

### Step 4: Get Public URL
ngrok gives you a URL like: `https://abc123.ngrok.io`

### Step 5: Update Frontend
```typescript
const API_BASE_URL = 'https://abc123.ngrok.io/api';
```

**⚠️ Note:** ngrok free tier gives you a random URL that changes each time. Good for testing, not for production.

## 📝 Environment Variables

When deploying, you may need to set:

**Railway/Render:**
- `NODE_ENV=production`
- `PORT` (usually auto-set)

**For CORS (if needed):**
Update `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'],
  credentials: true
}));
```

## 🔍 Verify It Works

### Test Backend is Live:
1. Open browser
2. Go to: `https://your-backend.railway.app/api/merchants`
3. Should see JSON data (or empty array `[]`)

### Test Signup:
1. Friend opens your frontend
2. Signs up with their email
3. Their account is saved in the shared database!

## 🗄️ Database Persistence

### Railway/Render:
- SQLite files persist on the server
- All users share the same database
- Data survives server restarts

### Backup Database:
```bash
# Download database from server
# Railway: Use Railway CLI
railway connect
# Then download files

# Or use Railway dashboard to view files
```

## 🎯 Summary

**What localStorage does:**
- Stores session info in browser (who's logged in)
- Each user has their own localStorage
- NOT shared between users

**What Database does:**
- Stores ALL data (users, bookings, merchants)
- SHARED by all users
- On the server (or cloud after deployment)

**To make it work for multiple users:**
1. Deploy backend to Railway/Render (free)
2. Update frontend API URL
3. Deploy frontend (optional but recommended)
4. Share frontend URL with your friend
5. Both of you can now sign up and use the app!

## 🆘 Troubleshooting

### Backend not accessible:
- Check Railway/Render logs
- Verify PORT is set correctly
- Check CORS settings

### Database not persisting:
- SQLite files should persist on server
- Check file paths are correct
- Verify database initialization runs

### Frontend can't connect:
- Check API_BASE_URL is correct
- Verify backend is running
- Check CORS settings allow your frontend domain

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- ngrok Docs: https://ngrok.com/docs


