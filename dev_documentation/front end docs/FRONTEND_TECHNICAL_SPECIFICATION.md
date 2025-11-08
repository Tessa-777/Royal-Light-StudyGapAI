# StudyGapAI Frontend Technical Specification

**Version:** 1.0  
**Date:** 2025-01-27  
**Prepared for:** Frontend Developer (Magic Patterns + CursorAI)  
**Stack:** React + Vite + TailwindCSS + React Router + React Query

---

## Section 1: Frontend Architecture Overview

### Tech Stack
- **Framework:** React 18+ with Vite
- **Styling:** TailwindCSS (mobile-first)
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query) for server state + Context/Zustand for client state
- **API Client:** Axios (recommended) or Fetch
- **Auth:** Supabase Auth SDK (JWT tokens)
- **Caching:** React Query cache + LocalStorage for persistence

### Project Structure
```
src/
├── components/
│   ├── quiz/
│   ├── diagnostic/
│   ├── study-plan/
│   └── common/
├── pages/
│   ├── Landing.tsx
│   ├── Auth/
│   ├── Quiz/
│   ├── Diagnostic/
│   ├── StudyPlan/
│   └── Progress/
├── services/
│   ├── api.ts (Axios instance)
│   ├── auth.ts (Supabase Auth)
│   └── endpoints.ts (API route constants)
├── hooks/
│   ├── useAuth.ts
│   ├── useQuiz.ts
│   └── useDiagnostic.ts
├── store/ (Context or Zustand)
│   └── authStore.ts
└── utils/
    ├── validation.ts
    └── cache.ts
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhenhmcnV2bnRjZGR3YmZzeXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTQ2MTcsImV4cCI6MjA3ODA3MDYxN30.LOKzT9GxLUyc1g6N9RVCYlsEpf_rHiOSAwTya5PnQyM
```

### Authentication Flow
1. User registers/logs in via Supabase Auth SDK
2. Receive JWT token from Supabase
3. Store token in localStorage/sessionStorage
4. Include token in `Authorization: Bearer <token>` header for all authenticated requests
5. Backend validates JWT via `@require_auth` decorator

---

## Section 2: Page & API Mapping Table

### 2.1 Landing Page (`/`)

**Purpose:** Welcome screen, allow guest access to diagnostic quiz

**Components:**
- Hero section
- CTA buttons (Take Diagnostic Quiz - primary, Login - secondary)
- Feature highlights
- **Guest mode support** - No login required for quiz

**API Calls:**
- None (static page)

**State Variables:**
- `isAuthenticated` (from auth context)

**User Flow:**
- If authenticated → redirect to `/dashboard`
- If not authenticated → show landing page with "Take Diagnostic Quiz" CTA
- **Primary CTA:** "Take Diagnostic Quiz" (allows guest access, no login required)
- **Secondary CTA:** "Login" (for existing users)
- User can take diagnostic quiz without creating account (guest mode)

---

### 2.2 Authentication Pages (`/login`, `/register`)

**Purpose:** User authentication via Supabase Auth (optional for quiz access)

**Important:** Authentication is **OPTIONAL** for taking the diagnostic quiz. Users can:
- Take quiz as guest (no login required)
- View diagnostic results as guest
- Create account later to save results

**Components:**
- Email/password form
- Supabase Auth UI (optional)
- Error message display
- **Save Diagnostic Modal** (appears after registration/login if guest diagnostic exists)

**API Calls:**
- `POST /api/users/register` (sync user data after Supabase registration)
- `POST /api/users/login` (optional - mainly uses Supabase Auth)
- `GET /api/users/me` (fetch user profile after login)
- `POST /api/ai/save-diagnostic` (save guest diagnostic to account after registration/login)

**Post-Registration/Login Flow:**
- After successful registration/login, check localStorage for `guest_diagnostic`
- If unsaved diagnostic exists:
  - Show modal: "We found unsaved diagnostic results. Would you like to save them?"
  - User can choose "Save Results" or "Skip"
  - If "Save Results": Call `/api/ai/save-diagnostic` to save diagnostic to account

**State Variables:**
- `email`, `password` (form state)
- `loading`, `error` (auth state)
- `user` (user object from Supabase)

**Request Format:**
```typescript
// Register
POST /api/users/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+2341234567890" // optional
}

// Get Current User (after login)
GET /api/users/me
Headers: { "Authorization": "Bearer <jwt_token>" }
```

