# Frontend Repository Setup Guide

## 🎯 Recommendation: **Separate Repository**

Since your frontend and backend are deployed separately (backend on Render, frontend on Vercel), I recommend using a **separate repository** for the frontend.

---

## ✅ Option 1: Separate Repository (Recommended)

### Why Separate Repository?
- ✅ **Clean separation** - Frontend and backend are independent
- ✅ **Different deployment platforms** - Backend (Render) vs Frontend (Vercel)
- ✅ **Different tech stacks** - Python/Flask vs React/Vite
- ✅ **Independent versioning** - Different release cycles
- ✅ **Easier CI/CD** - Separate build and deployment pipelines
- ✅ **Cleaner dependencies** - No confusion between Python and Node packages
- ✅ **Team collaboration** - Frontend and backend devs can work independently

### Setup Steps:

1. **Create New Repository:**
   ```bash
   # On GitHub/GitLab, create a new repository
   # Name: studygapai-frontend (or similar)
   ```

2. **Initialize Frontend Project:**
   ```bash
   # Create new directory
   mkdir studygapai-frontend
   cd studygapai-frontend
   
   # Initialize Git
   git init
   git remote add origin <your-frontend-repo-url>
   
   # Create React + Vite project (if not already created)
   npm create vite@latest . -- --template react-ts
   npm install
   
   # Install dependencies
   npm install react-router-dom @tanstack/react-query axios
   npm install @supabase/supabase-js
   npm install -D tailwindcss postcss autoprefixer
   ```

3. **Copy Magic Patterns Code:**
   ```bash
   # Copy your Magic Patterns generated code into the project
   # Structure should match:
   src/
   ├── components/
   ├── pages/
   ├── services/
   ├── hooks/
   └── ...
   ```

4. **Initial Commit:**
   ```bash
   git add .
   git commit -m "Initial frontend setup from Magic Patterns"
   git branch -M main
   git push -u origin main
   ```

5. **Create `.gitignore`:**
   ```gitignore
   # Dependencies
   node_modules/
   .pnp
   .pnp.js
   
   # Testing
   coverage/
   
   # Production
   build/
   dist/
   
   # Environment variables
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   
   # Logs
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   pnpm-debug.log*
   lerna-debug.log*
   
   # Editor
   .vscode/
   .idea/
   *.swp
   *.swo
   *~
   
   # OS
   .DS_Store
   Thumbs.db
   ```

6. **Create `README.md`:**
   ```markdown
   # StudyGapAI Frontend
   
   React + Vite + TailwindCSS frontend for StudyGapAI.
   
   ## Setup
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
   
   ## Deployment
   - Production: Vercel
   - Staging: Vercel Preview
   ```

---

## 🔀 Option 2: Monorepo with Separate Folders

If you prefer to keep everything in one repository:

### Structure:
```
studygapai/
├── backend/          # Python/Flask backend
│   ├── app.py
│   ├── requirements.txt
│   └── ...
├── frontend/         # React/Vite frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── dev_documentation/
├── .gitignore
└── README.md
```

### Pros:
- ✅ Single repository for everything
- ✅ Easier to reference shared documentation
- ✅ Can use Git submodules or workspaces
- ✅ Unified issue tracking

### Cons:
- ⚠️ Mixed dependencies (Python + Node)
- ⚠️ More complex CI/CD setup
- ⚠️ Deployment scripts need to target specific folders
- ⚠️ Larger repository size

### Setup:
```bash
# In your existing repository
mkdir frontend
cd frontend

# Initialize React project
npm create vite@latest . -- --template react-ts
npm install

# Copy Magic Patterns code
# ...

# Update root .gitignore
echo "frontend/node_modules/" >> ../.gitignore
echo "frontend/dist/" >> ../.gitignore
echo "frontend/.env" >> ../.gitignore
```

---

## 🚀 Option 3: Monorepo with Separate Branches (Not Recommended)

### Why Not Recommended:
- ❌ Merging becomes complicated
- ❌ Hard to track changes
- ❌ Deployment complexity
- ❌ Not standard practice for separate deployments

---

## 📋 My Recommendation: **Separate Repository**

### Repository Structure:

