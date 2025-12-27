# Netlify Build Canceled - Troubleshooting Guide

## Common Reasons for Netlify Build Cancellation

1. **Build timeout** - Free tier has 15-minute build limit
2. **Build errors** - ESLint errors, syntax errors, missing dependencies
3. **npm install failures** - Dependency conflicts or network issues
4. **Missing environment variables** - Required env vars not set
5. **Manual cancellation** - Someone canceled it manually

---

## Step 1: Check Netlify Build Logs

1. Go to: https://app.netlify.com
2. Click your site
3. Go to **"Deploys"** tab
4. Click on the canceled deployment
5. Click **"Deploy log"** or **"Build log"**

**Look for:**
- ❌ ESLint errors
- ❌ npm install errors
- ❌ Build timeout messages
- ❌ Missing dependencies

---

## Step 2: Common Fixes

### Fix 1: Check Build Command

Your `netlify.toml` has:
```toml
base = "frontend"
command = "npm install && npm run build"
publish = "build"
```

This should work, but verify in Netlify Dashboard:
1. **Site settings** → **Build & deploy** → **Build settings**
2. **Base directory**: `frontend` ✅
3. **Build command**: `npm install && npm run build` ✅
4. **Publish directory**: `build` ✅

### Fix 2: Set Environment Variable

Make sure `REACT_APP_API_URL` is set:
1. **Site settings** → **Environment variables**
2. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://phd-load-balancing-backend.onrender.com`
3. **Save** and **Redeploy**

### Fix 3: Fix ESLint Errors

If build fails due to ESLint errors:
1. Check build logs for specific errors
2. Fix the errors in code
3. Or temporarily disable strict ESLint:
   ```json
   // In frontend/package.json, add:
   "eslintConfig": {
     "extends": ["react-app"],
     "rules": {
       "no-unused-vars": "warn"
     }
   }
   ```

### Fix 4: Increase Build Timeout

If build times out:
1. **Site settings** → **Build & deploy** → **Build settings**
2. Increase **Build timeout** (if available on your plan)
3. Or optimize build (remove unused dependencies)

### Fix 5: Clear Build Cache

Sometimes cached files cause issues:
1. **Site settings** → **Build & deploy** → **Build settings**
2. Click **"Clear cache and deploy site"**
3. Redeploy

---

## Step 3: Test Build Locally

Test if build works locally:

```bash
cd F:\MyPhDTotalImplementation\frontend
npm install
npm run build
```

**If local build fails:**
- Fix the errors shown
- Then push and redeploy

**If local build succeeds:**
- Issue is likely Netlify-specific
- Check Netlify logs for specific errors

---

## Step 4: Quick Fixes

### Option A: Simplify Build Command

Try this in Netlify Dashboard:
```
Build command: cd frontend && npm install && npm run build
```

### Option B: Disable ESLint During Build

Temporarily disable ESLint:
```bash
# In netlify.toml, change command to:
command = "cd frontend && DISABLE_ESLINT_PLUGIN=true npm install && npm run build"
```

### Option C: Use Netlify CLI

Test build locally with Netlify CLI:
```bash
npm install -g netlify-cli
cd frontend
netlify build
```

---

## Step 5: Verify Configuration

### Check netlify.toml is correct:

```toml
[build]
  base = "frontend"
  command = "npm install && npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

### Check frontend/package.json:

- ✅ All dependencies listed
- ✅ Build script exists: `"build": "react-scripts build"`
- ✅ React scripts version compatible

---

## Step 6: Manual Redeploy

If build was canceled:

1. **Netlify Dashboard** → Your Site
2. **Deploys** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Watch the build logs

---

## Common Error Messages

### "Build script returned non-zero exit code"
**Solution:** Check build logs for specific error, fix it

### "Failed to prepare repo"
**Solution:** Usually Git LFS issue, but `base = "frontend"` should prevent this

### "Build timeout"
**Solution:** Optimize build or upgrade plan

### "Module not found"
**Solution:** Check `package.json` dependencies

---

## Next Steps

1. ✅ Check Netlify build logs for specific error
2. ✅ Test build locally (`cd frontend && npm run build`)
3. ✅ Verify environment variables are set
4. ✅ Try manual redeploy
5. ✅ If still failing, share error logs

The configuration looks correct, so the issue is likely a specific build error. Check the logs!

