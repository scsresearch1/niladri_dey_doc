# Deploy Backend to Render - Step by Step Guide

## Prerequisites
- ✅ GitHub repository: `scsresearch1/niladri_dey_doc`
- ✅ Netlify frontend deployed (you already have this)

---

## Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with **GitHub** (recommended - easiest way to connect your repo)
4. Authorize Render to access your GitHub account

---

## Step 2: Create New Web Service

1. Once logged in, click **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. Find and click on **`niladri_dey_doc`** repository

---

## Step 3: Configure the Service

Fill in the following settings:

### Basic Settings:
- **Name**: `phd-load-balancing-backend` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Singapore (Asia Pacific)`)
- **Branch**: `main` (should be selected by default)
- **Root Directory**: Leave **empty** (we'll specify paths in commands)

### Build & Start:
- **Environment**: Select **`Node`**
- **Build Command**: 
  ```
  cd backend && npm install
  ```
- **Start Command**: 
  ```
  cd backend && npm start
  ```

### Plan:
- Select **"Free"** plan (sufficient for testing)
  - ⚠️ **Note**: Free tier services sleep after 15 minutes of inactivity
  - For production, consider **"Starter"** ($7/month) - no sleep

### Advanced Settings (Optional):
- **Auto-Deploy**: `Yes` (deploys automatically on git push)
- **Health Check Path**: `/api/health`

---

## Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://your-app.netlify.app` |

**Important**: Replace `your-app.netlify.app` with your actual Netlify frontend URL!

---

## Step 5: Create the Service

1. Click **"Create Web Service"** at the bottom
2. Render will start building your backend
3. Wait for the build to complete (usually 2-5 minutes)

---

## Step 6: Get Your Backend URL

Once deployment is successful:
1. You'll see a URL like: `https://phd-load-balancing-backend.onrender.com`
2. **Copy this URL** - you'll need it for Netlify

---

## Step 7: Upload Dataset Files

**⚠️ Important**: Dataset files are too large for Git, so you need to upload them separately.

### Option A: Using Render Persistent Disk (Recommended)

1. In your Render service dashboard, go to **"Disks"** tab
2. Click **"Add Disk"**
3. Configure:
   - **Name**: `dataset-disk`
   - **Mount Path**: `/opt/render/project/src/backend/dataset`
   - **Size**: `5 GB` (or more if needed)
4. Click **"Add Disk"**
5. After disk is created, you'll get SSH credentials
6. Upload dataset files using SFTP/SCP:
   ```bash
   # Example using SCP (from your local machine)
   scp -r backend/dataset/* user@your-service.onrender.com:/opt/render/project/src/backend/dataset/
   ```

### Option B: Using Render Shell (Alternative)

1. In Render dashboard, go to **"Shell"** tab
2. Navigate to dataset directory:
   ```bash
   cd backend/dataset
   ```
3. Create the directory structure:
   ```bash
   mkdir -p planetlab
   cd planetlab
   ```
4. Upload files using `wget`, `curl`, or SFTP from the shell

### Option C: Git LFS (For smaller datasets)

If your dataset is manageable, you can use Git LFS:
```bash
git lfs install
git lfs track "backend/dataset/**"
git add .gitattributes
git add backend/dataset/
git commit -m "Add datasets via Git LFS"
git push
```

---

## Step 8: Update Netlify with Backend URL

1. Go to your **Netlify** dashboard
2. Select your site
3. Go to **"Site settings"** → **"Environment variables"**
4. Add/Update:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend.onrender.com` (your actual Render URL)
5. **Redeploy** your site (or wait for auto-deploy)

---

## Step 9: Update CORS in Backend

The backend CORS is already configured in `backend/server.js` to use `FRONTEND_URL` environment variable. Make sure you set it correctly in Step 4.

If you need to update CORS manually:
1. In Render dashboard, go to **"Environment"** tab
2. Update `FRONTEND_URL` with your Netlify URL
3. Render will automatically redeploy

---

## Step 10: Test Your Deployment

1. **Backend Health Check**: 
   Visit: `https://your-backend.onrender.com/api/health`
   Should return: `{"status":"ok","message":"Backend API is running"}`

2. **Frontend**: 
   Visit your Netlify URL and test running algorithms

3. **Check Logs**:
   - In Render dashboard → **"Logs"** tab
   - Monitor for any errors

---

## Troubleshooting

### Build Fails
- Check **"Logs"** tab in Render dashboard
- Verify `package.json` has correct scripts
- Ensure Node version is compatible (18+)

### Service Won't Start
- Check **"Logs"** for error messages
- Verify `PORT` environment variable is set
- Check if dataset files are accessible

### CORS Errors
- Verify `FRONTEND_URL` is set correctly in Render
- Check browser console for specific CORS errors
- Ensure backend URL matches in Netlify `REACT_APP_API_URL`

### Dataset Not Found
- Verify dataset files are uploaded to correct path
- Check file permissions
- Verify path in `dataProcessor.js` matches Render filesystem

### Service Sleeping (Free Tier)
- Free tier services sleep after 15 min inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to Starter plan for production

---

## Quick Checklist

- [ ] Render account created
- [ ] Web Service created and configured
- [ ] Build command: `cd backend && npm install`
- [ ] Start command: `cd backend && npm start`
- [ ] Environment variables set (NODE_ENV, PORT, FRONTEND_URL)
- [ ] Backend deployed successfully
- [ ] Backend URL obtained
- [ ] Dataset files uploaded to Render
- [ ] Netlify `REACT_APP_API_URL` updated
- [ ] Backend health check works
- [ ] Frontend can connect to backend

---

## Cost Information

- **Free Tier**: 
  - 750 hours/month
  - Sleeps after 15 min inactivity
  - Good for testing/demos

- **Starter Plan**: $7/month
  - No sleep
  - Better for production
  - 512 MB RAM, 0.5 CPU

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Netlify logs: Site → Deploys → Click deploy → Functions/Deploy log
3. Verify environment variables are set correctly
4. Test backend endpoints directly using Postman or curl

---

## Next Steps After Deployment

1. ✅ Backend deployed to Render
2. ✅ Frontend deployed to Netlify
3. ✅ Both connected and working
4. 🎉 Your PhD application is live!

