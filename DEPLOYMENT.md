## Deploying StudyGapAI Backend to Railway

### Prerequisites
- Railway account
- Supabase project with the schema defined in the project brief
- Google Gemini API key

### Environment Variables
Set these variables in Railway service settings:

- `FLASK_ENV=production`
- `SECRET_KEY=<secure-random-string>`
- `SUPABASE_URL=<your-supabase-url>`
- `SUPABASE_ANON_KEY=<your-supabase-key>`
- `USE_IN_MEMORY_DB=false`
- `GOOGLE_API_KEY=<gemini-api-key>`
- `AI_MODEL_NAME=gemini-2.0-flash-exp`
- `AI_MOCK=false`
- `PORT` is provided by Railway

### Build & Start
Railway will install from `requirements.txt` and run:

```
web: gunicorn backend.app:app --workers=2 --timeout=120 --bind 0.0.0.0:$PORT
```

### Health Check
Use `GET /health` for Railway health checks.


