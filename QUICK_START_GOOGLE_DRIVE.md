# Quick Start: Google Drive Dataset Setup

## 🚀 Fast Setup (5 Steps)

### 1. Create ZIP File
- Navigate to: `F:\MyPhDTotalImplementation\backend\dataset\`
- Right-click `planetlab` folder → **"Send to"** → **"Compressed (zipped) folder"**
- Wait for `planetlab.zip` to be created

### 2. Upload to Google Drive
- Go to: https://drive.google.com
- Upload `planetlab.zip`
- Right-click file → **"Get link"** → Set to **"Anyone with the link"**
- Copy the link

### 3. Convert Link
Your link: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`

Extract FILE_ID (between `/d/` and `/view`), then create:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

**Test:** Open this link - should download immediately!

### 4. Set Environment Variable in Render
- Render Dashboard → Your Service → **"Environment"** tab
- Add:
  - **Key**: `DATASET_DOWNLOAD_URL`
  - **Value**: Your direct download link (from step 3)
- **Save**

### 5. Deploy
```bash
git add .
git commit -m "Add Google Drive dataset download"
git push origin main
```

**Done!** Render will auto-download datasets on first startup.

---

## 📋 What Happens Next

1. **Render builds** backend (2-3 min) ✅
2. **Backend starts** and checks for datasets
3. **Downloads** from Google Drive (5-15 min, one-time)
4. **Extracts** ZIP automatically
5. **Caches** datasets for future deployments
6. **Subsequent deployments** are fast (2-3 min) ✅

---

## ✅ Verify It Works

After deployment, test:
```
https://phd-load-balancing-backend.onrender.com/api/datasets
```

Should return dataset information!

---

## 🆘 Need Help?

See `COMPLETE_GOOGLE_DRIVE_GUIDE.md` for detailed instructions.