**Response Format:**
```typescript
{
  "id": "user_uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+2341234567890",
  "target_score": 300
}
```

---

### 2.3 Quiz Interface (`/quiz`)

**Purpose:** Display questions, capture answers, track time, collect confidence scores

**Important: Guest Mode Supported**
- **No authentication required** - Users can take quiz as guest
- Quiz data stored in localStorage (temporary, client-side only)
- Users can create account later to save results

**Components:**
- **Guest mode banner** (optional, shows "Taking quiz as guest - Create account to save results")
- Question card (question text, options A-D)
- Answer selector (radio buttons or buttons)
- Confidence slider (1-5 scale) - **OPTIONAL** (backend infers if missing)
- Explanation textarea (for student reasoning)
  - **REQUIRED if answer is wrong** - Show error message if empty, block "Next" button
  - **OPTIONAL if answer is correct** - Can be left empty
  - Dynamic label: "Explain your reasoning (required)" or "Explain your reasoning (optional)"
  - Validation: Check answer correctness, update requirement dynamically
- Timer component
- Progress bar
- Navigation (Previous/Next/Submit)

**API Calls:**
- `GET /api/quiz/questions?total=30` (fetch questions - **public, no auth required**)
- `POST /api/ai/analyze-diagnostic` (submit quiz and get diagnostic - **auth optional for guest mode**)

**Guest Mode Flow:**
- No authentication token required
- Quiz data stored in localStorage (key: `guest_quiz`)
- After quiz submission, call `/api/ai/analyze-diagnostic` without auth token
- Diagnostic results stored in localStorage (key: `guest_diagnostic`)
- User can create account later to save results

**State Variables:**
```typescript
interface QuizState {
  isGuest: boolean; // NEW: Track if user is guest (no auth token)
  quizId: string | null; // null for guest mode
  questions: Question[];
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  startTime: number;
  timeSpent: number;
  isSubmitting: boolean;
}

interface QuestionResponse {
  id: number;
  topic: string;
  student_answer: "A" | "B" | "C" | "D";
  correct_answer: "A" | "B" | "C" | "D";
  is_correct: boolean;
  confidence?: number; // 1-5, optional (inferred if missing)
  explanation: string;
  time_spent_seconds: number;
}
```

**Request Format:**
```typescript
// Start Quiz
POST /api/quiz/quiz/start
Headers: { "Authorization": "Bearer <token>" }
{
  "totalQuestions": 30 // optional, defaults to 30
}

// Get Questions
GET /api/quiz/questions?total=30

// Submit Quiz (legacy - for reference only)
POST /api/quiz/quiz/<quiz_id>/submit
Headers: { "Authorization": "Bearer <token>" }
{
  "responses": [
    {
      "questionId": "q1",
      "studentAnswer": "A",
      "correctAnswer": "B",
      "isCorrect": false,
      "explanationText": "I thought...",
      "timeSpentSeconds": 45
    }
  ]
}
```

**User Flow:**
1. Load questions → store in state (no auth required)
2. **For guest mode:**
   - No quiz session creation (skip `/api/quiz/quiz/start`)
   - Store quiz data in localStorage (auto-save)
   - `quizId` remains null
3. **For authenticated mode:**
   - Start quiz → create quiz session via `/api/quiz/quiz/start`, store `quizId`
   - Store quiz data in state (can also cache in localStorage)
4. For each question:
   - Display question and options
   - Capture answer selection
   - **Check if answer is correct or wrong**
   - **If answer is wrong:** Explanation becomes REQUIRED
     - Show error message if explanation is empty
     - Block "Next" button if explanation is missing
   - **If answer is correct:** Explanation remains OPTIONAL
   - Capture confidence (1-5 slider) - optional
   - Capture explanation text (required for wrong answers, optional for correct)
   - Track time spent
   - **For guest mode:** Auto-save to localStorage after each answer
5. On submit → prepare `questions_list` array → call `/api/ai/analyze-diagnostic`
   - **Guest mode:** Call without auth token (diagnostic generated but not saved to database)
   - **Authenticated mode:** Call with auth token (diagnostic saved to database)
6. **For guest mode:** Store diagnostic in localStorage (key: `guest_diagnostic`)
7. Navigate to diagnostic results page

---

