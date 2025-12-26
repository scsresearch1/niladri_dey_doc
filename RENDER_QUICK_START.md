# Render Deployment - Quick Start

## 🚀 5-Minute Setup

### Step 1: Go to Render
Visit: **https://render.com** → Sign up with GitHub

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect repository: **`scsresearch1/niladri_dey_doc`**

### Step 3: Configure
- **Name**: `phd-load-balancing-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (or Starter for production)

### Step 4: Environment Variables
Add these:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.netlify.app
```
*(Replace with your actual Netlify URL)*

### Step 5: Deploy
Click **"Create Web Service"** → Wait for build (2-5 min)

### Step 6: Get Backend URL
Copy your backend URL: `https://your-backend.onrender.com`

### Step 7: Update Netlify
1. Netlify Dashboard → Site Settings → Environment Variables
2. Add: `REACT_APP_API_URL` = `https://your-backend.onrender.com`
3. Redeploy site

### Step 8: Upload Datasets
- Option A: Render Shell (SSH) - upload via SFTP
- Option B: Render Persistent Disk - mount and upload
- Option C: Git LFS (if dataset is small enough)

---

## ✅ Test
- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: Your Netlify URL

---

**See `RENDER_DEPLOYMENT.md` for detailed instructions!**

