# Dataset Upload Options for Render (Without Shell Access)

## Your Dataset Structure
- **Location**: `backend/dataset/planetlab/`
- **Folders**: 10 date folders (20110303, 20110306, etc.)
- **Total Files**: ~11,000+ files

---

## ✅ Option 1: Persistent Disk + SFTP (RECOMMENDED)

### Why This Works:
- Render Persistent Disk provides storage that persists across deployments
- SFTP allows file upload without shell access
- Most reliable method

### Steps:
1. **Create Persistent Disk** in Render Dashboard
2. **Get SFTP credentials** from Render Settings
3. **Use FileZilla/WinSCP** to upload files
4. **See `SFTP_UPLOAD_INSTRUCTIONS.md`** for detailed steps

---

## ✅ Option 2: Git LFS (If Dataset < 2GB)

### Why This Works:
- Git LFS handles large files
- Render automatically downloads during build
- No manual upload needed

### Steps:
```bash
# Install Git LFS
git lfs install

# Track dataset files
git lfs track "backend/dataset/**"

# Add files
git add .gitattributes
git add backend/dataset/

# Commit and push
git commit -m "Add datasets via Git LFS"
git push origin main
```

**Note**: GitHub free tier allows 1GB LFS storage. If your dataset is larger, consider paid plan or Option 1.

---

## ✅ Option 3: External Storage + Download Script

### Why This Works:
- Store datasets on cloud storage (AWS S3, Google Drive, Dropbox)
- Backend downloads on first run
- No need to upload to Render

### Implementation:
1. Upload datasets to cloud storage
2. Modify `backend/algorithms/dataProcessor.js` to download if files don't exist
3. Cache locally after download

**I can help you implement this if you prefer.**

---

## ✅ Option 4: Include in Git (NOT RECOMMENDED)

### Why Not Recommended:
- Makes repository very large (>1GB)
- Slow clone/pull operations
- May exceed GitHub limits

### If You Still Want To:
```bash
# Remove from .gitignore
# Edit .gitignore, remove: backend/dataset/

# Add and commit
git add backend/dataset/
git commit -m "Add dataset files"
git push
```

---

## 🎯 Recommended Approach

**For Free Tier**: Use **Option 1 (Persistent Disk + SFTP)**
- Most reliable
- No repository bloat
- Works with any dataset size

**For Production**: Use **Option 3 (External Storage)**
- Scalable
- Can update datasets without redeploying
- Better performance

---

## Quick Decision Guide

| Your Situation | Best Option |
|---------------|-------------|
| Dataset < 1GB | Option 2 (Git LFS) |
| Dataset > 1GB | Option 1 (Persistent Disk + SFTP) |
| Want auto-updates | Option 3 (External Storage) |
| Quick test/demo | Option 4 (Git - if small enough) |

---

## Need Help?

Tell me which option you prefer, and I'll provide detailed step-by-step instructions!