### 2.4 Diagnostic Results Page (`/diagnostic/:quizId` or `/results`)

**Purpose:** Display AI-generated diagnostic report with analysis, topic breakdown, JAMB score projection, and study plan

**Important: Guest Mode Supported**
- **No authentication required** - Results displayed for guest users
- Results stored in localStorage (temporary, client-side only)
- **"Save Results" banner appears** - User can create account to save

**Components:**
- **"Save Results" Banner (Guest Mode):** Top of page, prominent
  - Message: "Save your results and track your progress?"
  - Primary Button: "Create Account" (blue, prominent)
  - Secondary Link: "Continue Without Saving" (gray, less prominent)
  - Dismissible: X button to close (optional)
  - **Only shows for guest users** (no auth token)
- Overall performance card (accuracy, correct answers, avg confidence)
- JAMB score projection card (score, confidence interval)
- Topic breakdown table/chart (weak/developing/strong topics with color coding)
- Root cause analysis section (error distribution chart)
- Recommendations list
- Study plan preview (link to full study plan page)
- Share/Download buttons

**API Calls:**
- `POST /api/ai/analyze-diagnostic` (submit quiz data, get diagnostic - **auth optional for guest mode**)
- `GET /api/quiz/quiz/<quiz_id>/results` (fetch quiz results if already analyzed - **auth required**)
- `POST /api/ai/save-diagnostic` (save guest diagnostic to account after registration - **NEW**)

**State Variables:**
```typescript
interface DiagnosticState {
  isGuest: boolean; // NEW: Track if user is guest (no auth token)
  diagnostic: AnalyzeDiagnosticResponse | null;
  loading: boolean;
  error: string | null;
  showSavePrompt: boolean; // NEW: Show "Save Results" banner for guest users
}

interface AnalyzeDiagnosticResponse {
  id: string;
  quiz_id: string;
  overall_performance: {
    accuracy: number; // 0-100
    total_questions: number;
    correct_answers: number;
    avg_confidence: number; // 1-5
    time_per_question: number; // seconds
  };
  topic_breakdown: Array<{
    topic: string;
    accuracy: number;
    fluency_index: number; // 0-100
    status: "weak" | "developing" | "strong";
    questions_attempted: number;
    severity?: "critical" | "moderate" | "mild" | null;
    dominant_error_type?: string | null;
  }>;
  root_cause_analysis: {
    primary_weakness: "conceptual_gap" | "procedural_error" | "careless_mistake" | "knowledge_gap" | "misinterpretation";
    error_distribution: {
      conceptual_gap: number;
      procedural_error: number;
      careless_mistake: number;
      knowledge_gap: number;
      misinterpretation: number;
    };
  };
  predicted_jamb_score: {
    score: number; // 0-400
    confidence_interval: string; // e.g., "± 25 points"
  };
  study_plan: {
    weekly_schedule: Array<{
      week: number; // 1-6
      focus: string;
      study_hours: number;
      key_activities: string[];
    }>;
  };
  recommendations: Array<{
    priority: number;
    category: string;
    action: string;
    rationale: string;
  }>;
  generated_at: string; // ISO timestamp
}
```

**Request Format:**
```typescript
// Analyze Diagnostic (PRIMARY ENDPOINT - replaces old submit flow)
POST /api/ai/analyze-diagnostic
Headers: { "Authorization": "Bearer <token>" }
{
  "subject": "Mathematics", // required
  "total_questions": 30, // required
  "time_taken": 45.5, // required, in minutes
  "questions_list": [ // required, array of QuestionResponse
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "confidence": 2, // optional, 1-5 (inferred if missing)
      "explanation": "I thought x squared meant multiply by 2",
      "time_spent_seconds": 120
    },
    // ... more questions
  ],
  "quiz_id": "optional_quiz_id" // optional, if linking to existing quiz
}
```

**Response Format:**
- Returns full `AnalyzeDiagnosticResponse` object (see state variables above)

**Visual Requirements:**
- **Topic Status Colors:**
  - `weak`: Red (`bg-red-100 text-red-800`)
  - `developing`: Yellow (`bg-yellow-100 text-yellow-800`)
  - `strong`: Green (`bg-green-100 text-green-800`)
- **Severity Indicators:**
  - `critical`: Red badge with icon
  - `moderate`: Orange badge
  - `mild`: Yellow badge
