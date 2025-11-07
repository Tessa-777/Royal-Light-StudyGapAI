## Deploying StudyGapAI Backend to Render.com

### Prerequisites
- Render.com account (free tier available)
- GitHub repository connected
- Supabase project with the schema defined
- Google Gemini API key

### Quick Setup Steps

1. **Sign up at Render.com**
   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

3. **Configure Service**
   - **Name**: `studygapai-backend` (or your choice)
   - **Environment**: `Python 3`
   - **Python Version**: Set to `3.11.9` in Render dashboard (Settings → Python Version)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`

4. **Set Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:

   ```env
   FLASK_ENV=production
   SECRET_KEY=<generate-a-strong-random-secret-key>
   APP_NAME=StudyGapAI Backend
   APP_VERSION=0.1.0
   
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   USE_IN_MEMORY_DB=false
   
   GOOGLE_API_KEY=your-gemini-api-key-here
   AI_MODEL_NAME=gemini-2.5-flash
   AI_MOCK=false
   
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

   **Note**: `PORT` is automatically provided by Render - don't set it manually.

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Build typically takes 3-5 minutes
   - You'll get a URL like: `https://studygapai-backend.onrender.com`

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `FLASK_ENV` | Yes | Set to `production` |
| `SECRET_KEY` | Yes | Strong random string for Flask sessions |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (for backend ops) |
| `USE_IN_MEMORY_DB` | Yes | Set to `false` for production |
| `GOOGLE_API_KEY` | Yes | Google Gemini API key |
| `AI_MODEL_NAME` | No | Default: `gemini-2.5-flash` |
| `AI_MOCK` | No | Set to `false` for real AI |
| `CORS_ORIGINS` | Yes | Your frontend domain(s), comma-separated |
| `PORT` | Auto | Automatically set by Render |

### Generating SECRET_KEY

Run this Python command to generate a secure key:

```python
import secrets
print(secrets.token_urlsafe(32))
```

### Health Check

After deployment, test the health endpoint:

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Free Tier Notes

- **750 hours/month** - Enough for 24/7 operation
- **Spins down after 15 min inactivity** - First request after spin-down takes ~30 seconds
- **Auto SSL** - HTTPS enabled automatically
- **Auto-deploy** - Deploys on every push to main branch

### Preventing Spin-Down (Optional)

If you want to keep the service always awake, you can:

1. Use a cron job service (like cron-job.org) to ping `/health` every 10 minutes
2. Or upgrade to Render's paid tier

### Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure `requirements.txt` is correct
- Verify Python version in `runtime.txt`

**Service won't start:**
- Check start command matches Procfile
- Verify all environment variables are set
- Check logs for specific errors

**Database connection errors:**
- Verify `SUPABASE_URL` and keys are correct
- Ensure `USE_IN_MEMORY_DB=false`
- Check Supabase project is active

**CORS errors:**
- Set `CORS_ORIGINS` to your frontend domain
- Don't use `*` in production

### Updating Deployment

Render automatically deploys on every push to your main branch. To manually deploy:

1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Monitoring

- **Logs**: Available in Render dashboard under "Logs" tab
- **Metrics**: Basic metrics available in dashboard
- **Alerts**: Set up email alerts for deployment failures

---

## Migration from Railway

If migrating from Railway:

1. Copy all environment variables from Railway to Render
2. Update any hardcoded URLs to use Render URL
3. Update CORS_ORIGINS if needed
4. Test health endpoint after deployment

That's it! Your app should be live on Render. 🚀

