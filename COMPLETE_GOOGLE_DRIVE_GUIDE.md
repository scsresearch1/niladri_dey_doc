# Complete Google Drive Dataset Setup Guide

## Overview

This guide will help you:
1. ✅ Upload datasets to Google Drive
2. ✅ Configure backend to auto-download datasets
3. ✅ Deploy with fast builds (no datasets in Git)
4. ✅ Ensure 100% working deployment

---

## Part 1: Prepare Dataset for Upload

### Step 1.1: Locate Your Dataset Folder

Your dataset should be at:
```
F:\MyPhDTotalImplementation\backend\dataset\planetlab\
```

**Verify structure:**
```
planetlab/
├── 20110303/  (folder with many .txt files)
├── 20110306/
├── 20110309/
├── 20110322/
├── 20110325/
├── 20110403/
├── 20110409/
├── 20110411/
├── 20110412/
└── 20110420/
```

### Step 1.2: Create ZIP Archive

**Using Windows File Explorer:**

1. Navigate to: `F:\MyPhDTotalImplementation\backend\dataset\`
2. **Right-click** on `planetlab` folder
3. Select **"Send to"** → **"Compressed (zipped) folder"**
4. Wait for compression (may take a few minutes)
5. You'll get: `planetlab.zip` in the same folder

**Expected size:** 50-200 MB (depending on your dataset)

---

## Part 2: Upload to Google Drive

### Step 2.1: Upload ZIP File

1. Go to **Google Drive**: https://drive.google.com
2. Click **"New"** → **"File upload"**
3. Select `planetlab.zip` from your computer
4. Wait for upload to complete (shows progress bar)

### Step 2.2: Get Shareable Link

1. **Right-click** on `planetlab.zip` in Google Drive
2. Click **"Share"** or **"Get link"**
3. Set sharing to **"Anyone with the link"** (Viewer)
4. Click **"Copy link"**
5. **Save this link** - you'll need it!

**Link format will be:**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

---

## Part 3: Convert to Direct Download Link

### Step 3.1: Extract FILE_ID

From your Google Drive link:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

**FILE_ID** is the long string between `/d/` and `/view`

**Example:**
- Link: `https://drive.google.com/file/d/1ABC123xyz456DEF789/view?usp=sharing`
- FILE_ID: `1ABC123xyz456DEF789`

### Step 3.2: Create Direct Download Link

**Format:**
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

**Example:**
```
https://drive.google.com/uc?export=download&id=1ABC123xyz456DEF789
```

### Step 3.3: Test the Direct Download Link

1. Open the direct download link in a new browser tab
2. It should **immediately start downloading** `planetlab.zip`
3. If it shows a Google Drive page instead, the conversion didn't work

**✅ Success:** Download starts automatically  
**❌ Failed:** Shows Google Drive page (try Method 2 below)

### Alternative Method: For Large Files (>100MB)

If direct link doesn't work, use this format:
```
https://drive.google.com/uc?export=download&id=FILE_ID&confirm=t
```

Or use this tool: https://sites.google.com/site/gdocs2direct/

---

## Part 4: Configure Render Environment Variable

### Step 4.1: Go to Render Dashboard

1. Go to: https://dashboard.render.com
2. Click on your backend service: **phd-load-balancing-backend**

### Step 4.2: Add Environment Variable

1. Click **"Environment"** tab (left sidebar)
2. Scroll to **"Environment Variables"** section
3. Click **"Add Environment Variable"**
4. Enter:
   - **Key**: `DATASET_DOWNLOAD_URL`
   - **Value**: Your direct download link (from Step 3.2)
5. Click **"Save Changes"**

**Example:**
```
Key: DATASET_DOWNLOAD_URL
Value: https://drive.google.com/uc?export=download&id=1ABC123xyz456DEF789
```

### Step 4.3: Verify Environment Variable

Make sure it's saved correctly:
- ✅ Key is exactly: `DATASET_DOWNLOAD_URL`
- ✅ Value is the direct download link (starts with `https://drive.google.com/uc?export=download&id=`)
- ✅ No extra spaces or quotes

