# Dropbox Dataset Setup - Complete Guide

## Why Dropbox?
- ✅ **No virus scan warnings** - Direct downloads work reliably
- ✅ **Simple URLs** - Just add `?dl=1` to get direct download
- ✅ **Fast downloads** - No redirect loops
- ✅ **Easy setup** - Upload, share, done!

---

## Step 1: Upload ZIP to Dropbox

### 1.1 Create ZIP File (if not already done)
1. Navigate to: `F:\MyPhDTotalImplementation\backend\dataset\`
2. Right-click `planetlab` folder
3. Select **"Send to"** → **"Compressed (zipped) folder"**
4. Wait for `planetlab.zip` to be created

### 1.2 Upload to Dropbox
1. Go to: https://www.dropbox.com
2. Sign in (or create account - free)
3. Click **"Upload"** → **"Files"**
4. Select `planetlab.zip` from your computer
5. Wait for upload to complete

---

## Step 2: Get Shareable Link

### 2.1 Share the File
1. **Right-click** on `planetlab.zip` in Dropbox
2. Click **"Share"** or **"Copy link"**
3. Copy the link

**Link format will be:**
```
https://www.dropbox.com/s/FILE_ID/planetlab.zip?dl=0
```

### 2.2 Convert to Direct Download Link

**Change `?dl=0` to `?dl=1`:**

**Before (view link):**
```
https://www.dropbox.com/s/FILE_ID/planetlab.zip?dl=0
```

**After (direct download):**
```
https://www.dropbox.com/s/FILE_ID/planetlab.zip?dl=1
```

**That's it!** Just change `dl=0` to `dl=1`

---

## Step 3: Test the Download Link

1. Open the direct download link (`?dl=1`) in your browser
2. It should **immediately start downloading** `planetlab.zip`
3. If it downloads → Perfect! ✅
4. If it shows a Dropbox page → Make sure you changed `dl=0` to `dl=1`

---

## Step 4: Set Environment Variable in Render

1. Go to: https://dashboard.render.com
2. Click your backend service: **phd-load-balancing-backend**
3. Go to **"Environment"** tab
4. **Edit** `DATASET_DOWNLOAD_URL` (or add if not exists)
5. Set value to your Dropbox direct download link:
   ```
   https://www.dropbox.com/s/FILE_ID/planetlab.zip?dl=1
   ```
6. Click **"Save Changes"**
7. Render will automatically redeploy

---

## Step 5: Verify Download

After Render redeploys, check logs. You should see:
```
=== Dataset Check ===
❌ Datasets not found. Starting download...
Downloading from: https://www.dropbox.com/s/.../planetlab.zip?dl=1
File size: 5.3 MB
Downloaded: 100%
Extracting using adm-zip...
✅ Datasets downloaded and extracted successfully!
```

---

## Quick Checklist

- [ ] ZIP file created (`planetlab.zip`)
- [ ] Uploaded to Dropbox
- [ ] Got shareable link
- [ ] Converted to direct download (`?dl=1`)
- [ ] Tested download in browser (works!)
- [ ] Set `DATASET_DOWNLOAD_URL` in Render
- [ ] Render redeployed successfully
- [ ] Datasets downloaded and extracted

---

## Advantages Over Google Drive

| Feature | Google Drive | Dropbox |
|---------|-------------|---------|
| Direct Download | ❌ Virus scan warning | ✅ Works directly |
| Redirects | ❌ Multiple redirects | ✅ No redirects |
| Setup Complexity | ⚠️ Complex | ✅ Simple |
| Reliability | ⚠️ Unreliable | ✅ Reliable |

---

## Troubleshooting

### Problem: Link shows Dropbox page instead of downloading
**Solution:** Make sure URL ends with `?dl=1` not `?dl=0`

### Problem: "Access Denied"
**Solution:** Make sure file sharing is enabled (anyone with link can view)

### Problem: Download is slow
**Solution:** Normal for large files. First download only, then cached.

---

## Next Steps

1. Upload ZIP to Dropbox
2. Get direct download link (`?dl=1`)
3. Update Render environment variable
4. Done! 🎉

**Much simpler than Google Drive!**

