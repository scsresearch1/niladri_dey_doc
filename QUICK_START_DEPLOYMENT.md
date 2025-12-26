# Quick Start: Deploy to Netlify + Render

## Answer: You need BOTH Netlify AND Render

- **Netlify** = Frontend (React app) ✅
- **Render** = Backend (Node.js API) ✅

---

## 🚀 Quick Deployment Steps

### 1. Push to Git

```bash
# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit: PhD Load Balancing Implementation"

# Push to GitHub/GitLab
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Deploy Backend to Render (5 minutes)

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Name**: `phd-load-balancing-backend`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-app.netlify.app
   ```
6. **Deploy** → Copy the URL (e.g., `https://phd-load-balancing-backend.onrender.com`)

### 3. Deploy Frontend to Netlify (5 minutes)

1. Go to https://netlify.com → Sign up with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your repository
4. Configure:
   - **Base directory**: (leave empty)
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://phd-load-balancing-backend.onrender.com
   ```
   (Use your actual Render backend URL)
6. **Deploy**

### 4. Update netlify.toml

Edit `netlify.toml` and replace `your-backend-app.onrender.com` with your actual Render URL.

### 5. Upload Dataset Files

**Option A: Render Persistent Disk (Recommended)**
- In Render dashboard → Add Persistent Disk
- Mount path: `/opt/render/project/src/backend/dataset`
- Upload files via SSH/SFTP

**Option B: Git LFS** (for smaller datasets)
```bash
git lfs install
git lfs track "backend/dataset/**"
git add backend/dataset/
git commit -m "Add datasets"
git push
```

---

## ✅ Verification

1. **Frontend**: Visit your Netlify URL
2. **Backend**: Visit `https://your-backend.onrender.com/api/health`
3. **Test**: Run algorithms from the frontend

---

## 📝 Important Notes

- **Dataset files are NOT in Git** (too large) - upload separately
- **Backend URL** must be set in Netlify environment variables
- **CORS** is configured to allow your Netlify domain
- Both services have **free tiers** available

---

## 💰 Cost

- **Free Tier**: Both Netlify and Render offer free tiers (sufficient for testing)
- **Production**: ~$26/month total ($19 Netlify Pro + $7 Render Starter)

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

