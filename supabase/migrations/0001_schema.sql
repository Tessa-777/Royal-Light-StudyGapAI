-- StudyGapAI schema baseline (aligns with brief)
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255),
  name varchar(255),
  phone varchar(20),
  target_score int,
  created_at timestamp with time zone default now(),
  last_active timestamp with time zone default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name varchar(100),
  description text,
  prerequisite_topic_ids uuid[],
  jamb_weight float
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete set null,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer varchar(1),
  difficulty varchar(20),
  subtopic varchar(100)
);

create table if not exists diagnostic_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  total_questions int default 30,
  correct_answers int default 0,
  score_percentage float default 0
);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references diagnostic_quizzes(id) on delete cascade,
  question_id uuid references questions(id) on delete set null,
  student_answer varchar(1),
  correct_answer varchar(1),
  is_correct boolean,
  explanation_text text,
  time_spent_seconds int
);

create table if not exists ai_diagnostics (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references diagnostic_quizzes(id) on delete cascade,
  weak_topics jsonb,
  strong_topics jsonb,
  analysis_summary text,
  projected_score int,
  foundational_gaps jsonb,
  generated_at timestamp with time zone default now()
);

create table if not exists study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  diagnostic_id uuid references ai_diagnostics(id) on delete cascade,
  plan_data jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete set null,
  type varchar(20),
  title varchar(255),
  url text,
  source varchar(100),
  duration_minutes int,
  difficulty varchar(20),
  upvotes int
);


