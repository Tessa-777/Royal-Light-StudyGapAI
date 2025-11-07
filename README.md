# 🧠 StudyGapAI

> **AI-powered learning diagnostics and personalized study plan generator for African students.**
>
> Built for [Hackathon Name], StudyGapAI identifies each learner’s unique strengths and weaknesses using adaptive quizzes and AI analysis — generating a tailored study roadmap to close learning gaps and boost exam readiness.

---

## 🚀 Overview

**StudyGapAI** is a smart educational platform designed to support students preparing for standardized exams such as **JAMB** and **WAEC**.  
It combines **Flask**, **Supabase**, and **Gemini AI** to provide real-time diagnostic feedback, personalized study plans, and curated learning resources.

### 🎯 Core Objectives
- Identify academic knowledge gaps through adaptive quizzes  
- Provide AI-driven diagnostic feedback per subject/topic  
- Generate individualized study plans and track progress  
- Recommend focused learning resources to close skill gaps  
- Make quality academic support more accessible across Africa  

---

## 🧩 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Backend** | Flask (Python) | Core API & business logic |
| **Database** | Supabase (PostgreSQL) | Data storage, auth & row-level security |
| **AI Integration** | Gemini API (Google) | Diagnostic & study plan generation |
| **Frontend** | React / Flutter (optional for demo) | Student interface |
| **Hosting** | Render.com (Recommended) | Deployment |
| **Version Control** | Git + GitHub | Collaboration & tracking |

---

## ⚙️ Features

✅ **Adaptive Diagnostic Quizzes** — auto-selects questions by difficulty and topic  
✅ **AI-Powered Feedback** — summarizes performance, predicts scores, highlights weak topics  
✅ **Personalized Study Plans** — week-by-week roadmap tailored to each learner  
✅ **Resource Recommendations** — curated lessons and exercises for targeted improvement  
✅ **Progress Tracking** — visualized improvement over time  
✅ **Secure User Accounts** — managed through Supabase authentication  

---

## 🧠 System Architecture

```

Frontend → Flask REST API → Supabase (PostgreSQL)
↘︎ Gemini AI → Analysis & Study Plan Generation

````

### Key API Endpoints
| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/users/register` | Register new user |
| `POST` | `/api/users/login` | Authenticate user |
| `GET` | `/api/questions` | Retrieve quiz questions |
| `POST` | `/api/quiz/start` | Begin diagnostic quiz |
| `POST` | `/api/ai/analyze-diagnostic` | AI diagnostic analysis (includes study plan) |
| `GET` | `/api/users/me` | Get current user profile |
| `GET` | `/api/progress/progress` | Get user's study progress |
| `POST` | `/api/ai/explain-answer` | Get explanation for a question |

---

## 🧰 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/<your-org-or-username>/StudyGapAI.git
cd StudyGapAI
````

### 2. Create environment file

Create a `.env` file based on `.env.example` and add your credentials:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_API_KEY=your-gemini-api-key
AI_MODEL_NAME=gemini-1.5-flash
AI_MOCK=false
USE_IN_MEMORY_DB=false
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run database migrations

Run the SQL migrations in your Supabase project:
- `supabase/migrations/0001_ai_se_enhanced_schema.sql`
- `supabase/migrations/0002_ai_se_rls_policies.sql`

See `dev_documentation/AI_SE_SETUP_GUIDE.md` for detailed setup instructions.

### 5. Start the development server

```bash
flask run
```

Your backend API will run at:
➡️ `http://localhost:5000/api`

---

## 📊 Database Schema Overview

| Table                | Description                       |
| -------------------- | --------------------------------- |
| `users`              | Student accounts and profile info |
| `topics`             | Academic subjects/topics          |
| `questions`          | Quiz question bank                |
| `diagnostic_quizzes` | Quiz sessions per user            |
| `quiz_responses`     | Recorded answers and scores       |
| `ai_diagnostics`     | AI analysis outputs               |
| `study_plans`        | Personalized weekly study plans   |
| `progress_tracking`  | Ongoing performance data          |
| `resources`          | Recommended learning materials    |

---

## 🧠 AI Logic Overview

1. **Analyze Diagnostic:**
   Gemini processes quiz responses and returns:

   * Topic strengths & weaknesses
   * Projected score
   * Recommended improvement areas

2. **Generate Study Plan:**
   Based on diagnostics, the AI builds:

   * Week-by-week study schedule
   * Recommended resources
   * Goal tracking roadmap

---

## 🧑‍💻 Example API Flow

```bash
# Start quiz
POST /api/quiz/start
→ returns quizId and question list

# Submit answers
POST /api/quiz/{quizId}/submit
→ saves responses and calculates raw score

# Get AI analysis
POST /api/ai/analyze-diagnostic
→ returns topic-level feedback and recommendations

# Get study plan
POST /api/ai/generate-study-plan
→ returns custom plan JSON
```

---

## 🎨 UI Concept (optional demo)

* Dashboard showing current progress and AI insights
* Study planner with upcoming goals
* Resource list dynamically filtered by weak topics

---

## 🧩 Team Roles (edit as needed)

| Role                          | Member | Responsibility              |
| ----------------------------- | ------ | --------------------------- |
| **Team Lead / Data Engineer** | [Name] | Architecture, integrations  |
| **Backend Developer**         | [Name] | Flask API, Supabase, Gemini |
| **Frontend Developer**        | [Name] | React / Flutter UI          |
| **AI Engineer**               | [Name] | Prompt design, Gemini logic |
| **Project Manager**           | [Name] | Coordination & submission   |

---

## 🏆 Hackathon Vision

> We believe education is the foundation for opportunity.
> **StudyGapAI** bridges the gap between students and personalized learning — giving every learner access to intelligent academic support, regardless of background or resources.

---

## 📜 License

This project is licensed under the **MIT License** — see `LICENSE` for details.

---

## 💬 Contact

For questions or collaboration:

* 📧 [[your-email@example.com](mailto:your-email@example.com)]
* 🌐 [project-website-or-linktree]
* 🐙 [GitHub](https://github.com/<your-org-or-username>/StudyGapAI)

---

> Made with ❤️ by Team Royal Light for WUD Hackathon 2025.
