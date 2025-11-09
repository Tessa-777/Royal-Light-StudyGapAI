# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing the Application

### Test Guest Mode Flow

1. Open the application
2. Click "Take Diagnostic Quiz" (no login required)
3. Answer questions:
   - For **wrong answers**: Explanation is **REQUIRED**
   - For **correct answers**: Explanation is **OPTIONAL**
4. Complete the quiz
5. View diagnostic results
6. See "Save Results" banner
7. Create account to save results

### Test Authentication Flow

1. Click "Register" or "Login"
2. Create account or login
3. If you have guest diagnostic, modal will appear to save it
4. Redirect to dashboard

### Test Protected Routes

1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. After login, should access dashboard

## 🔧 Backend Integration

### Required Backend Endpoints

Make sure your backend is running and these endpoints are available:

- `GET /api/quiz/questions?total=30`
- `POST /api/ai/analyze-diagnostic`
- `POST /api/ai/save-diagnostic`
- `GET /api/users/me`
- `GET /api/progress/progress`
- `GET /api/resources`
- `GET /api/topics`

### CORS Configuration

Ensure your backend allows requests from:
- `http://localhost:5173` (development)
- Your Vercel deployment URL (production)

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial frontend implementation"
git push origin main
```

### 2. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3. Add Environment Variables

In Vercel dashboard, add:
- `VITE_API_BASE_URL` - Your production API URL
- `VITE_SUPABASE_URL` - Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### 4. Deploy

Click "Deploy" and wait for the deployment to complete.

## 📝 Common Issues

### Issue: API calls failing

**Solution:** Check that:
- Backend is running
- CORS is configured correctly
- API base URL is correct in `.env`

### Issue: Supabase Auth not working

**Solution:** Check that:
- Supabase URL and key are correct
- Supabase project is set up
- Auth providers are enabled

### Issue: Guest diagnostic not saving

**Solution:** Check that:
- `/api/ai/save-diagnostic` endpoint exists
- Backend accepts guest diagnostic data
- User is authenticated when saving

## 🎯 Next Steps

1. **Test all features** - Go through the application and test all functionality
2. **Backend integration** - Ensure backend endpoints are working
3. **Deploy** - Deploy to Vercel
4. **Monitor** - Monitor for errors and user feedback

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Technical Specification](./front%20end%20docs/FRONTEND_TECHNICAL_SPECIFICATION.md)
- [Repository Setup](./front%20end%20docs/FRONTEND_REPOSITORY_SETUP.md)

## 🆘 Support

For issues or questions, please refer to the documentation or open an issue on GitHub.

