-- db/init.sql
-- Medical Coding Database Schema

-- CPT Codes table
CREATE TABLE cpt_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    section VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ICD-10-CM Codes table
CREATE TABLE icd10_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    chapter VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HCPCS Codes table
CREATE TABLE hcpcs_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice Questions table
CREATE TABLE practice_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(10),
    option_b VARCHAR(10),
    option_c VARCHAR(10),
    option_d VARCHAR(10),
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    question_type VARCHAR(50), -- 'CPT', 'ICD10', 'HCPCS', 'GENERAL'
    difficulty_level VARCHAR(20), -- 'EASY', 'MEDIUM', 'HARD'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Performance Tracking
CREATE TABLE agent_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES practice_questions(id),
    agent_answer VARCHAR(10),
    confidence_score DECIMAL(5,4),
    reasoning TEXT,
    processing_time_ms INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FHIR Terminology Mappings
CREATE TABLE fhir_code_mappings (
    id SERIAL PRIMARY KEY,
    source_code VARCHAR(20),
    source_system VARCHAR(100),
    target_code VARCHAR(20),
    target_system VARCHAR(100),
    equivalence VARCHAR(20), -- 'equal', 'equivalent', 'wider', 'narrower'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_cpt_code ON cpt_codes(code);
CREATE INDEX idx_icd10_code ON icd10_codes(code);
CREATE INDEX idx_hcpcs_code ON hcpcs_codes(code);
CREATE INDEX idx_question_type ON practice_questions(question_type);
CREATE INDEX idx_agent_responses_question ON agent_responses(question_id);
CREATE INDEX idx_agent_responses_created ON agent_responses(created_at);

-- Enhanced CPT codes with relationships and context
ALTER TABLE cpt_codes ADD COLUMN IF NOT EXISTS usage_notes TEXT;
ALTER TABLE cpt_codes ADD COLUMN IF NOT EXISTS common_mistakes TEXT;
ALTER TABLE cpt_codes ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Enhanced ICD-10 codes  
ALTER TABLE icd10_codes ADD COLUMN IF NOT EXISTS usage_notes TEXT;
ALTER TABLE icd10_codes ADD COLUMN IF NOT EXISTS common_mistakes TEXT;
ALTER TABLE icd10_codes ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Enhanced HCPCS codes
ALTER TABLE hcpcs_codes ADD COLUMN IF NOT EXISTS usage_notes TEXT;
ALTER TABLE hcpcs_codes ADD COLUMN IF NOT EXISTS common_mistakes TEXT;
ALTER TABLE hcpcs_codes ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Code relationships table
CREATE TABLE IF NOT EXISTS code_relationships (
    id SERIAL PRIMARY KEY,
    primary_code VARCHAR(20),
    related_code VARCHAR(20),
    relationship_type VARCHAR(50), -- 'excludes', 'includes', 'similar', 'see_also'
    explanation TEXT,
    coding_system VARCHAR(10), -- 'CPT', 'ICD10', 'HCPCS'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question patterns and common mistakes
CREATE TABLE IF NOT EXISTS question_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100),
    keywords TEXT[],
    correct_approach TEXT,
    common_mistakes TEXT,
    example_codes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical terminology lookup
CREATE TABLE IF NOT EXISTS medical_terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100),
    definition TEXT,
    category VARCHAR(50), -- 'anatomy', 'procedure', 'condition', 'modifier'
    related_codes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO cpt_codes (code, description, category, section) VALUES
('10021', 'Fine needle aspiration; without imaging guidance', 'Surgery', 'Integumentary System'),
('10060', 'Incision and drainage of abscess (eg, carbuncle, suppurative hidradenitis, cutaneous or subcutaneous abscess, cyst, furuncle, or paronychia); simple or single', 'Surgery', 'Integumentary System'),
('10080', 'Incision and drainage of pilonidal cyst; simple', 'Surgery', 'Integumentary System'),
('10120', 'Incision and removal of foreign body, subcutaneous tissues; simple', 'Surgery', 'Integumentary System');

INSERT INTO icd10_codes (code, description, category, chapter) VALUES
('I10', 'Essential (primary) hypertension', 'Circulatory', 'Diseases of the circulatory system'),
('E10.9', 'Type 1 diabetes mellitus without complications', 'Endocrine', 'Endocrine, nutritional and metabolic diseases'),
('A90', 'Dengue fever [classical dengue]', 'Infectious', 'Certain infectious and parasitic diseases');

