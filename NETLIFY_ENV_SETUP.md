# Netlify Environment Variable Setup

## Required Environment Variable

To connect the frontend to the Render backend, you need to set the following environment variable in Netlify:

### Variable Name:
```
REACT_APP_API_URL
```

### Variable Value:
```
https://phd-load-balancing-backend.onrender.com
```

## How to Set It in Netlify:

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Set:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://phd-load-balancing-backend.onrender.com`
6. Click **Save**
7. **Redeploy** your site (or trigger a new deployment)

## What This Does:

- The frontend will now directly call the Render backend API
- No need to rely on Netlify redirects (which can be slow or fail)
- Faster API calls and better error handling
- Works in both development and production

## Notes:

- The backend URL must match your actual Render service URL
- After setting the variable, you must redeploy for changes to take effect
- In development (localhost), the frontend will use relative URLs (proxy)