- **Charts:** Use a charting library (e.g., Recharts, Chart.js) for:
  - Error distribution (pie/bar chart)
  - Topic accuracy (horizontal bar chart)
  - Fluency index (progress bars)

**User Flow:**
1. After quiz submission → call `/api/ai/analyze-diagnostic` with quiz data
   - **Guest mode:** Call without auth token (diagnostic generated but not saved to database)
   - **Authenticated mode:** Call with auth token (diagnostic saved to database)
2. Show loading spinner (AI analysis takes 10-30 seconds)
3. Display diagnostic report
4. **For guest users:**
   - Store diagnostic in localStorage (key: `guest_diagnostic`)
   - Show "Save Results" banner at top of page
   - User can click "Create Account" → redirect to registration page
   - User can click "Continue Without Saving" → dismiss banner
   - Diagnostic remains in localStorage (can be saved later)
5. **For authenticated users:**
   - Cache diagnostic in React Query + LocalStorage
   - Diagnostic is automatically saved to database
6. Redirect to study plan page or show study plan preview

---

### 2.5 Study Plan Viewer (`/study-plan/:diagnosticId`)

**Purpose:** Display and interact with 6-week personalized study plan

**Components:**
- Week selector (tabs or accordion for weeks 1-6)
- Weekly schedule card (focus, study hours, key activities)
- Progress tracker (mark activities as complete)
- Topic resources list (linked to Resource Viewer)
- Adjust plan button (opens modal)

**API Calls:**
- Diagnostic data already available from `/api/ai/analyze-diagnostic` response
- `GET /api/resources?topic_name=xxx` (fetch resources for topics in study plan)
- `POST /api/ai/adjust-plan` (update study plan based on progress)

**State Variables:**
```typescript
interface StudyPlanState {
  diagnosticId: string;
  studyPlan: StudyPlan; // from diagnostic response
  completedTopics: string[];
  currentWeek: number; // 1-6
}
```

**Request Format:**
```typescript
// Adjust Study Plan
POST /api/ai/adjust-plan
Headers: { "Authorization": "Bearer <token>" }
{
  "studyPlanId": "diagnostic_id",
  "completedTopics": ["Algebra", "Geometry"],
  "newWeakTopics": ["Calculus"]
}
```

**Visual Requirements:**
- Week cards with expandable sections
- Checkboxes for marking activities complete
- Progress percentage per week
- Calendar view (optional)

**User Flow:**
1. Load study plan from diagnostic response (or fetch from cache)
2. Display weekly schedule
3. Extract topic names from study plan focus/key activities
4. Fetch resources for weak topics via `GET /api/resources?topic_name=xxx`
5. Display resources alongside each week's schedule
6. Allow user to mark activities complete
7. Save progress to backend (optional - can be client-side only)
8. Option to adjust plan if needed

---

### 2.6 Progress Tracker Dashboard (`/progress`)

**Purpose:** Show user's overall progress, quiz history, topic mastery over time

**Components:**
- Progress summary cards (total quizzes, average score, topics mastered)
- Quiz history list (date, subject, score, link to diagnostic)
- Topic mastery chart (line/bar chart over time)
- Recent activity feed