INSERT INTO hcpcs_codes (code, description, category) VALUES
('K0001', 'Standard wheelchair', 'Durable Medical Equipment'),
('E0601', 'Continuous positive airway pressure (CPAP) device', 'Durable Medical Equipment'),
('J1745', 'Injection, infliximab, 10 mg', 'Drugs Administered Other Than Oral Method');

-- Insert enhanced CPT code data with context
INSERT INTO cpt_codes (code, description, category, section, usage_notes, common_mistakes, keywords) VALUES
('41113', 'Excision of lesion of floor of mouth', 'Surgery', 'Digestive System', 
 'Specific to floor of mouth anatomy. Use when lesion is specifically on floor of mouth.', 
 'Often confused with 40804 (vestibule) or 41108 (tongue). Location is key.',
 ARRAY['oral', 'lesion', 'excision', 'floor', 'mouth']),

('10060', 'Incision and drainage of abscess; simple or single', 'Surgery', 'Integumentary System',
 'For simple, single abscesses. Does not include complicated procedures.',
 'Confused with 10061 (complicated) or 10080 (pilonidal cyst). Complexity matters.',
 ARRAY['incision', 'drainage', 'abscess', 'simple', 'infected']),

('20020', 'Arthrotomy, including exploration, drainage, or removal of foreign body; shoulder', 'Surgery', 'Musculoskeletal',
 'Note: This code description seems incorrect in the practice test. Should verify.',
 'May be confused with other soft tissue procedures.',
 ARRAY['arthrotomy', 'shoulder', 'exploration', 'drainage']),

('83036', 'Hemoglobin; glycosylated (A1C)', 'Laboratory', 'Chemistry',
 'Standard test for diabetes monitoring. Measures average glucose over 2-3 months.',
 'Not confused with regular hemoglobin tests (83020-83033).',
 ARRAY['hemoglobin', 'a1c', 'glycosylated', 'diabetes', 'glucose']),

('60220', 'Total thyroid lobectomy, unilateral; with or without isthmusectomy', 'Surgery', 'Endocrine',
 'For removal of one thyroid lobe. Different from partial (60210) or total thyroidectomy (60240).',
 'Often confused with 60210 (partial) or 60240 (total thyroidectomy).',
 ARRAY['thyroid', 'lobectomy', 'unilateral', 'endocrine']);

-- Insert enhanced ICD-10 codes
INSERT INTO icd10_codes (code, description, category, chapter, usage_notes, common_mistakes, keywords) VALUES
('I10', 'Essential (primary) hypertension', 'Circulatory', 'Diseases of the circulatory system',
 'Use for primary/essential hypertension without complications or specified cause.',
 'Do not use if hypertension is secondary or has heart/kidney complications.',
 ARRAY['hypertension', 'essential', 'primary', 'blood', 'pressure']),

('E10.9', 'Type 1 diabetes mellitus without complications', 'Endocrine', 'Endocrine, nutritional and metabolic diseases',
 'For type 1 diabetes without current complications. Use additional codes for complications.',
 'Not for type 2 (E11.x) or gestational diabetes. Must specify type 1.',
 ARRAY['diabetes', 'type', '1', 'mellitus', 'insulin']),

('A90', 'Dengue fever [classical dengue]', 'Infectious', 'Certain infectious and parasitic diseases',
 'For classic dengue fever without hemorrhagic manifestations.',
 'Different from dengue hemorrhagic fever (A91).',
 ARRAY['dengue', 'fever', 'tropical', 'viral']),

('M17.1', 'Bilateral primary osteoarthritis of knee', 'Musculoskeletal', 'Diseases of the musculoskeletal system',
 'Specifically for bilateral knee arthritis. Use M17.0 for unilateral.',
 'Must specify bilateral vs unilateral (M17.0).',
 ARRAY['osteoarthritis', 'bilateral', 'knee', 'arthritis', 'joint']);

