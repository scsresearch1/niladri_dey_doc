# Google Drive Large File Download Fix

## Problem
The ZIP file shows as 0.00 MB and extraction fails with "Invalid ZIP format". This happens when Google Drive returns an HTML page instead of the file.

## Solution: Use Different Download URL Format

For large files (>100MB), Google Drive requires a different URL format with a confirmation parameter.

### Current URL Format:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

### Try These Alternatives:

#### Option 1: Add `confirm` Parameter
```
https://drive.google.com/uc?export=download&id=FILE_ID&confirm=t
```

#### Option 2: Use `uc?export=download&id=` with `&confirm=t&uuid=`
```
https://drive.google.com/uc?export=download&id=FILE_ID&confirm=t&uuid=something
```

#### Option 3: Use Direct Download (if file is shared publicly)
```
https://drive.google.com/uc?export=download&id=FILE_ID&confirm=yes
```

---

## Update Environment Variable in Render

1. Go to Render Dashboard → Your Service → Environment
2. Edit `DATASET_DOWNLOAD_URL`
3. Try this value:
   ```
   https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y&confirm=t
   ```
4. Save and redeploy

---

## Alternative: Use gdown or Alternative Method

If direct download doesn't work, we can:
1. Use a different file hosting service (Dropbox, OneDrive, AWS S3)
2. Split the ZIP into smaller parts
3. Use Google Drive API with authentication

---

## Test the URL First

Before setting in Render, test the URL in your browser:
1. Open: `https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y&confirm=t`
2. Should start downloading immediately
3. If it shows HTML page, the file might be too large or sharing settings need adjustment

---

## Next Steps

1. Try the `&confirm=t` parameter
2. Check Render logs for better error messages (now shows file preview)
3. If still fails, consider alternative hosting

