# Deployment Guide

## Overview

This is a **full-stack application** requiring **TWO separate hosting services**:

1. **Netlify** - Frontend (React app)
2. **Render** (or similar) - Backend (Node.js/Express API)

**Why both?**
- Netlify is optimized for static sites and React SPAs
- Render/Heroku/Railway are needed for Node.js backend servers
- The backend needs to run continuously to handle API requests

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Netlify account (free tier available)
- Render account (free tier available)
- Dataset files uploaded separately (too large for Git)

---

## Step 1: Prepare Git Repository

### 1.1 Update .gitignore

The `.gitignore` file already excludes:
- `node_modules/`
- `backend/dataset/` (dataset files are too large)
- `.env` files
- Build outputs

### 1.2 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: PhD Load Balancing Implementation"
```

### 1.3 Push to Remote Repository

```bash
# Create repository on GitHub/GitLab/Bitbucket first, then:
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub (recommended)

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your Git repository
3. Configure:
   - **Name**: `phd-load-balancing-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or Starter for better performance)

### 2.3 Environment Variables

Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.netlify.app
```

### 2.4 Upload Dataset Files

**Option A: Using Render Persistent Disk (Recommended)**
1. In Render dashboard, go to your service
2. Add a **Persistent Disk**:
   - Name: `dataset-disk`
   - Mount Path: `/opt/render/project/src/backend/dataset`
   - Size: 5 GB (or more if needed)
3. After deployment, SSH into your service and upload dataset files

**Option B: Using Git LFS (for smaller datasets)**
```bash
git lfs install
git lfs track "backend/dataset/**"
git add .gitattributes
git add backend/dataset/
git commit -m "Add dataset files via Git LFS"
git push
```

**Option C: Upload via SFTP/SCP after deployment**
- Get SSH credentials from Render dashboard
- Upload `backend/dataset/` folder to the server

### 2.5 Get Backend URL

After deployment, Render will provide a URL like:
```
https://phd-load-balancing-backend.onrender.com
```

**Save this URL** - you'll need it for Netlify configuration.

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
- Go to https://netlify.com
- Sign up with GitHub (recommended)

### 3.2 Connect Repository

1. Click **"Add new site"** → **"Import an existing project"**
2. Connect your Git repository
3. Configure build settings:
   - **Base directory**: Leave empty (root)
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`

### 3.3 Environment Variables

Add in Netlify dashboard → Site settings → Environment variables:

```
REACT_APP_API_URL=https://your-backend.onrender.com
```

**Important**: Replace `your-backend.onrender.com` with your actual Render backend URL.

### 3.4 Update netlify.toml

Edit `netlify.toml` and replace the placeholder URL:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend.onrender.com/api/:splat"
  status = 200
  force = true
```

### 3.5 Deploy

Netlify will automatically deploy when you push to your main branch.

---

## Step 4: Update CORS in Backend

After both are deployed, update backend CORS to allow your Netlify domain:

In `backend/server.js`, ensure CORS is configured:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.netlify.app',
  credentials: true
}));
```

Then redeploy the backend.

---

## Step 5: Verify Deployment

1. **Frontend**: Visit your Netlify URL (e.g., `https://your-app.netlify.app`)
2. **Backend Health Check**: Visit `https://your-backend.onrender.com/api/health`
3. **Test API**: Try running algorithms from the frontend

---

## Alternative Hosting Options

### Backend Alternatives to Render:

1. **Railway** (https://railway.app)
   - Similar to Render
   - Good free tier
   - Easy deployment

2. **Heroku** (https://heroku.com)
   - More established
   - Requires credit card for free tier
   - Good documentation

3. **Fly.io** (https://fly.io)
   - Good for Node.js apps
   - Free tier available

4. **DigitalOcean App Platform**
   - Paid but reliable
   - Good performance

### Frontend Alternatives to Netlify:

1. **Vercel** (https://vercel.com)
   - Excellent for React apps
   - Free tier available
   - Automatic deployments

2. **GitHub Pages**
   - Free but requires build setup
   - Good for static sites

---

## Troubleshooting

### Backend Issues:

1. **"Cannot find module" errors**
   - Ensure `package.json` has all dependencies
   - Check build command includes `npm install`

2. **Port errors**
   - Render uses port from `PORT` environment variable
   - Ensure backend uses `process.env.PORT || 5000`

3. **Dataset not found**
   - Verify dataset files are uploaded to correct path
   - Check file permissions

### Frontend Issues:

1. **API calls failing**
   - Check `REACT_APP_API_URL` environment variable
   - Verify `netlify.toml` redirects are correct
   - Check browser console for CORS errors

2. **Build failures**
   - Check Node version (should be 18+)
   - Verify all dependencies are in `package.json`
   - Check build logs in Netlify dashboard

### CORS Issues:

If you see CORS errors:
1. Update backend CORS to include Netlify URL
2. Redeploy backend
3. Clear browser cache

---

## Cost Estimate

### Free Tier (Sufficient for testing):
- **Netlify**: Free (100 GB bandwidth/month)
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)

### Paid Tier (For production):
- **Netlify**: $19/month (Pro plan)
- **Render**: $7/month (Starter plan, no sleep)

**Total**: ~$26/month for production hosting

---

## Quick Deployment Checklist

- [ ] Git repository created and code pushed
- [ ] Render backend deployed and running
- [ ] Dataset files uploaded to Render
- [ ] Backend URL obtained from Render
- [ ] Netlify frontend deployed
- [ ] Environment variables set in Netlify (`REACT_APP_API_URL`)
- [ ] `netlify.toml` updated with backend URL
- [ ] CORS configured in backend for Netlify domain
- [ ] Both services tested and working

---

## Support

For issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Netlify logs: Site → Deploys → Click deploy → Functions/Deploy log
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