---

## Part 5: Deploy and Test

### Step 5.1: Commit and Push Code

The code is already updated with the download script. Just push:

```bash
cd F:\MyPhDTotalImplementation
git add .
git commit -m "Add Google Drive dataset auto-download feature"
git push origin main
```

### Step 5.2: Monitor Render Deployment

1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Watch for:

**Expected logs:**
```
=== Dataset Check ===
Dataset path: /opt/render/project/src/backend/dataset/planetlab
❌ Datasets not found. Starting download...
Downloading from: https://drive.google.com/uc?export=download&id=...
File size: XX.XX MB
Downloaded: 100%
Download complete!
Extracting planetlab.zip...
Extraction complete using unzip command
✅ Datasets downloaded and extracted successfully!
Cleaned up ZIP file
✅ Dataset check completed successfully
Server running on port 10000
```

### Step 5.3: First Startup Time

**First deployment:**
- Build: ~2-3 minutes (fast!)
- Dataset download: ~5-15 minutes (one-time)
- **Total:** ~7-18 minutes first time

**Subsequent deployments:**
- Build: ~2-3 minutes
- Dataset check: ~1 second (already exists)
- **Total:** ~2-3 minutes (fast!)

### Step 5.4: Verify Datasets

1. After deployment, test the API:
   ```
   https://phd-load-balancing-backend.onrender.com/api/datasets
   ```

2. Should return:
   ```json
   {
     "source": "PlanetLab",
     "totalDates": 10,
     "totalFiles": 11746,
     "datasets": [...]
   }
   ```

3. Try running algorithms - should work now!

---

## Part 6: Troubleshooting

### Problem: "DATASET_DOWNLOAD_URL not set"

**Solution:**
- Check Render Environment Variables
- Make sure key is exactly: `DATASET_DOWNLOAD_URL`
- Redeploy after adding variable

### Problem: "Failed to download: HTTP 403"

**Solution:**
- Make sure file sharing is set to **"Anyone with the link"**
- Verify the direct download link format is correct
- Try adding `&confirm=t` to the URL

### Problem: "ZIP extraction failed"

**Solution:**
- Render should have `unzip` command available
- If not, we can add `yauzl` package (let me know)

### Problem: Download is very slow

**Solution:**
- Normal for large files (50-200 MB)
- First download only, then cached
- Subsequent deployments are fast

### Problem: "Datasets not found" after download

**Solution:**
- Check ZIP file structure - should have `planetlab/` folder inside
- Verify extraction path in logs
- Check Render logs for extraction errors

---

## Part 7: Verify Everything Works

### Checklist:

- [ ] Dataset ZIP uploaded to Google Drive
- [ ] Shareable link obtained
- [ ] Direct download link created and tested
- [ ] Environment variable set in Render
- [ ] Code pushed to Git
- [ ] Render deployment successful
- [ ] Datasets downloaded (check logs)
- [ ] API endpoint `/api/datasets` returns data
- [ ] Algorithms can run successfully

---

## Summary

**What happens:**

1. **You upload** dataset ZIP to Google Drive ✅
2. **You set** environment variable in Render ✅
3. **Render builds** backend (fast - no datasets) ✅
4. **Backend starts** and checks for datasets ✅
5. **If missing**, downloads from Google Drive ✅
6. **Extracts** ZIP file automatically ✅
7. **Caches** datasets for future deployments ✅
8. **Subsequent deployments** are fast! ✅

**Benefits:**
- ✅ Fast Git operations (no large files)
- ✅ Fast Netlify builds (frontend only)
- ✅ Fast Render builds (code only)
- ✅ Automatic dataset download (one-time)
- ✅ 100% reliable (HTTP download)
- ✅ No GitHub LFS limits
- ✅ Works on free tiers

---

## Next Steps

1. Follow Parts 1-5 above
2. Monitor Render logs during first deployment
3. Test API endpoints after deployment
4. Run algorithms to verify everything works

**Ready?** Start with Part 1! 🚀