-- Insert enhanced HCPCS codes  
INSERT INTO hcpcs_codes (code, description, category, usage_notes, common_mistakes, keywords) VALUES
('K0001', 'Standard wheelchair', 'Durable Medical Equipment',
 'Basic manual wheelchair. Most common wheelchair code.',
 'Different from powered wheelchairs (K0813+) or specialized types.',
 ARRAY['wheelchair', 'manual', 'standard', 'mobility']),

('E0601', 'Continuous positive airway pressure (CPAP) device', 'Durable Medical Equipment',
 'For sleep apnea treatment. Standard CPAP machine.',
 'Different from BiPAP (E0470) or other respiratory equipment.',
 ARRAY['cpap', 'sleep', 'apnea', 'respiratory', 'airway']),

('J1745', 'Injection, infliximab, 10 mg', 'Drugs Administered Other Than Oral Method',
 'Remicade injection. Dosed per 10mg units.',
 'Dose-specific. Different from other TNF inhibitors.',
 ARRAY['infliximab', 'remicade', 'injection', 'tnf', 'biologic']);

-- Insert code relationships
INSERT INTO code_relationships (primary_code, related_code, relationship_type, explanation, coding_system) VALUES
('41113', '40804', 'similar', 'Both oral lesion excisions, but 41113 is floor of mouth, 40804 is vestibule', 'CPT'),
('41113', '41108', 'similar', 'Both oral excisions, but 41113 is floor of mouth, 41108 is tongue', 'CPT'),
('10060', '10061', 'similar', '10060 is simple I&D, 10061 is complicated', 'CPT'),
('10060', '10080', 'similar', '10060 is abscess I&D, 10080 is pilonidal cyst', 'CPT'),
('I10', 'I11.9', 'related', 'I10 is essential HTN, I11.9 is hypertensive heart disease', 'ICD10'),
('E10.9', 'E11.9', 'similar', 'E10.9 is type 1 diabetes, E11.9 is type 2', 'ICD10');

-- Insert question patterns
INSERT INTO question_patterns (pattern_name, keywords, correct_approach, common_mistakes, example_codes) VALUES
('oral_lesion_excision', ARRAY['oral', 'lesion', 'excision', 'mouth', 'floor'],
 'Identify specific anatomical location: floor of mouth = 41113, vestibule = 40804, tongue = 41108',
 'Confusing anatomical locations within oral cavity',
 ARRAY['41113', '40804', '41108']),

('abscess_drainage', ARRAY['incision', 'drainage', 'abscess', 'infected', 'simple'],
 'Determine complexity: simple = 10060, complicated = 10061. Consider anatomical location.',
 'Not distinguishing between simple and complicated procedures',
 ARRAY['10060', '10061', '10080']),

('hypertension_coding', ARRAY['hypertension', 'blood', 'pressure', 'essential'],
 'Essential/primary HTN = I10. Secondary HTN uses I15.x. With complications use I11-I13.',
 'Using I10 when hypertension has complications or is secondary',
 ARRAY['I10', 'I11.9', 'I15.0']),

('diabetes_coding', ARRAY['diabetes', 'type', 'mellitus', 'insulin'],
 'Must specify type: Type 1 = E10.x, Type 2 = E11.x. Add complications with additional digits.',
 'Confusing type 1 and type 2, or not coding complications',
 ARRAY['E10.9', 'E11.9']);

-- Insert medical terminology
INSERT INTO medical_terms (term, definition, category, related_codes) VALUES
('bradycardia', 'Abnormally slow heart rate, typically under 60 beats per minute', 'condition', ARRAY['R00.1']),
('hyperglycemia', 'Abnormally high blood glucose levels', 'condition', ARRAY['R73.9']),
('hepatomegaly', 'Abnormal enlargement of the liver', 'condition', ARRAY['R16.0']),
('lobectomy', 'Surgical removal of a lobe of an organ', 'procedure', ARRAY['60220', '32480']),
('excision', 'Surgical removal or cutting out of tissue', 'procedure', ARRAY['11400-11646', '40800-41899']),
('incision and drainage', 'Surgical procedure to cut open and drain fluid/pus', 'procedure', ARRAY['10060-10180']);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cpt_keywords ON cpt_codes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_icd10_keywords ON icd10_codes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_hcpcs_keywords ON hcpcs_codes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_medical_terms_term ON medical_terms(term);
CREATE INDEX IF NOT EXISTS idx_question_patterns_keywords ON question_patterns USING GIN(keywords);

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
