# Troubleshooting: Internal Server Error

## If you're getting "Internal server error" or server won't start:

### Quick Fix: Make the downloader optional

The server should start even if the dataset downloader fails. I've updated the code to handle this gracefully.

### Steps to Fix:

1. **Check if the file exists:**
   ```bash
   # The file should be at:
   backend/utils/downloadDatasets.js
   ```

2. **If file is missing, create it:**
   - The file should have been created automatically
   - Check the `backend/utils/` directory

3. **Test locally first:**
   ```bash
   cd backend
   node server.js
   ```
   
   Should start without errors (even if datasets are missing)

4. **Check Render logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for error messages
   - The server should start even if dataset download fails

### Common Issues:

#### Issue 1: Module not found
**Error:** `Cannot find module './utils/downloadDatasets'`

**Solution:**
- Make sure `backend/utils/downloadDatasets.js` exists
- Check file path is correct

#### Issue 2: Server crashes on startup
**Error:** Server won't start

**Solution:**
- The updated code now wraps the require in try-catch
- Server will start even if downloader fails
- Check logs for specific error messages

#### Issue 3: Download fails but server starts
**This is OK!** The server is designed to start even if datasets aren't downloaded yet.

### Verify Server is Running:

1. Check Render logs - should see:
   ```
   Server running on port 10000
   Environment: production
   ```

2. Test API endpoint:
   ```
   https://phd-load-balancing-backend.onrender.com/api/phases
   ```
   
   Should return data (even if datasets aren't downloaded)

3. Check dataset status:
   ```
   https://phd-load-balancing-backend.onrender.com/api/datasets/check
   ```

### If Server Still Won't Start:

1. **Remove the downloader temporarily:**
   - Comment out the DatasetDownloader require
   - Comment out the downloader.ensureDatasetsExist() call
   - Deploy and test

2. **Check Node.js version:**
   - Render should use Node.js 18+
   - Check `package.json` for engine requirements

3. **Check for syntax errors:**
   ```bash
   node -c backend/server.js
   node -c backend/utils/downloadDatasets.js
   ```

### Emergency: Disable Dataset Downloader

If you need to disable the downloader temporarily:

In `backend/server.js`, comment out:
```javascript
// const DatasetDownloader = require('./utils/downloadDatasets');
// ... rest of downloader code ...
```

The server will start normally, but datasets won't auto-download.

---

## Next Steps:

1. **Commit and push the updated code** (with error handling)
2. **Check Render logs** after deployment
3. **Verify server starts** successfully
4. **Then set** the DATASET_DOWNLOAD_URL environment variable

The server should now start successfully even if there are issues with the downloader!

