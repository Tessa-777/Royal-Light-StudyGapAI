-- Row Level Security (RLS) Policies for AI/SE Enhanced Schema
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 1. USERS TABLE POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- 2. TOPICS TABLE POLICIES
-- Topics are public (read-only)
CREATE POLICY "Topics are publicly readable"
  ON topics FOR SELECT
  USING (true);

-- 3. QUESTIONS TABLE POLICIES
-- Questions are public (read-only)
CREATE POLICY "Questions are publicly readable"
  ON questions FOR SELECT
  USING (true);

-- 4. DIAGNOSTIC_QUIZZES TABLE POLICIES
-- Users can only access their own quizzes
CREATE POLICY "Users can view own quizzes"
  ON diagnostic_quizzes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own quizzes"
  ON diagnostic_quizzes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quizzes"
  ON diagnostic_quizzes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 5. QUIZ_RESPONSES TABLE POLICIES
-- Users can only access responses for their own quizzes
CREATE POLICY "Users can view own quiz responses"
  ON quiz_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagnostic_quizzes
      WHERE diagnostic_quizzes.id = quiz_responses.quiz_id
      AND diagnostic_quizzes.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create own quiz responses"
  ON quiz_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagnostic_quizzes
      WHERE diagnostic_quizzes.id = quiz_responses.quiz_id
      AND diagnostic_quizzes.user_id::text = auth.uid()::text
    )
  );

-- 6. AI_DIAGNOSTICS TABLE POLICIES
-- Users can only access diagnostics for their own quizzes
CREATE POLICY "Users can view own diagnostics"
  ON ai_diagnostics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagnostic_quizzes
      WHERE diagnostic_quizzes.id = ai_diagnostics.quiz_id
      AND diagnostic_quizzes.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create own diagnostics"
  ON ai_diagnostics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagnostic_quizzes
      WHERE diagnostic_quizzes.id = ai_diagnostics.quiz_id
      AND diagnostic_quizzes.user_id::text = auth.uid()::text
    )
  );

-- 7. STUDY_PLANS TABLE POLICIES
-- Users can only access their own study plans
CREATE POLICY "Users can view own study plans"
  ON study_plans FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own study plans"
  ON study_plans FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own study plans"
  ON study_plans FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 8. PROGRESS_TRACKING TABLE POLICIES
-- Users can only access their own progress
CREATE POLICY "Users can view own progress"
  ON progress_tracking FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own progress"
  ON progress_tracking FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own progress"
  ON progress_tracking FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 9. RESOURCES TABLE POLICIES
-- Resources are public (read-only)
CREATE POLICY "Resources are publicly readable"
  ON resources FOR SELECT
  USING (true);

-- Note: These policies assume Supabase Auth is being used
-- For backend-only authentication (JWT), you may need to adjust these policies
-- or handle authorization in the backend application layer

