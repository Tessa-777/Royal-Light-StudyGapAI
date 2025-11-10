Of course. Here are the two READMEs, updated with the specific backend repository information as requested.

The key changes are in the **Frontend README**, which now points directly to the correct backend repository, and the **Backend README**, which now includes the critical information about the `backend-ai-integrated-main` branch.

---

### **Final `README.md` for Frontend (Updated)**

```markdown
# 🚀 StudyGapAI - Frontend

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
</p>

This is the official frontend for **StudyGapAI**, an AI-powered diagnostic tool that identifies the hidden, foundational knowledge gaps holding Nigerian JAMB students back. Built with React, Vite, and TailwindCSS.

**➡️ Live App:** [https://Tessa-777.github.io/Royal-Light-StudyGapAI](https://Tessa-777.github.io/Royal-Light-StudyGapAI)  
**➡️ Backend Repository:** [https://github.com/Tessa-777/Royal-Light-StudyGapAI-Backend](https://github.com/Tessa-777/Royal-Light-StudyGapAI-Backend)

> **Note:** The backend for this project is deployed on **Railway**. The most up-to-date code for the backend is in the `backend-ai-integrated-main` branch of its repository.

---

## ✨ Core Features

- **Guest Mode Quiz:** Users can take a full diagnostic quiz without creating an account. All progress is saved locally and can be migrated after signing up.
- **AI-Powered Diagnostics:** The core of our app. Submits quiz answers *and* student explanations to our Gemini-powered backend to get a deep analysis of strengths and weaknesses.
- **Root Cause Analysis:** Goes beyond simple scores to identify the *foundational* reasons for mistakes (e.g., "weak in Algebra" is the root cause for failing "Calculus" questions).
- **Personalized 6-Week Study Plans:** The AI generates a tailored, week-by-week study plan based on the diagnostic results, prioritizing foundational gaps first.
- **Progress Tracking & Resource Library:** Dashboards with charts to monitor improvement and access to curated learning resources.

## 🛠️ Tech Stack

- **Framework:** React 18+ with Vite
- **Styling:** TailwindCSS (mobile-first)
- **State Management:** TanStack Query (React Query) for server state
- **API Client:** Axios
- **Authentication:** Supabase Auth SDK (JWT management)
- **Charts:** Recharts

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 2. Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Tessa-777/Royal-Light-StudyGapAI.git
    cd Royal-Light-StudyGapAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root and add your keys. For the `VITE_API_BASE_URL`, you can use the live Railway deployment URL or your local backend instance.
    ```env
    VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 🤖 AI Integration

This frontend consumes a powerful backend API that leverages **Google Gemini 2.0 Flash**. The AI is responsible for:
- **Deep Diagnostic Analysis** of quiz results and student explanations.
- **Generating Personalized 6-Week Study Plans**.
- **Providing Detailed, Step-by-Step Answer Explanations**.

For a complete breakdown of the AI tools used in development and in the product, see the main **[AI Acceleration Report](AI_ACCELERATION_REPORT.md)**.

## 📚 Project Documentation

All project documentation, including technical specifications and setup guides, is organized in the [`/docs`](./docs/) folder.

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
```

---

### **Final `README.md` for Backend (Updated)**

```markdown
# 🧠 StudyGapAI - Backend API

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img alt="Flask" src="https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img alt="Google Gemini" src="https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
</p>

> **⚠️ Important: Use the `backend-ai-integrated-main` Branch**
> The primary and most up-to-date code for this backend is located in the `backend-ai-integrated-main` branch. Please ensure you clone and work from this specific branch.

This is the official backend for **StudyGapAI**, an AI-powered learning diagnostics platform. It combines **Flask**, **Supabase**, and the **Google Gemini API** to provide personalized analysis and study plans for Nigerian students. This service is deployed on **Railway**.

**➡️ Frontend Repository:** [https://github.com/Tessa-777/Royal-Light-StudyGapAI](https://github.com/Tessa-777/Royal-Light-StudyGapAI)

---

## ✨ Core Features

- **AI-Powered Diagnostic Engine:** The core of the API. Analyzes quiz results and student explanations to identify root cause knowledge gaps.
- **Personalized Study Plan Generation:** Creates tailored 6-week study roadmaps based on diagnostic data.
- **Secure Authentication:** Manages user registration, login, and profiles using Supabase Auth.
- **Comprehensive Progress Tracking:** Endpoints to store and retrieve quiz history, performance metrics, and study plan progress.
- **RESTful API Design:** Clean, well-structured endpoints for seamless integration with any frontend client.

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Flask (Python) | Core API & Business Logic |
| **Database** | Supabase (PostgreSQL) | Data Storage, Auth & Row-Level Security |
| **AI Engine** | Google Gemini 2.0 Flash | Diagnostic Analysis & Plan Generation |
| **Hosting** | Railway | Deployment |

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ and `pip`
- A Supabase project
- A Google AI API Key

### 2. Installation & Setup

1.  **Clone the `backend-ai-integrated-main` branch:**
    ```bash
    git clone --branch backend-ai-integrated-main https://github.com/Tessa-777/Royal-Light-StudyGapAI-Backend.git
    cd Royal-Light-StudyGapAI-Backend
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root and add your credentials:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    GOOGLE_API_KEY=your_gemini_api_key
    ```

4.  **Run database migrations:**
    Apply the SQL migrations located in the `/supabase/migrations` directory to your Supabase project via the SQL Editor. This sets up the required tables and Row-Level Security policies.

5.  **Run the development server:**
    ```bash
    flask run
    ```
    The API will be available at `http://127.0.0.1:5000`.

## 🤖 The AI Engine (Google Gemini)

Our API's core intelligence comes from **Google Gemini 2.0 Flash**.

- **Why Gemini?** It offers the perfect balance of fast response times (3-5 seconds per analysis), low cost, and strong reasoning capabilities for the Nigerian educational context.
- **How it Works:** We use a carefully engineered 287-line system prompt that instructs the model to perform a deep analysis and return a validated, structured JSON response. This ensures reliability and consistency for the frontend.

## 🔑 API Endpoints

### Authentication
- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Authenticate a user and receive a JWT.
- `GET /api/users/me`: Get the current authenticated user's profile.

### AI Diagnostics & Study Plans
- `POST /api/ai/analyze-diagnostic`: **(Core Endpoint)** Submits quiz data and student explanations. Returns a comprehensive AI-generated diagnostic report, including root cause analysis, a projected score, and a full 6-week study plan.
- `POST /api/ai/save-diagnostic`: Saves a guest user's diagnostic results to their account after they register.
- `POST /api/ai/explain-answer`: Get a detailed, AI-generated explanation for a specific quiz question.

### Quizzes & Progress
- `GET /api/quiz/questions`: Retrieve the list of diagnostic quiz questions.
- `GET /api/progress/progress`: Get a user's historical performance data.

## 📄 AI Acceleration Report

This project was built in a hackathon timeframe using extensive AI assistance. For a complete breakdown, see our **[AI Acceleration Report](AI_ACCELERATION_REPORT.md)**.
``````