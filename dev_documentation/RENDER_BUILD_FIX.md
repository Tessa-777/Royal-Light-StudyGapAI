# Render.com Build Fix

## Issue
Build failed with "Dependency resolution exceeded maximum depth" error.

## Root Causes
1. **Python 3.13.4** - Too new, some packages don't have wheels
2. **google-genai>=0.2.0** - Loose version constraint causes backtracking
3. **Complex dependency graph** - supabase packages have many sub-dependencies

## Fixes Applied

### 1. Pinned google-genai version
Changed from `google-genai>=0.2.0` to `google-genai==1.49.0`
- Prevents pip from trying 50+ versions
- Uses the latest stable version

### 2. Set Python version in Render
Render might not read `runtime.txt` automatically. Set it manually:
- Go to Render dashboard → Your Service → Settings
- Find "Python Version" setting
- Set to `3.11.9` (or use the dropdown)

### 3. Updated build command
Changed to: `pip install --upgrade pip && pip install -r requirements.txt`
- Ensures latest pip for better dependency resolution

## Next Steps

1. **Commit and push** the updated `requirements.txt`
2. **In Render dashboard**:
   - Go to Settings → Python Version
   - Set to `3.11.9` explicitly
   - Or update Build Command to: `pip install --upgrade pip && pip install -r requirements.txt`
3. **Redeploy** - The build should complete successfully

## Alternative: If Still Failing

If dependency resolution still fails, try this build command:
```
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
```

This:
- Upgrades build tools
- Skips cache (fresh install)
- Often resolves complex dependency issues

