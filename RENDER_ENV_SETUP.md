# Render Environment Variable Setup

## Your Google Drive Link
```
https://drive.google.com/file/d/1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y/view?usp=sharing
```

## FILE_ID Extracted
```
1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

## Direct Download Link (Use This!)
```
https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

---

## Steps to Set in Render

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Click on your backend service: **phd-load-balancing-backend**

### 2. Add Environment Variable
- Click **"Environment"** tab (left sidebar)
- Scroll to **"Environment Variables"** section
- Click **"Add Environment Variable"**

### 3. Enter These Values
- **Key**: `DATASET_DOWNLOAD_URL`
- **Value**: `https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y`

### 4. Save Changes
- Click **"Save Changes"**
- Render will automatically redeploy

---

## Test the Download Link

Before setting in Render, test the link:
1. Open: https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
2. It should start downloading `planetlab.zip` immediately
3. If it shows a Google Drive page, make sure file sharing is set to "Anyone with the link"

---

## Verify After Deployment

After Render redeploys, check the logs. You should see:
```
=== Dataset Check ===
Dataset path: /opt/render/project/src/backend/dataset/planetlab
❌ Datasets not found. Starting download...
Downloading from: https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
File size: XX.XX MB
Downloaded: 100%
✅ Datasets downloaded and extracted successfully!
```

---

## Important Notes

1. **File Sharing**: Make sure your Google Drive file is set to **"Anyone with the link"** (Viewer)
2. **First Download**: Will take 5-15 minutes depending on file size
3. **Subsequent Deployments**: Will be fast (datasets cached)
4. **If Download Fails**: Check Render logs for error messages

---

## Quick Copy-Paste

**Environment Variable:**
```
DATASET_DOWNLOAD_URL=https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

