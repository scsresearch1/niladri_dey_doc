# Your Dropbox Direct Download URL

## Your Shareable Link:
```
https://www.dropbox.com/scl/fi/j9wqya2orclr5uhghbg64/planetlab.zip?rlkey=igo55visgty0fnsby9x3pv512&st=4by9jfnr&dl=0
```

## Direct Download Link (Use This!):
```
https://www.dropbox.com/scl/fi/j9wqya2orclr5uhghbg64/planetlab.zip?rlkey=igo55visgty0fnsby9x3pv512&st=4by9jfnr&dl=1
```

**Changed:** `dl=0` → `dl=1`

---

## Set in Render Environment Variable

1. Go to: https://dashboard.render.com
2. Click your backend service: **phd-load-balancing-backend**
3. Go to **"Environment"** tab
4. **Edit** `DATASET_DOWNLOAD_URL` (or add if not exists)
5. Set value to:
   ```
   https://www.dropbox.com/scl/fi/j9wqya2orclr5uhghbg64/planetlab.zip?rlkey=igo55visgty0fnsby9x3pv512&st=4by9jfnr&dl=1
   ```
6. Click **"Save Changes"**
7. Render will automatically redeploy

---

## Test the URL First

Before setting in Render, test the direct download link:
1. Open: https://www.dropbox.com/scl/fi/j9wqya2orclr5uhghbg64/planetlab.zip?rlkey=igo55visgty0fnsby9x3pv512&st=4by9jfnr&dl=1
2. Should start downloading immediately ✅
3. If it shows Dropbox page → Make sure `dl=1` is at the end

---

## After Setting in Render

Check logs - you should see:
```
=== Dataset Check ===
❌ Datasets not found. Starting download...
Downloading from: https://www.dropbox.com/scl/fi/.../planetlab.zip?dl=1
File size: X.XX MB
Downloaded: 100%
Extracting using adm-zip...
✅ Datasets downloaded and extracted successfully!
```