**API Calls:**
- `GET /api/progress/progress` (get current user's progress)
- `POST /api/progress/progress/mark-complete` (mark topic as complete)

**State Variables:**
```typescript
interface ProgressState {
  progress: ProgressItem[];
  loading: boolean;
}

interface ProgressItem {
  topic_id: string;
  topic_name: string;
  status: "completed" | "in_progress" | "not_started";
  resources_viewed: number;
  practice_problems_completed: number;
  last_updated: string;
}
```

**Request Format:**
```typescript
// Get Progress
GET /api/progress/progress
Headers: { "Authorization": "Bearer <token>" }

// Mark Complete
POST /api/progress/progress/mark-complete
Headers: { "Authorization": "Bearer <token>" }
{
  "topicId": "topic_uuid",
  "status": "completed",
  "resourcesViewed": 5,
  "practiceProblemsCompleted": 10
}
```

**Visual Requirements:**
- Progress bars for topic completion
- Timeline view for quiz history
- Score trends chart

---

### 2.7 Resource Viewer (`/resources/:topicId`)

**Purpose:** Display recommended learning resources (videos, practice sets) for a topic

**Components:**
- Resource list (videos, articles, practice problems)
- Filter by resource type
- Mark as viewed button
- External link handler

**API Calls:**
- `GET /api/resources?topic_id=xxx` (fetch resources by topic UUID)
- `GET /api/resources?topic_name=Algebra` (fetch resources by topic name)
- `GET /api/topics` (fetch all available topics)
- Progress tracking via `/api/progress/progress/mark-complete`

**State Variables:**
```typescript
interface ResourceState {
  topicId: string;
  topicName?: string;
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

interface Resource {
  id: string;
  topic_id: string;
  type: "video" | "practice_set";
  title: string;
  url: string;
  source?: string;
  duration_minutes?: number;
  difficulty: "easy" | "medium" | "hard";
  upvotes: number;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  prerequisite_topic_ids?: string[];
  jamb_weight?: number;
}
```

**Request Format:**
```typescript
// Get all topics
GET /api/topics

// Get resources by topic ID
GET /api/resources?topic_id=uuid-here

// Get resources by topic name
GET /api/resources?topic_name=Algebra

// Get all resources (no filter)
GET /api/resources
```

**Response Format:**
```typescript
// Topics response
[
  {
    "id": "topic-uuid",
    "name": "Algebra",
    "description": "Linear equations, quadratic equations, polynomials",
    "prerequisite_topic_ids": [],
    "jamb_weight": 0.15
  },
  // ... more topics
]

// Resources response
[
  {
    "id": "resource-uuid",
    "topic_id": "topic-uuid",
    "type": "video",
    "title": "Algebra Basics - Introduction to Linear Equations",
    "url": "https://www.khanacademy.org/math/algebra/linear-equations",
    "source": "Khan Academy",
    "duration_minutes": 20,
    "difficulty": "easy",
    "upvotes": 0
  },
  // ... more resources
]
```

**User Flow:**
1. Navigate to Resource Viewer page with topic ID or topic name
2. Fetch resources using `GET /api/resources?topic_id=xxx` or `GET /api/resources?topic_name=xxx`
3. Display resources grouped by type (videos, practice sets)
4. Allow filtering by difficulty level
5. Open resources in new tab/window
6. Track resource views via progress API (optional)

---

### 2.8 Topics Endpoint

**Purpose:** Fetch all available topics for the subject

**API Calls:**
- `GET /api/topics` (fetch all topics)

**Request Format:**
```typescript
// Get all topics
GET /api/topics

// Optional: Filter by subject (future enhancement)
GET /api/topics?subject=Mathematics
```

**Response Format:**
```typescript
[
  {
    "id": "topic-uuid",
    "name": "Algebra",
    "description": "Linear equations, quadratic equations, polynomials",
    "prerequisite_topic_ids": [],
    "jamb_weight": 0.15
  },
  // ... more topics
]
```

**Use Cases:**
- Display topic dropdown/selector in quiz setup
- Show available topics in study plan
- Filter resources by topic
- Display topic list in progress dashboard

---

### 2.9 Additional Endpoints

**Explain Answer:**
```typescript
POST /api/ai/explain-answer
Headers: { "Authorization": "Bearer <token>" }
{
  "questionId": "q1",
  "studentAnswer": "A",
  "correctAnswer": "B",
  "studentReasoning": "I thought..."
}
```

**Update Target Score:**
```typescript
PUT /api/users/target-score
Headers: { "Authorization": "Bearer <token>" }
{
  "targetScore": 350
}
```

**Analytics Dashboard:**
```typescript
GET /api/analytics/dashboard
// Public endpoint, no auth required
```

---

## Section 3: State & Caching Flow

### 3.1 State Management Strategy

**Server State (React Query):**
- Quiz questions
- Diagnostic results
- User profile
- Progress data
- Study plans

**Client State (Context/Zustand):**
- Authentication (JWT token, user object)
- Quiz session (current question, responses, timer)
- UI state (modals, sidebars, loading states)

### 3.2 Caching Strategy

**React Query Configuration:**
```typescript
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

**Cache Keys:**
```typescript
const queryKeys = {
  questions: (total: number) => ['questions', total],
  quiz: (quizId: string) => ['quiz', quizId],
  diagnostic: (diagnosticId: string) => ['diagnostic', diagnosticId],
  user: (userId: string) => ['user', userId],
  progress: (userId: string) => ['progress', userId],
  topics: () => ['topics'],
  resources: (topicId?: string, topicName?: string) => 
    topicId ? ['resources', 'topic_id', topicId] : 
    topicName ? ['resources', 'topic_name', topicName] : 
    ['resources', 'all'],
};
```

**LocalStorage Persistence:**
- JWT token (with expiration check)
- User profile (fallback if API fails)
- Quiz responses (auto-save during quiz)
- Diagnostic results (for offline viewing)
- Topics list (cache for quick access)
- Resources by topic (cache for offline viewing)

### 3.3 Data Flow Diagram

```
User Action → Component → API Service → Backend
                ↓
         React Query Cache
                ↓
         LocalStorage (persist)
                ↓
         UI Update
```

**Example: Quiz Submission Flow**
1. User completes quiz → `submitQuiz()` called
2. Prepare `questions_list` array from state
3. Call `POST /api/ai/analyze-diagnostic`
4. Show loading spinner
5. Receive diagnostic response
6. Store in React Query cache (`queryKeys.diagnostic(id)`)
7. Persist to LocalStorage
8. Navigate to `/diagnostic/:id`
9. Display diagnostic report from cache
10. If cache miss → refetch from API

**Example: Resource Fetching Flow**
1. User views diagnostic with weak topics (e.g., "Algebra", "Geometry")
2. User clicks "View Resources" for a topic
3. Call `GET /api/resources?topic_name=Algebra`
4. Receive resource list
5. Display resources grouped by type (video, practice_set)
6. Cache resources in React Query (`queryKeys.resources(topicName)`)
7. User clicks resource → open in new tab
8. Track resource view via progress API (optional)

### 3.4 Error Handling

**API Error Responses:**
```typescript
interface APIError {
  error: string; // "missing_fields" | "validation_error" | "ai_service_error" | "forbidden" | "not_found" | "internal_error"
  message?: string;
  fields?: string[]; // for validation errors
}
```

**Error Handling Strategy:**
- 400 (Bad Request): Show validation errors in form
- 401 (Unauthorized): Clear token, redirect to login
- 403 (Forbidden): Show "Access denied" message
- 404 (Not Found): Show "Resource not found" message
- 500 (Server Error): Show generic error, retry button
- Network Error: Show offline message, retry when online

**Retry Logic:**
- Automatic retry for network errors (3 attempts with exponential backoff)
- Manual retry button for user-initiated retries
- Cache fallback if API fails (show last known good state)

---

## Section 4: Quick Setup Instructions

### 4.1 Project Initialization

```bash
# Create Vite + React project
npm create vite@latest studygapai-frontend -- --template react-ts
cd studygapai-frontend

# Install dependencies
npm install
npm install react-router-dom @tanstack/react-query axios
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# Initialize TailwindCSS
npx tailwindcss init -p
```

### 4.2 Environment Setup

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhenhmcnV2bnRjZGR3YmZzeXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTQ2MTcsImV4cCI6MjA3ODA3MDYxN30.LOKzT9GxLUyc1g6N9RVCYlsEpf_rHiOSAwTya5PnQyM
```

### 4.3 Axios Configuration

Create `src/services/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.4 React Query Setup

Create `src/App.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Routes here */}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### 4.5 Supabase Auth Setup

