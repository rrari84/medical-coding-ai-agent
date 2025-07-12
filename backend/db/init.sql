-- db/init.sql
-- Complete Medical Coding Database Schema with AI Test Tracking

-- Original Medical Coding tables
CREATE TABLE cpt_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    section VARCHAR(100),
    usage_notes TEXT,
    common_mistakes TEXT,
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE icd10_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    chapter VARCHAR(100),
    usage_notes TEXT,
    common_mistakes TEXT,
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hcpcs_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    usage_notes TEXT,
    common_mistakes TEXT,
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE practice_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(10),
    option_b VARCHAR(10),
    option_c VARCHAR(10),
    option_d VARCHAR(10),
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    question_type VARCHAR(50),
    difficulty_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Test Results Database Schema
-- Test runs table - stores each test execution
CREATE TABLE test_runs (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- 'pattern', 'gpt4o', 'custom', 'ensemble'
    questions_tested INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    avg_confidence DECIMAL(5,3),
    avg_processing_time INTEGER, -- in milliseconds
    total_processing_time INTEGER,
    test_duration INTEGER, -- total test time in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- store additional test info
);

-- Individual question results table
CREATE TABLE question_results (
    id SERIAL PRIMARY KEY,
    test_run_id INTEGER REFERENCES test_runs(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_text TEXT,
    question_category VARCHAR(50),
    correct_answer CHAR(1),
    ai_answer CHAR(1),
    is_correct BOOLEAN NOT NULL,
    confidence DECIMAL(5,3),
    processing_time INTEGER,
    reasoning TEXT,
    source VARCHAR(50), -- 'pattern_matching', 'openai', 'custom_agent', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent performance summary table (for quick metrics)
CREATE TABLE agent_performance (
    id SERIAL PRIMARY KEY,
    agent_type VARCHAR(50) NOT NULL UNIQUE,
    total_tests INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0,
    avg_accuracy DECIMAL(5,2) DEFAULT 0,
    avg_confidence DECIMAL(5,3) DEFAULT 0,
    last_test_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pattern matching optimization table
CREATE TABLE pattern_optimization (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL,
    keywords TEXT[],
    correct_code VARCHAR(20),
    success_rate DECIMAL(5,2) DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    successful_matches INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Agent responses for continuous learning
CREATE TABLE agent_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES practice_questions(id),
    agent_answer VARCHAR(10),
    confidence_score DECIMAL(5,4),
    reasoning TEXT,
    processing_time_ms INTEGER,
    is_correct BOOLEAN,
    agent_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code relationships table
CREATE TABLE code_relationships (
    id SERIAL PRIMARY KEY,
    primary_code VARCHAR(20),
    related_code VARCHAR(20),
    relationship_type VARCHAR(50),
    explanation TEXT,
    coding_system VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question patterns and common mistakes
CREATE TABLE question_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100),
    keywords TEXT[],
    correct_approach TEXT,
    common_mistakes TEXT,
    example_codes TEXT[],
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical terminology lookup
CREATE TABLE medical_terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100),
    definition TEXT,
    category VARCHAR(50),
    related_codes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_cpt_code ON cpt_codes(code);
CREATE INDEX idx_cpt_keywords ON cpt_codes USING GIN(keywords);
CREATE INDEX idx_icd10_code ON icd10_codes(code);
CREATE INDEX idx_icd10_keywords ON icd10_codes USING GIN(keywords);
CREATE INDEX idx_hcpcs_code ON hcpcs_codes(code);
CREATE INDEX idx_hcpcs_keywords ON hcpcs_codes USING GIN(keywords);
CREATE INDEX idx_question_type ON practice_questions(question_type);
CREATE INDEX idx_test_runs_agent_type ON test_runs(agent_type);
CREATE INDEX idx_test_runs_created_at ON test_runs(created_at);
CREATE INDEX idx_question_results_test_run_id ON question_results(test_run_id);
CREATE INDEX idx_question_results_category ON question_results(question_category);
CREATE INDEX idx_agent_performance_agent_type ON agent_performance(agent_type);
CREATE INDEX idx_agent_responses_question ON agent_responses(question_id);
CREATE INDEX idx_agent_responses_created ON agent_responses(created_at);
CREATE INDEX idx_medical_terms_term ON medical_terms(term);
CREATE INDEX idx_question_patterns_keywords ON question_patterns USING GIN(keywords);

-- Insert initial agent performance records
INSERT INTO agent_performance (agent_type) VALUES 
('pattern'),
('gpt4o'), 
('custom'),
('ensemble')
ON CONFLICT (agent_type) DO NOTHING;

-- View for test comparison
CREATE VIEW test_comparison AS
SELECT 
    tr.agent_type,
    COUNT(*) as total_tests,
    AVG(tr.accuracy) as avg_accuracy,
    MAX(tr.accuracy) as best_accuracy,
    AVG(tr.avg_confidence) as avg_confidence,
    AVG(tr.questions_tested) as avg_questions_per_test,
    MAX(tr.created_at) as last_test_date
FROM test_runs tr
GROUP BY tr.agent_type
ORDER BY avg_accuracy DESC;

-- View for detailed question analysis
CREATE VIEW question_analysis AS
SELECT 
    qr.question_category,
    qr.correct_answer,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE qr.is_correct = true) as correct_attempts,
    ROUND(COUNT(*) FILTER (WHERE qr.is_correct = true) * 100.0 / COUNT(*), 2) as success_rate,
    AVG(qr.confidence) as avg_confidence
FROM question_results qr
GROUP BY qr.question_category, qr.correct_answer
ORDER BY success_rate DESC;

-- Sample CPT codes with enhanced data
INSERT INTO cpt_codes (code, description, category, section, usage_notes, common_mistakes, keywords) VALUES
('10021', 'Fine needle aspiration; without imaging guidance', 'Surgery', 'Integumentary System', 'Simple aspiration procedure', 'Not for guided procedures', ARRAY['aspiration', 'needle', 'fine']),
('10060', 'Incision and drainage of abscess; simple or single', 'Surgery', 'Integumentary System', 'For simple, single abscesses only', 'Confused with 10061 (complicated) or 10080 (pilonidal)', ARRAY['incision', 'drainage', 'abscess', 'simple', 'infected']),
('10080', 'Incision and drainage of pilonidal cyst; simple', 'Surgery', 'Integumentary System', 'Specific to pilonidal cysts', 'Different from general abscess drainage', ARRAY['pilonidal', 'cyst', 'drainage']),
('10120', 'Incision and removal of foreign body, subcutaneous tissues; simple', 'Surgery', 'Integumentary System', 'For simple foreign body removal', 'Not for deep or complicated cases', ARRAY['foreign', 'body', 'removal', 'simple']),
('41113', 'Excision of lesion of floor of mouth', 'Surgery', 'Digestive System', 'Specific to floor of mouth anatomy', 'Often confused with 40804 (vestibule) or 41108 (tongue)', ARRAY['oral', 'lesion', 'excision', 'floor', 'mouth']),
('20020', 'Arthrotomy, including exploration, drainage, or removal of foreign body; shoulder', 'Surgery', 'Musculoskeletal', 'Shoulder joint procedures', 'May be confused with soft tissue procedures', ARRAY['arthrotomy', 'shoulder', 'exploration', 'drainage']),
('83036', 'Hemoglobin; glycosylated (A1C)', 'Laboratory', 'Chemistry', 'Standard diabetes monitoring test', 'Not confused with regular hemoglobin tests', ARRAY['hemoglobin', 'a1c', 'glycosylated', 'diabetes', 'glucose']),
('60220', 'Total thyroid lobectomy, unilateral; with or without isthmusectomy', 'Surgery', 'Endocrine', 'For removal of one thyroid lobe', 'Often confused with 60210 (partial) or 60240 (total)', ARRAY['thyroid', 'lobectomy', 'unilateral', 'endocrine'])
ON CONFLICT (code) DO UPDATE SET
    usage_notes = EXCLUDED.usage_notes,
    common_mistakes = EXCLUDED.common_mistakes,
    keywords = EXCLUDED.keywords;

-- Sample ICD-10 codes
INSERT INTO icd10_codes (code, description, category, chapter, usage_notes, common_mistakes, keywords) VALUES
('I10', 'Essential (primary) hypertension', 'Circulatory', 'Diseases of the circulatory system', 'Use for primary hypertension without complications', 'Do not use if secondary or with complications', ARRAY['hypertension', 'essential', 'primary', 'blood', 'pressure']),
('E10.9', 'Type 1 diabetes mellitus without complications', 'Endocrine', 'Endocrine diseases', 'Type 1 diabetes without current complications', 'Not for type 2 or gestational diabetes', ARRAY['diabetes', 'type', '1', 'mellitus', 'insulin']),
('A90', 'Dengue fever [classical dengue]', 'Infectious', 'Infectious and parasitic diseases', 'Classic dengue without hemorrhagic manifestations', 'Different from dengue hemorrhagic fever', ARRAY['dengue', 'fever', 'tropical', 'viral']),
('M17.1', 'Bilateral primary osteoarthritis of knee', 'Musculoskeletal', 'Musculoskeletal diseases', 'Specifically for bilateral knee arthritis', 'Must specify bilateral vs unilateral', ARRAY['osteoarthritis', 'bilateral', 'knee', 'arthritis', 'joint'])
ON CONFLICT (code) DO UPDATE SET
    usage_notes = EXCLUDED.usage_notes,
    common_mistakes = EXCLUDED.common_mistakes,
    keywords = EXCLUDED.keywords;

-- Sample HCPCS codes
INSERT INTO hcpcs_codes (code, description, category, usage_notes, common_mistakes, keywords) VALUES
('K0001', 'Standard wheelchair', 'Durable Medical Equipment', 'Basic manual wheelchair', 'Different from powered wheelchairs', ARRAY['wheelchair', 'manual', 'standard', 'mobility']),
('E0601', 'Continuous positive airway pressure (CPAP) device', 'Durable Medical Equipment', 'For sleep apnea treatment', 'Different from BiPAP or other respiratory equipment', ARRAY['cpap', 'sleep', 'apnea', 'respiratory', 'airway']),
('J1745', 'Injection, infliximab, 10 mg', 'Drugs Administered Other Than Oral Method', 'Remicade injection, dosed per 10mg units', 'Dose-specific, different from other TNF inhibitors', ARRAY['infliximab', 'remicade', 'injection', 'tnf', 'biologic'])
ON CONFLICT (code) DO UPDATE SET
    usage_notes = EXCLUDED.usage_notes,
    common_mistakes = EXCLUDED.common_mistakes,
    keywords = EXCLUDED.keywords;

-- Function to search codes by keywords
CREATE OR REPLACE FUNCTION search_codes_by_keywords(search_keywords TEXT[])
RETURNS TABLE(
    code VARCHAR(20),
    description TEXT,
    coding_system VARCHAR(10),
    usage_notes TEXT,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.code, c.description, 'CPT'::VARCHAR(10), c.usage_notes,
           (SELECT COUNT(*) FROM unnest(c.keywords) k WHERE k = ANY(search_keywords))::INTEGER
    FROM cpt_codes c
    WHERE c.keywords && search_keywords
    
    UNION ALL
    
    SELECT i.code, i.description, 'ICD10'::VARCHAR(10), i.usage_notes,
           (SELECT COUNT(*) FROM unnest(i.keywords) k WHERE k = ANY(search_keywords))::INTEGER  
    FROM icd10_codes i
    WHERE i.keywords && search_keywords
    
    UNION ALL
    
    SELECT h.code, h.description, 'HCPCS'::VARCHAR(10), h.usage_notes,
           (SELECT COUNT(*) FROM unnest(h.keywords) k WHERE k = ANY(search_keywords))::INTEGER
    FROM hcpcs_codes h  
    WHERE h.keywords && search_keywords
    
    ORDER BY relevance_score DESC, coding_system, code;
END;
$$ LANGUAGE plpgsql;

-- Function to update agent performance after each test
CREATE OR REPLACE FUNCTION update_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update agent performance summary
    INSERT INTO agent_performance (agent_type, total_tests, total_questions, total_correct, best_accuracy, avg_accuracy, last_test_date)
    VALUES (
        NEW.agent_type,
        1,
        NEW.questions_tested,
        NEW.correct_answers,
        NEW.accuracy,
        NEW.accuracy,
        NEW.created_at
    )
    ON CONFLICT (agent_type) DO UPDATE SET
        total_tests = agent_performance.total_tests + 1,
        total_questions = agent_performance.total_questions + NEW.questions_tested,
        total_correct = agent_performance.total_correct + NEW.correct_answers,
        best_accuracy = GREATEST(agent_performance.best_accuracy, NEW.accuracy),
        avg_accuracy = (agent_performance.total_correct + NEW.correct_answers) * 100.0 / (agent_performance.total_questions + NEW.questions_tested),
        last_test_date = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update agent performance
CREATE TRIGGER update_agent_performance_trigger
    AFTER INSERT ON test_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_performance();