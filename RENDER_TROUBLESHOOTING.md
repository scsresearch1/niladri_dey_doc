# Render Troubleshooting - Repository Not Showing

## If Your Repository Doesn't Appear in Render

### Solution 1: Search for Repository
1. Use the **search bar** at the top
2. Type: `niladri_dey_doc`
3. It should appear as: `scsresearch1 / niladri_dey_doc`

### Solution 2: Check GitHub Permissions
1. Go to Render Dashboard → **Account Settings**
2. Click **"Connected Accounts"** or **"GitHub"**
3. Ensure Render has access to your repositories
4. You may need to grant access to **all repositories** or specifically `niladri_dey_doc`

### Solution 3: Reconnect GitHub
1. In Render, go to **Account Settings**
2. Disconnect GitHub
3. Reconnect and authorize Render
4. Make sure to grant access to the repository

### Solution 4: Use Public Git Repository Tab
If the repository is public:
1. Click the **"Public Git Repository"** tab
2. Enter: `https://github.com/scsresearch1/niladri_dey_doc.git`
3. Click **"Continue"**

### Solution 5: Manual Repository URL
If all else fails:
1. Click **"Public Git Repository"** tab
2. Enter: `https://github.com/scsresearch1/niladri_dey_doc`
3. Render will clone the repository

---

## After Selecting Repository

Once you see `scsresearch1 / niladri_dey_doc`:
1. Click on it to select
2. Click **"Continue"** or **"Next"**
3. Proceed with configuration steps