Create `src/services/auth.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Sign up
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (data.session) {
    localStorage.setItem('auth_token', data.session.access_token);
  }
  return { data, error };
};

// Sign in
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (data.session) {
    localStorage.setItem('auth_token', data.session.access_token);
  }
  return { data, error };
};

// Sign out
export const signOut = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('auth_token');
};
```

### 4.6 TailwindCSS Configuration

Update `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

### 4.7 Magic Patterns Integration

**Steps:**
1. Design UI mockups in Magic Patterns
2. Export components to React/TSX
3. Integrate API calls using Axios service
4. Connect to React Query for data fetching
5. Add routing with React Router
6. Test with backend API

**Key Components to Design:**
- Quiz question card
- Diagnostic report cards
- Study plan week card
- Progress chart
- Topic status badge

---

## Section 5: API Integration Checklist

### 5.1 Authentication
- [ ] Supabase Auth setup (sign up, sign in, sign out)
- [ ] JWT token storage and retrieval
- [ ] Token refresh logic
- [ ] Protected route wrapper
- [ ] Auto-redirect on 401

### 5.2 Quiz Flow
- [ ] Fetch questions from `/api/quiz/questions`
- [ ] Create quiz session via `/api/quiz/quiz/start`
- [ ] Track quiz responses (answers, confidence, time)
- [ ] Submit quiz data to `/api/ai/analyze-diagnostic`
- [ ] Handle loading states (10-30 second AI analysis)

### 5.3 Diagnostic Display
- [ ] Parse diagnostic response structure
- [ ] Display overall performance metrics
- [ ] Render topic breakdown with color coding
- [ ] Show root cause analysis chart
- [ ] Display JAMB score projection
- [ ] Render study plan preview

### 5.4 Study Plan
- [ ] Display 6-week schedule
- [ ] Mark activities as complete
- [ ] Adjust plan via `/api/ai/adjust-plan`
- [ ] Link to resources

### 5.5 Progress Tracking
- [ ] Fetch progress via `/api/progress/progress`
- [ ] Mark topics complete via `/api/progress/progress/mark-complete`
- [ ] Display progress charts
- [ ] Show quiz history

### 5.6 Resources & Topics
- [ ] Fetch all topics via `GET /api/topics`
- [ ] Fetch resources by topic ID via `GET /api/resources?topic_id=xxx`
- [ ] Fetch resources by topic name via `GET /api/resources?topic_name=xxx`
- [ ] Display resources in Resource Viewer page
- [ ] Display resources in Study Plan page
- [ ] Cache topics and resources in React Query
- [ ] Handle resource type filtering (video, practice_set)

### 5.7 Error Handling
- [ ] Handle validation errors (400)
- [ ] Handle authentication errors (401)
- [ ] Handle forbidden errors (403)
- [ ] Handle not found errors (404)
- [ ] Handle server errors (500)
- [ ] Handle network errors
- [ ] Show user-friendly error messages

### 5.8 Caching & Performance
- [ ] Configure React Query cache
- [ ] Persist diagnostic to LocalStorage
- [ ] Implement auto-save for quiz responses
- [ ] Add retry logic for failed requests
- [ ] Optimize bundle size (code splitting)

### 5.9 Mobile Optimization
- [ ] Responsive design (mobile-first)
- [ ] Touch-friendly buttons
- [ ] Optimized for 2G/3G networks (lazy loading, image optimization)
- [ ] Offline support (service worker optional)

---

## Section 6: Validation & Testing

### 6.1 Schema Validation

**Frontend Validation:**
- Validate answer options (A, B, C, D only)
- Validate confidence score (1-5 integer)
- Validate time values (non-negative)
- Validate required fields before API calls

**Backend Schema Reference:**
- `QuestionResponse`: id, topic, student_answer, correct_answer, is_correct, confidence (optional), explanation, time_spent_seconds
- `AnalyzeDiagnosticRequest`: subject, total_questions, time_taken, questions_list, quiz_id (optional)

### 6.2 API Testing Checklist

**Test Each Endpoint:**
- [ ] `GET /api/quiz/questions` - Returns question list
- [ ] `POST /api/quiz/quiz/start` - Creates quiz, returns quiz_id
- [ ] `POST /api/ai/analyze-diagnostic` - Returns full diagnostic response
- [ ] `GET /api/quiz/quiz/<id>/results` - Returns quiz results
- [ ] `GET /api/users/me` - Returns user profile
- [ ] `GET /api/progress/progress` - Returns progress data
- [ ] `POST /api/ai/adjust-plan` - Updates study plan
- [ ] `POST /api/ai/explain-answer` - Returns explanation

**Test Error Cases:**
- [ ] Missing required fields → 400 error
- [ ] Invalid JWT token → 401 error
- [ ] Accessing other user's data → 403 error
- [ ] Non-existent resource → 404 error
- [ ] Network failure → retry logic

### 6.3 Integration Testing

**End-to-End User Flows:**
1. **Registration → Quiz → Diagnostic:**
   - Register user → Start quiz → Complete quiz → View diagnostic
2. **Login → Progress → Study Plan:**
   - Login → View progress → Open study plan → Mark activities complete
3. **Quiz → Diagnostic → Study Plan:**
   - Complete quiz → View diagnostic → Navigate to study plan → Adjust plan

---

## Section 7: Visual & UX Guidelines

### 7.1 Color Palette

**Primary Colors:**
- Primary: Blue (`#3b82f6`)
- Success: Green (`#10b981`)
- Warning: Yellow (`#f59e0b`)
- Error: Red (`#ef4444`)

