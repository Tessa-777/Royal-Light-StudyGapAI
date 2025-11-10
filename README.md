# StudyGapAI Frontend

React + Vite + TailwindCSS frontend for StudyGapAI - an AI-powered diagnostic tool that identifies hidden knowledge gaps holding Nigerian JAMB students back.

## 🚀 Features

- **Guest Mode**: Take diagnostic quiz without login
- **AI-Powered Diagnostics**: Get personalized analysis of strengths and weaknesses
- **Study Plans**: 6-week personalized study plans
- **Progress Tracking**: Monitor improvement over time
- **Resource Library**: Access curated learning resources

## 🛠️ Tech Stack

- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS (mobile-first)
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query) for server state
- **API Client**: Axios
- **Auth**: Supabase Auth SDK (JWT tokens)
- **Charts**: Recharts

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/
│   ├── charts/          # Chart components (PieChart, BarChart, LineChart)
│   ├── layout/          # Layout components (Header, Footer)
│   └── ui/              # UI components (Button, Card, Input, etc.)
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useQuiz.ts       # Quiz management hook
│   ├── useDiagnostic.ts # Diagnostic data hook
│   ├── useResources.ts  # Resources hook
│   └── useProgress.ts   # Progress tracking hook
├── pages/               # Page components
│   ├── LandingPage.tsx
│   ├── QuizPage.tsx
│   ├── DiagnosticResultsPage.tsx
│   ├── StudyPlanPage.tsx
│   ├── ProgressPage.tsx
│   ├── ResourcesPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── services/            # API services
│   ├── api.ts           # Axios instance
│   ├── auth.ts          # Supabase Auth service
│   └── endpoints.ts     # API endpoint constants
└── lib/                 # Utility functions
    └── utils.ts
```

## 🎯 Key Features

### Guest Mode
- Users can take diagnostic quiz without authentication
- Quiz data stored in localStorage
- Users can create account later to save results

### Explanation Field Validation
- Explanation is **REQUIRED** when answer is **WRONG**
- Explanation is **OPTIONAL** when answer is **CORRECT**
- Dynamic validation with error messages

### Authentication
- Supabase Auth integration
- JWT token management
- Protected routes
- Save guest diagnostic after registration/login

## 🚀 Deployment

### GitHub Pages Deployment

1. **Set GitHub Secrets** (Required): See [GitHub Pages Secrets Setup](./docs/GITHUB_PAGES_SECRETS_SETUP.md)
2. Deploy: The GitHub Actions workflow will automatically deploy on push to `main`
3. Enable GitHub Pages in repository settings (if not already enabled)
4. Your app will be live at: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`

**Important:** If you see "Invalid API key" errors, you need to set GitHub Secrets. See the [Secrets Setup Guide](./docs/GITHUB_PAGES_SECRETS_SETUP.md).

See [GitHub Pages Deployment Guide](./docs/GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

## 📝 API Integration

The frontend communicates with the backend API at `VITE_API_BASE_URL`. Key endpoints:

- `POST /api/ai/analyze-diagnostic` - Submit quiz and get diagnostic
- `GET /api/quiz/questions` - Fetch quiz questions
- `POST /api/ai/save-diagnostic` - Save guest diagnostic to account
- `GET /api/users/me` - Get current user profile
- `GET /api/resources` - Fetch resources by topic
- `GET /api/topics` - Fetch all topics

## 🧪 Testing

### Quick Testing Guide

Before demo and going live, test all features using our comprehensive testing guides:

- **[Quick Testing Guide](./docs/QUICK_TESTING_GUIDE.md)** - Quick reference for critical path testing
- **[Complete Testing Checklist](./docs/TESTING_CHECKLIST.md)** - Detailed testing checklist for all features

### Critical Tests Before Demo

1. **Authentication**: Register, login, logout, error handling
2. **Guest Mode**: Start quiz, resume quiz, save to account
3. **Quiz**: Answer questions, navigation, validation, submission
4. **Diagnostic**: Results accuracy, weak/strong topics, analysis
5. **Study Plan**: Generation, personalization, content
6. **Resources**: Links, filtering, accessibility
7. **PDF Download**: Generation, content, formatting
8. **Dashboard**: Display, navigation, statistics
9. **Mobile**: Responsiveness, touch interactions
10. **Errors**: Error handling, user-friendly messages

### Development Testing

```bash
# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs/) folder:

- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Complete project overview and current state
- **[Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Quick Start Guide](./docs/QUICK_START.md)** - Developer quick start
- **[GitHub Pages Deployment Guide](./docs/GITHUB_PAGES_DEPLOYMENT.md)** - Complete GitHub Pages deployment guide
- **[Railway Backend Setup](./docs/RAILWAY_BACKEND_SETUP.md)** - Railway backend configuration
- **[GitHub Pages Quick Steps](./GITHUB_PAGES_DEPLOYMENT_STEPS.md)** - Quick deployment steps
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions

### Frontend-Specific Docs
- [Frontend Technical Specification](./front%20end%20docs/FRONTEND_TECHNICAL_SPECIFICATION.md)
- [Repository Setup Guide](./front%20end%20docs/FRONTEND_REPOSITORY_SETUP.md)
- [Guest Quiz Flow](./front%20end%20docs/GUEST_QUIZ_FLOW.md)
- [Explanation Field Update](./front%20end%20docs/EXPLANATION_FIELD_UPDATE.md)

See [docs/README.md](./docs/README.md) for a complete documentation index.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🆘 Support

For issues and questions, please open an issue on GitHub.
