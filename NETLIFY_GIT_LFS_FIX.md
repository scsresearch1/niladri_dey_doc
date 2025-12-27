# Fix Netlify Git LFS Checkout Error

## Problem
Netlify fails with: "Error checking out to refs/heads/main - Failed to prepare repo"

This happens because Netlify doesn't have Git LFS installed to download the dataset files.

## Solution Options

### Option 1: Install Git LFS in Netlify Build (Recommended)

Netlify needs Git LFS installed before checkout. Update your Netlify build settings:

1. Go to Netlify Dashboard → Your Site → **Site settings** → **Build & deploy**
2. Under **Build settings**, click **"Edit settings"**
3. Add this to **Build command**:
   ```bash
   git lfs install && cd frontend && npm install && npm run build
   ```

However, this might not work because checkout happens before build command.

### Option 2: Use Netlify Build Plugin (Best Solution)

Create a Netlify plugin to install Git LFS:

1. Create `netlify/plugins/git-lfs.js`:
   ```javascript
   module.exports = {
     onPreBuild: async ({ utils }) => {
       try {
         await utils.run.command('git lfs install');
         await utils.run.command('git lfs pull');
       } catch (error) {
         console.log('Git LFS not available, skipping...');
       }
     }
   };
   ```

2. Update `netlify.toml`:
   ```toml
   [[plugins]]
     package = "./netlify/plugins/git-lfs"
   ```

### Option 3: Exclude Dataset from Netlify (Simplest)

Since Netlify only needs frontend, exclude backend/dataset:

1. In Netlify Dashboard → **Site settings** → **Build & deploy** → **Build settings**
2. Add **Base directory**: `frontend`
3. This way Netlify only checks out what it needs

### Option 4: Use Sparse Checkout (Advanced)

Configure Git sparse checkout to only get frontend files.

---

## Quick Fix (Try This First)

1. Go to Netlify Dashboard
2. Site settings → **Build & deploy** → **Build settings**
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm install && npm run build`
5. Set **Publish directory**: `build`
6. Redeploy

This tells Netlify to only work with the frontend directory, avoiding the LFS issue entirely.

