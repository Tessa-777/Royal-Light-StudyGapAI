-- AI/SE Enhanced Schema Migration
-- This migration creates the enhanced schema for full AI/SE integration
-- Based on decisions: Topic name in questions, comprehensive diagnostics, etc.

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  target_score INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TOPICS TABLE
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,  -- Added: Subject for better organization
  description TEXT,
  prerequisite_topic_ids UUID[],
  jamb_weight FLOAT
);

CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject);

-- 3. QUESTIONS TABLE (Enhanced with topic name)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  topic VARCHAR(100) NOT NULL,  -- Added: Topic name for direct access (Decision 3: Option C)
  subject VARCHAR(50) NOT NULL,  -- Added: Subject for filtering
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  subtopic VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);

-- 4. DIAGNOSTIC_QUIZZES TABLE (Enhanced with subject and time tracking)
CREATE TABLE IF NOT EXISTS diagnostic_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,  -- Added: Subject (Decision 1: Option A)
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INT NOT NULL DEFAULT 30,
  time_taken_minutes FLOAT,  -- Added: Time tracking (Decision 5: Option A)
  correct_answers INT DEFAULT 0,
  score_percentage FLOAT DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_quizzes_user_id ON diagnostic_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_quizzes_subject ON diagnostic_quizzes(subject);

-- 5. QUIZ_RESPONSES TABLE (Enhanced with confidence and topic)
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES diagnostic_quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  topic VARCHAR(100) NOT NULL,  -- Added: Topic name for AI analysis
  student_answer VARCHAR(1) CHECK (student_answer IN ('A', 'B', 'C', 'D')),
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  confidence INT CHECK (confidence >= 1 AND confidence <= 5),  -- Added: Confidence score (Decision 2: Option C - inferred)
  explanation TEXT,  -- Renamed from explanation_text for consistency
  time_spent_seconds INT
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_quiz_id ON quiz_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_topic ON quiz_responses(topic);

-- 6. AI_DIAGNOSTICS TABLE (Enhanced - Comprehensive Schema)
-- Decision 10: Option B - Store both analysis_result and denormalized fields
CREATE TABLE IF NOT EXISTS ai_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES diagnostic_quizzes(id) ON DELETE CASCADE,
  
  -- Complete analysis result from AI (preserves exact AI output)
  analysis_result JSONB NOT NULL,
  
  -- Denormalized fields for easy querying (Decision 10: Option B)
  overall_performance JSONB,
  topic_breakdown JSONB,
  root_cause_analysis JSONB,
  predicted_jamb_score JSONB,
  study_plan JSONB,  -- Study plan included in diagnostic (Decision 4: Option A)
  recommendations JSONB,
  
  -- Legacy fields for backward compatibility (can be extracted from analysis_result)
  weak_topics JSONB,
  strong_topics JSONB,
  analysis_summary TEXT,
  projected_score INT,
  foundational_gaps JSONB,
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_diagnostics_quiz_id ON ai_diagnostics(quiz_id);
CREATE INDEX IF NOT EXISTS idx_ai_diagnostics_generated_at ON ai_diagnostics(generated_at);
CREATE INDEX IF NOT EXISTS idx_ai_diagnostics_predicted_score ON ai_diagnostics((predicted_jamb_score->>'score'));
-- Index for querying topic breakdown
CREATE INDEX IF NOT EXISTS idx_ai_diagnostics_topic_breakdown ON ai_diagnostics USING GIN(topic_breakdown);

-- 7. STUDY_PLANS TABLE
-- Note: Study plan is now included in ai_diagnostics, but keeping this table
-- for potential future use or if users want to save customized plans
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  diagnostic_id UUID REFERENCES ai_diagnostics(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_diagnostic_id ON study_plans(diagnostic_id);

-- 8. PROGRESS_TRACKING TABLE
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')),
  resources_viewed INT DEFAULT 0,
  practice_problems_completed INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);

-- 9. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  type VARCHAR(20) CHECK (type IN ('video', 'practice_set')),
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  source VARCHAR(100),
  duration_minutes INT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  upvotes INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_resources_topic_id ON resources(topic_id);

-- Comments for documentation
COMMENT ON TABLE ai_diagnostics IS 'Stores comprehensive AI diagnostic analysis results. analysis_result contains the full AI output, while denormalized fields enable easy querying.';
COMMENT ON COLUMN ai_diagnostics.analysis_result IS 'Complete AI analysis result as JSON. This is the source of truth.';
COMMENT ON COLUMN ai_diagnostics.study_plan IS '6-week study plan included in diagnostic analysis (Decision 4: Option A)';
COMMENT ON COLUMN questions.topic IS 'Topic name stored directly for performance (Decision 3: Option C)';
COMMENT ON COLUMN quiz_responses.confidence IS 'Confidence score (1-5). If not provided, will be inferred from time_spent and explanation quality (Decision 2: Option C)';
COMMENT ON COLUMN diagnostic_quizzes.time_taken_minutes IS 'Total time taken for quiz in minutes, provided by frontend (Decision 5: Option A)';

