# Upload Dataset Files to Render - Alternative Methods

Since Shell access isn't available, here are alternative methods:

---

## Method 1: Using Render Persistent Disk + SFTP (Recommended)

### Step 1: Create Persistent Disk
1. In Render Dashboard → Your Service
2. Go to **"Disks"** tab (or **"Settings"** → **"Disks"**)
3. Click **"Add Disk"**
4. Configure:
   - **Name**: `dataset-disk`
   - **Mount Path**: `/opt/render/project/src/backend/dataset`
   - **Size**: `5 GB` (or more if needed)
5. Click **"Add Disk"**
6. **Restart your service** after adding the disk

### Step 2: Get SFTP Credentials
1. In Render Dashboard → Your Service
2. Go to **"Settings"** tab
3. Scroll to **"SSH/SFTP"** section
4. Copy the **SFTP connection details**:
   - Host: `sftp.render.com` (or similar)
   - Port: `22`
   - Username: Your Render username
   - Password: Generate or use your Render password

### Step 3: Upload Files Using SFTP Client

**Option A: Using FileZilla (Free, GUI)**
1. Download FileZilla: https://filezilla-project.org/
2. Open FileZilla
3. Enter SFTP details:
   - Host: `sftp.render.com`
   - Username: Your Render username
   - Password: Your Render password
   - Port: `22`
4. Connect
5. Navigate to: `/opt/render/project/src/backend/dataset/`
6. Upload your `planetlab` folder from local `backend/dataset/planetlab/`

**Option B: Using WinSCP (Windows)**
1. Download WinSCP: https://winscp.net/
2. Create new connection:
   - File protocol: `SFTP`
   - Host name: `sftp.render.com`
   - Port: `22`
   - User name: Your Render username
   - Password: Your Render password
3. Connect
4. Navigate to: `/opt/render/project/src/backend/dataset/`
5. Upload `planetlab` folder

**Option C: Using Command Line (if you have SSH access)**
```bash
# From your local machine
scp -r backend/dataset/planetlab/* username@sftp.render.com:/opt/render/project/src/backend/dataset/planetlab/
```

---

## Method 2: Using Render API (Advanced)

If you have API access, you can upload files programmatically.

---

## Method 3: Modify Code to Fetch Datasets from External Source

### Option A: Store datasets on cloud storage (AWS S3, Google Cloud Storage)
1. Upload datasets to cloud storage
2. Modify `dataProcessor.js` to download datasets on first run
3. Cache locally after download

### Option B: Use Git LFS (if dataset is manageable)
```bash
git lfs install
git lfs track "backend/dataset/**"
git add .gitattributes
git add backend/dataset/
git commit -m "Add datasets via Git LFS"
git push
```

---

## Method 4: Use Render's File Upload Feature (if available)

Some Render plans include a file manager:
1. Check Render Dashboard → Your Service → **"Files"** or **"Storage"** tab
2. If available, use the web interface to upload files

---

## Method 5: Deploy with Datasets in Git (Not Recommended - Large Files)

**Warning**: This will make your repository very large!

1. Remove dataset from `.gitignore`
2. Commit and push:
   ```bash
   git add backend/dataset/
   git commit -m "Add dataset files"
   git push
   ```
3. Render will automatically include them in deployment

---

## Method 6: Use External Dataset Hosting

1. Upload datasets to a public URL (GitHub Releases, Dropbox, Google Drive)
2. Modify backend to download datasets on startup:
   ```javascript
   // In server.js or dataProcessor.js
   const downloadDatasets = async () => {
     // Download from external source
     // Extract to backend/dataset/
   };
   ```

---

## Recommended Approach

**For Free Tier**: Use **Method 1 (Persistent Disk + SFTP)** or **Method 3 (External Storage)**

**For Production**: Use **Method 3 (Cloud Storage)** - most reliable and scalable

---

## Verify Dataset Upload

After uploading, test:
1. Visit: `https://your-backend.onrender.com/api/datasets`
2. Should return list of available dates
3. If empty, check file paths and permissions

---

## Troubleshooting

### Files Not Found
- Verify mount path: `/opt/render/project/src/backend/dataset`
- Check file permissions (should be readable)
- Restart service after upload

### Disk Not Mounting
- Ensure disk is created before service starts
- Check disk size is sufficient
- Verify mount path is correct

### SFTP Connection Failed
- Verify credentials in Render Settings
- Check firewall/network restrictions
- Try different SFTP client


