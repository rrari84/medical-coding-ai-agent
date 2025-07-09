-- Enhanced tables for better accuracy
CREATE TABLE question_bank (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a VARCHAR(10),
  option_b VARCHAR(10), 
  option_c VARCHAR(10),
  option_d VARCHAR(10),
  correct_answer VARCHAR(10),
  explanation TEXT,
  category VARCHAR(50),
  difficulty VARCHAR(20),
  keywords TEXT[], -- For better matching
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_test_results (
  id SERIAL PRIMARY KEY,
  test_run_id UUID,
  question_id INTEGER REFERENCES question_bank(id),
  ai_answer VARCHAR(10),
  correct_answer VARCHAR(10),
  is_correct BOOLEAN,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  reasoning TEXT,
  model_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_analytics (
  id SERIAL PRIMARY KEY,
  test_run_id UUID,
  overall_accuracy DECIMAL(5,2),
  cpt_accuracy DECIMAL(5,2),
  icd10_accuracy DECIMAL(5,2),
  hcpcs_accuracy DECIMAL(5,2),
  avg_confidence DECIMAL(3,2),
  weak_areas JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);