# ⚡ URGENT: Set Dataset Download URL in Render

## The Problem
Your backend is running, but datasets haven't been downloaded yet. That's why you're seeing:
```
Dataset directory not found
Note: Make sure dataset files are accessible in backend/dataset/planetlab/
```

## ✅ The Solution (2 Minutes)

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click on your backend service: **phd-load-balancing-backend**

### Step 2: Add Environment Variable
1. Click **"Environment"** tab (left sidebar)
2. Scroll to **"Environment Variables"** section
3. Click **"Add Environment Variable"** button

### Step 3: Enter These Values
**Key:**
```
DATASET_DOWNLOAD_URL
```

**Value:**
```
https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

### Step 4: Save
1. Click **"Save Changes"** button
2. Render will automatically redeploy

---

## What Happens Next

After you save:
1. ✅ Render will redeploy automatically
2. ✅ Backend will start
3. ✅ Backend will check for datasets
4. ✅ Datasets will download from Google Drive (5-15 minutes)
5. ✅ ZIP will extract automatically
6. ✅ Server will be ready!

---

## Monitor Progress

After saving, check Render logs:

1. Go to **"Logs"** tab
2. You should see:
   ```
   === Dataset Check ===
   Dataset path: /opt/render/project/src/backend/dataset/planetlab
   ❌ Datasets not found. Starting download...
   Downloading from: https://drive.google.com/uc?export=download&id=...
   File size: XX.XX MB
   Downloaded: 100%
   Extracting planetlab.zip...
   ✅ Datasets downloaded and extracted successfully!
   ```

---

## Quick Copy-Paste

**Environment Variable:**
```
DATASET_DOWNLOAD_URL=https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

---

## ⚠️ Important Notes

1. **First download takes 5-15 minutes** (depending on file size)
2. **Subsequent deployments are fast** (datasets cached)
3. **Don't cancel the deployment** - let it complete
4. **Check logs** to see download progress

---

## After Download Completes

Test your API:
```
https://phd-load-balancing-backend.onrender.com/api/datasets
```

Should return dataset information!

Then try running algorithms - they should work now! 🎉

