# Google Drive Dataset Setup - Complete Guide

## Step 1: Prepare Your Dataset Folder

1. **Locate your dataset folder** on your local machine:
   ```
   F:\MyPhDTotalImplementation\backend\dataset\planetlab\
   ```

2. **Verify the structure**:
   ```
   backend/dataset/planetlab/
   ├── 20110303/
   │   ├── file1.txt
   │   ├── file2.txt
   │   └── ... (many files)
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

---

## Step 2: Create a ZIP Archive

### Option A: Using Windows File Explorer (Easiest)

1. Navigate to: `F:\MyPhDTotalImplementation\backend\dataset\`
2. **Right-click** on the `planetlab` folder
3. Select **"Send to"** → **"Compressed (zipped) folder"**
4. Wait for compression to complete
5. You'll get: `planetlab.zip`

### Option B: Using PowerShell (Alternative)

```powershell
cd F:\MyPhDTotalImplementation\backend\dataset
Compress-Archive -Path planetlab -DestinationPath planetlab.zip -Force
```

**Expected file size**: ~50-200 MB (depending on your dataset)

---

## Step 3: Upload to Google Drive

### Method 1: Direct Upload (Recommended)

1. **Go to Google Drive**: https://drive.google.com
2. Click **"New"** → **"File upload"**
3. Select your `planetlab.zip` file
4. Wait for upload to complete
5. **Right-click** on the uploaded file → **"Get link"**
6. Set sharing to **"Anyone with the link"**
7. **Copy the link** - it will look like:
   ```
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   ```

### Method 2: Create a Shared Folder

1. Create a new folder in Google Drive: `PhD-Datasets`
2. Upload `planetlab.zip` to this folder
3. Right-click folder → **"Share"** → **"Get link"**
4. Set to **"Anyone with the link"**
5. Copy the folder link

---

## Step 4: Get the Direct Download Link

Google Drive links need to be converted to direct download links.

### Easy Method: Use gdown or Direct Link Converter

**Your Google Drive link format:**
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

**Convert to direct download:**
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

**Example:**
- Original: `https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing`
- Direct: `https://drive.google.com/uc?export=download&id=1ABC123xyz`

### Extract FILE_ID:
- From: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- FILE_ID is the long string between `/d/` and `/view`

---

## Step 5: Set Environment Variable in Render

1. Go to **Render Dashboard** → Your Backend Service
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `DATASET_DOWNLOAD_URL`
   - **Value**: Your direct download link (from Step 4)
5. Click **"Save Changes"**

**Example:**
```
DATASET_DOWNLOAD_URL=https://drive.google.com/uc?export=download&id=1ABC123xyz
```

---

## Step 6: Test the Download Link

Before deploying, test that your link works:

1. Open the direct download link in a browser
2. It should start downloading `planetlab.zip` immediately
3. If it shows a Google Drive page, the link conversion didn't work - try again

---

## Step 7: Deploy and Verify

1. **Push your code** (with the download script)
2. **Render will deploy** automatically
3. **Check Render logs** - you should see:
   ```
   Checking for datasets...
   Datasets not found. Downloading from Google Drive...
   Downloading dataset archive...
   Extracting dataset archive...
   Datasets ready!
   ```
4. **First startup** will take 5-15 minutes (downloading + extracting)
5. **Subsequent deployments** will be fast (datasets cached)

---

## Troubleshooting

### Problem: Link doesn't download directly
**Solution**: Make sure you're using the direct download format:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

### Problem: "Access Denied" error
**Solution**: 
- Make sure file/folder is set to **"Anyone with the link"**
- Check that sharing permissions are correct

### Problem: Download is slow
**Solution**: 
- This is normal for large files (50-200 MB)
- First download only, then cached

### Problem: File not found after download
**Solution**: 
- Check Render logs for errors
- Verify the FILE_ID is correct
- Make sure the zip file structure matches expected format

---

## Alternative: Using Google Drive API (Advanced)

If direct links don't work, we can use Google Drive API with an API key. Let me know if you need this option.

---

## Next Steps

After completing these steps:
1. ✅ Datasets uploaded to Google Drive
2. ✅ Direct download link obtained
3. ✅ Environment variable set in Render
4. ✅ Backend will auto-download on first startup
5. ✅ Future deployments will be fast

**Ready to proceed?** Follow the steps above, then we'll test the deployment!

