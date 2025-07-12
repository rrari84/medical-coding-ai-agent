-- Medical Coding AI Test Results Database Schema

-- Create database (run this first)
-- CREATE DATABASE medical_coding_ai;

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
    correct_answer VARCHAR(1),
    ai_answer VARCHAR(1),
    is_correct BOOLEAN NOT NULL,
    confidence DECIMAL(5,3),
    processing_time INTEGER,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent performance summary table (for quick metrics)
CREATE TABLE agent_performance (
    id SERIAL PRIMARY KEY,
    agent_type VARCHAR(50) NOT NULL,
    total_tests INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0,
    avg_accuracy DECIMAL(5,2) DEFAULT 0,
    avg_confidence DECIMAL(5,3) DEFAULT 0,
    last_test_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_test_runs_agent_type ON test_runs(agent_type);
CREATE INDEX idx_test_runs_created_at ON test_runs(created_at);
CREATE INDEX idx_question_results_test_run_id ON question_results(test_run_id);
CREATE INDEX idx_question_results_category ON question_results(question_category);
CREATE INDEX idx_agent_performance_agent_type ON agent_performance(agent_type);

-- Insert initial agent performance records
INSERT INTO agent_performance (agent_type) VALUES 
('pattern'),
('gpt4o'), 
('custom'),
('ensemble');

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