**Topic Status Colors:**
- Weak: Red (`bg-red-100 text-red-800 border-red-300`)
- Developing: Yellow (`bg-yellow-100 text-yellow-800 border-yellow-300`)
- Strong: Green (`bg-green-100 text-green-800 border-green-300`)

### 7.2 Typography

- Headings: `font-bold text-2xl md:text-3xl`
- Body: `text-base md:text-lg`
- Small text: `text-sm text-gray-600`

### 7.3 Spacing & Layout

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card: `bg-white rounded-lg shadow-md p-6`
- Button: `px-4 py-2 rounded-md font-medium transition-colors`

### 7.4 Loading States

- Spinner: Use Tailwind `animate-spin` or a loading library
- Skeleton screens for content loading
- Progress bar for quiz submission (AI analysis)

### 7.5 Responsive Breakpoints

- Mobile: `< 640px` (default, mobile-first)
- Tablet: `≥ 640px`
- Desktop: `≥ 1024px`

---

## Section 8: Important Notes

### 8.1 Key Differences from Legacy API

**New Flow (Current):**
1. User completes quiz in frontend
2. Frontend prepares `questions_list` array with all responses
3. Frontend calls `POST /api/ai/analyze-diagnostic` with complete quiz data
4. Backend creates quiz, saves responses, and returns diagnostic + study plan
5. Study plan is included in diagnostic response (no separate endpoint)

