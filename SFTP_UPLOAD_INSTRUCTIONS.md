# Upload Datasets via SFTP to Render

## Step-by-Step Instructions

### Prerequisites
- Render Persistent Disk created
- SFTP client installed (FileZilla, WinSCP, or similar)
- Dataset files on your local machine: `F:\MyPhDTotalImplementation\backend\dataset\planetlab\`

---

## Method 1: Using FileZilla (Windows - Easiest)

### Download FileZilla
1. Go to: https://filezilla-project.org/
2. Download FileZilla Client (free)
3. Install it

### Connect to Render
1. Open FileZilla
2. Click **"File"** → **"Site Manager"** (or press `Ctrl+S`)
3. Click **"New Site"**
4. Configure:
   - **Protocol**: `SFTP - SSH File Transfer Protocol`
   - **Host**: `sftp.render.com` (or check Render dashboard for exact host)
   - **Port**: `22`
   - **Logon Type**: `Normal`
   - **User**: Your Render username (from Render dashboard)
   - **Password**: Your Render password (from Render dashboard)
5. Click **"Connect"**

### Upload Files
1. **Left side (Local)**: Navigate to:
   ```
   F:\MyPhDTotalImplementation\backend\dataset\planetlab
   ```
2. **Right side (Remote)**: Navigate to:
   ```
   /opt/render/project/src/backend/dataset/planetlab
   ```
3. **Select all folders** in the left panel (20110303, 20110306, etc.)
4. **Right-click** → **"Upload"**
5. Wait for upload to complete (may take 10-30 minutes depending on size)

---

## Method 2: Using WinSCP (Windows - Alternative)

### Download WinSCP
1. Go to: https://winscp.net/
2. Download and install

### Connect
1. Open WinSCP
2. Click **"New Session"**
3. Configure:
   - **File protocol**: `SFTP`
   - **Host name**: `sftp.render.com`
   - **Port number**: `22`
   - **User name**: Your Render username
   - **Password**: Your Render password
4. Click **"Login"**

### Upload
1. **Left panel**: Navigate to `F:\MyPhDTotalImplementation\backend\dataset\planetlab`
2. **Right panel**: Navigate to `/opt/render/project/src/backend/dataset/planetlab`
3. Select all date folders (20110303, 20110306, etc.)
4. Drag and drop or right-click → **"Upload"**

---

## Method 3: Using Command Line (PowerShell/CMD)

If you have SSH access or SFTP command line:

```powershell
# Install SFTP client (if not available)
# Or use built-in Windows OpenSSH

# Connect and upload
sftp username@sftp.render.com
# Enter password when prompted

# Navigate to dataset directory
cd /opt/render/project/src/backend/dataset

# Create planetlab directory if needed
mkdir planetlab
cd planetlab

# Upload files (from local machine, run this command)
# Note: This is a one-liner example, you may need to upload folder by folder
```

---

## Verify Upload

After uploading, test your backend:

1. Visit: `https://your-backend.onrender.com/api/datasets`
2. Should return list of dates:
   ```json
   {
     "dates": [
       {"date": "20110303", "fileCount": 1052},
       {"date": "20110306", "fileCount": 898},
       ...
     ]
   }
   ```

---

## Troubleshooting

### Connection Refused
- Verify SFTP host in Render dashboard
- Check if Persistent Disk is mounted
- Ensure service is running

### Permission Denied
- Check file permissions on Render
- Verify mount path is correct
- Try creating directory first: `mkdir -p /opt/render/project/src/backend/dataset/planetlab`

### Files Not Found After Upload
- Verify path: `/opt/render/project/src/backend/dataset/planetlab/`
- Check Render logs for path errors
- Restart service after upload

---

## Alternative: Use Git LFS (If Dataset is Manageable)

If your dataset is under 2GB total, you can use Git LFS:

```bash
# Install Git LFS
git lfs install

# Track dataset files
git lfs track "backend/dataset/**"

# Add and commit
git add .gitattributes
git add backend/dataset/
git commit -m "Add datasets via Git LFS"
git push
```

Render will automatically download LFS files during build.


