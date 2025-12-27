# Check Dataset Download Status

## Current Status
✅ Server is running
⚠️ Datasets not downloaded yet

---

## Step 1: Verify Environment Variable is Set

1. Go to: https://dashboard.render.com
2. Click your backend service: **phd-load-balancing-backend**
3. Go to **"Environment"** tab
4. Check if `DATASET_DOWNLOAD_URL` exists

**If it's NOT there:**
- Add it now (see Step 2)

**If it IS there:**
- Check the value is correct
- Should be: `https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y`

---

## Step 2: Add/Update Environment Variable

1. In **"Environment"** tab
2. Click **"Add Environment Variable"** (or edit existing)
3. Set:
   - **Key**: `DATASET_DOWNLOAD_URL`
   - **Value**: `https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y`
4. Click **"Save Changes"**

---

## Step 3: Check Download Logs

After saving (or if already set), check logs:

1. Go to **"Logs"** tab
2. Look for these messages:

**If download is happening:**
```
=== Dataset Check ===
Dataset path: /opt/render/project/src/backend/dataset/planetlab
❌ Datasets not found. Starting download...
Downloading from: https://drive.google.com/uc?export=download&id=...
File size: XX.XX MB
Downloaded: X%
```

**If download URL not set:**
```
⚠️  DATASET_DOWNLOAD_URL not set in environment variables.
⚠️  Datasets will not be downloaded automatically.
```

**If download failed:**
```
❌ Error downloading datasets: [error message]
```

---

## Step 4: Manual Redeploy (If Needed)

If environment variable is set but download didn't start:

1. Go to **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch logs for download progress

---

## Step 5: Test Download Link

Before setting in Render, test the link works:

Open in browser:
```
https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y
```

**Should:** Start downloading `planetlab.zip` immediately
**If not:** File sharing might not be set correctly

---

## Troubleshooting

### Problem: Environment variable set but no download
**Solution:** 
- Check logs for error messages
- Verify the download URL works in browser
- Try manual redeploy

### Problem: Download URL not working
**Solution:**
- Make sure Google Drive file is set to "Anyone with the link"
- Try the link in browser first
- Check if file is too large (>100MB might need different format)

### Problem: Download starts but fails
**Solution:**
- Check Render logs for specific error
- Verify file size (might timeout if too large)
- Check network/connectivity issues

---

## Expected Timeline

- **Environment variable set:** Instant
- **Redeploy triggered:** Automatic (after saving)
- **Download starts:** Within 1-2 minutes
- **Download completes:** 5-15 minutes (depending on file size)
- **Extraction:** 1-2 minutes
- **Total:** ~7-18 minutes first time

---

## After Download Completes

Test the API:
```
https://phd-load-balancing-backend.onrender.com/api/datasets
```

Should return dataset information!

Then algorithms will work! 🎉