**Old Flow (Legacy - Do Not Use):**
1. `POST /api/quiz/quiz/start` → create quiz
2. `POST /api/quiz/quiz/<id>/submit` → submit responses
3. `POST /api/ai/generate-study-plan` → get study plan separately

### 8.2 Confidence Score Handling

- **Option 1:** Collect confidence from user (1-5 slider) - recommended for better accuracy
- **Option 2:** Omit confidence - backend will infer based on correctness and explanation length
- **Decision:** Backend infers confidence if missing (Decision 2: Option C)

### 8.3 Time Tracking

- Track time per question (`time_spent_seconds`)
- Track total quiz time (`time_taken` in minutes)
- Send both to backend for analysis

### 8.4 Study Plan Duration

- Study plans are always 6 weeks (Decision 9: Option A)
- Weekly schedule contains: week number, focus, study hours, key activities

### 8.5 Error Type Classification

- Valid error types: `conceptual_gap`, `procedural_error`, `careless_mistake`, `knowledge_gap`, `misinterpretation`
- Backend validates and corrects if invalid

---

## Section 9: Quick Reference

### 9.1 API Base URL
```
Development: http://localhost:5000/api
Production: https://studygapai-backend.onrender.com/
```

### 9.2 Authentication Header
```typescript
Headers: {
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### 9.3 Essential Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/users/register` | POST | No | Sync user after Supabase registration |
| `/api/users/me` | GET | Yes | Get current user profile |
| `/api/quiz/questions` | GET | No | Fetch quiz questions |
| `/api/quiz/quiz/start` | POST | Yes | Create quiz session |
| `/api/ai/analyze-diagnostic` | POST | Yes | **PRIMARY** - Get diagnostic + study plan |
| `/api/quiz/quiz/<id>/results` | GET | Yes | Get quiz results |
| `/api/progress/progress` | GET | Yes | Get user progress |
| `/api/ai/adjust-plan` | POST | Yes | Update study plan |
| `/api/ai/explain-answer` | POST | Yes | Get answer explanation |
| `/api/topics` | GET | No | **NEW** - Get all available topics |
| `/api/resources` | GET | No | **NEW** - Get resources (filter by topic_id or topic_name) |

### 9.4 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Internal Server Error

---

## Section 10: Support & Documentation

### 10.1 Backend Documentation
- See `dev_documentation/AI_SE_IMPLEMENTATION_SUMMARY.md`
- See `dev_documentation/AI_SE_TESTING_GUIDE.md`
- See `backend/utils/schemas.py` for request/response schemas

### 10.2 Frontend Resources
- React Query: https://tanstack.com/query/latest
- React Router: https://reactrouter.com/
- TailwindCSS: https://tailwindcss.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth

### 10.3 Testing Tools
- React Query DevTools (for cache inspection)
- Axios interceptors (for request/response logging)
- Browser DevTools (Network tab for API calls)