**Backend Repository (Current):**
```
studygapai-backend/
├── backend/
├── tests/
├── dev_documentation/
├── requirements.txt
├── Procfile
└── README.md
```

**Frontend Repository (New):**
```
studygapai-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── ...
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## 🔗 Connecting Frontend to Backend

### Environment Variables (Frontend):
```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# .env.production
VITE_API_BASE_URL=https://studygapai-backend.onrender.com/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### API Service Setup:
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🚀 Deployment Setup

### Frontend (Vercel):
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Backend (Render):
- Already set up in your current repository
- No changes needed

---

## 📝 Workflow

### Development:
1. **Backend:** Work in `studygapai-backend` repository
2. **Frontend:** Work in `studygapai-frontend` repository
3. **Documentation:** Keep shared docs in backend repo (or create a docs repo)

### Deployment:
1. **Backend:** Push to `studygapai-backend` → Auto-deploys to Render
2. **Frontend:** Push to `studygapai-frontend` → Auto-deploys to Vercel

### Testing:
1. **Backend:** Run backend locally (`flask run`)
2. **Frontend:** Run frontend locally (`npm run dev`)
3. **Integration:** Frontend connects to local backend for development

---

## 🎯 Quick Start Guide

### 1. Create Frontend Repository:
```bash
# On GitHub, create new repository: studygapai-frontend
```

### 2. Clone and Setup:
```bash
git clone <your-frontend-repo-url>
cd studygapai-frontend

# Initialize React + Vite project
npm create vite@latest . -- --template react-ts
npm install

# Install dependencies
npm install react-router-dom @tanstack/react-query axios
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer

# Initialize TailwindCSS
npx tailwindcss init -p
```

### 3. Copy Magic Patterns Code:
```bash
# Copy your generated components, pages, etc.
# into the src/ directory
```

### 4. Setup Environment:
```bash
# Create .env file
cp .env.example .env

# Add your environment variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Initial Commit:
```bash
git add .
git commit -m "Initial frontend setup"
git push -u origin main
```

---

## ✅ Checklist

### Repository Setup:
- [ ] Create new repository on GitHub
- [ ] Clone repository locally
- [ ] Initialize React + Vite project
- [ ] Install dependencies
- [ ] Setup TailwindCSS
- [ ] Copy Magic Patterns code
- [ ] Create `.gitignore`
- [ ] Create `README.md`
- [ ] Initial commit and push

### Configuration:
- [ ] Create `.env.example`
- [ ] Setup environment variables
- [ ] Configure API service
- [ ] Setup Supabase Auth
- [ ] Configure React Router
- [ ] Setup React Query

### Deployment:
- [ ] Connect Vercel to repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Test deployment
- [ ] Verify API connection

---

## 🆘 Need Help?

### Common Issues:

1. **CORS Errors:**
   - Backend needs to allow frontend origin
   - Add frontend URL to CORS allowed origins

2. **Environment Variables:**
   - Make sure `VITE_` prefix is used (Vite requirement)
   - Variables are available at build time

3. **API Connection:**
   - Check `VITE_API_BASE_URL` is correct
   - Verify backend is running and accessible

---

## 📚 Related Documentation

- **Frontend Spec:** `dev_documentation/FRONTEND_TECHNICAL_SPECIFICATION.md`
- **Magic Patterns Prompt:** `dev_documentation/MAGIC_PATTERNS_PROMPT.md`
- **Guest Mode Flow:** `dev_documentation/GUEST_QUIZ_FLOW.md`
- **Backend API:** Backend routes in `backend/routes/`

---

## 🎯 Final Answer

**Use a Separate Repository** for the frontend:
- ✅ Cleaner separation
- ✅ Easier deployment
- ✅ Independent versioning
- ✅ Better for separate deployments

**Repository Name Suggestion:** `studygapai-frontend` or `studygapai-web`

**Next Steps:**
1. Create new repository on GitHub
2. Initialize React + Vite project
3. Copy Magic Patterns code
4. Setup environment variables
5. Connect to backend API
6. Deploy to Vercel

---

**TL;DR: Use a separate repository for the frontend since you're deploying separately. This is the cleanest approach.** 🚀

