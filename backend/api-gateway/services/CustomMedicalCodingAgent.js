const MedicalCodingDecisionEngine = require('../ai/MedicalCodingDecisionEngine'); 
const MedicalContextAnalyzer = require('../ai/MedicalContextAnalyzer');


//Purpose: This is a custom Pattern matching-AI Hybrid agent for medical coding. It is a structured retrieval + logic-based decision making
//This mimics expert reasonign by combining:
//*A structured knowledge base(MedicalPatterns.js)
//*A decision engine that weighs logic + confidence
//*Specialized logic for CPT, ICD-10-CM, and HCPCS coding systems
//*Pattern matching for rule-based code selection
//*Medical context analysis and concept extraction


//Normalization for options technique in File
function normalizeOptions(options) {
  if (Array.isArray(options)) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const normalized = {};
    options.forEach((value, index) => {
      if (index < letters.length) {
        normalized[letters[index]] = value;
      }
    });
    return normalized;
  }
  return options;
}

class CustomMedicalCodingAgent {
    //Initialized parameters for AI model settings
    constructor(config = {}) {
        this.modelConfig = {
            temperature: 0.1,
            maxTokens: 1000,
            topP: 0.9,
            presencePenalty: 0.0,
            frequencyPenalty: 0.0
        };
        
        //Internal performance trackers
        this.knowledgeBase = null;
        this.codingRules = null;
        this.performanceMetrics = {
            totalQuestions: 0,
            correctAnswers: 0,
            confidenceScores: [],
            processingTimes: [],
            categoryPerformance: {},
            errorPatterns: []
        };
        
        //And uses the Decision Engine/Medical Context Analyzer for the AI model pipeline
        this.decisionEngine = new MedicalCodingDecisionEngine();
        this.contextAnalyzer = new MedicalContextAnalyzer();
    }

    //Initializing Knowledge Base and passes them to the decision engine
    async initialize() {
        console.log('Initializing Custom Medical Coding Agent...');
        
        //Load knowledge base
        this.knowledgeBase = await this.loadKnowledgeBase();
        this.codingRules = await this.loadCodingRules();
        
        //Initialize decision engine with knowledge
        await this.decisionEngine.initialize(this.knowledgeBase, this.codingRules);
        
        console.log('Custom Agent initialization complete');
    }


    //This is the main inference pipeline
    //Considered to be the heart of the custom agent: this is what is run when a test question is sent
    async processQuestion(questionData) {
        const startTime = performance.now(); //tracking speed here
        
        //Described in a sequential flow:
        try {
            //Step 1: Parse and analyze the question
            const questionAnalysis = await this.contextAnalyzer.analyzeQuestion(questionData);
            
            //Step 2: Extract medical concepts and terminology
            const medicalConcepts = this.extractMedicalConcepts(questionData.question);
            
            //Step 3: Determine code type and category
            const codeCategory = this.determineCodeCategory(questionData);
            
            //Step 4: Apply specialized reasoning based on category
            const reasoning = await this.applySpecializedReasoning(
                questionAnalysis, 
                medicalConcepts, 
                codeCategory,
                questionData.options
            );
            
            //Step 5: Apply pattern matching from existing knowledge base
            const patternMatch = this.applyPatternMatching(questionData, reasoning);
            
            console.log('🧪 Before decision engine:');
            console.log('🧪 reasoning:', reasoning);
            console.log('🧪 patternMatch:', patternMatch);
            console.log('🧪 questionData.options:', questionData.options);

            //Normalize options before calling decision engine
            const normalizedOptions = normalizeOptions(questionData.options);

            //Step 6: Make final decision with confidence scoring
            const decision = await this.decisionEngine.makeDecision(reasoning, patternMatch, normalizedOptions);
            
            const processingTime = performance.now() - startTime;
            
            //Log the decision process for tracking metrics internally
            this.logDecisionProcess({
                questionData,
                analysis: questionAnalysis,
                concepts: medicalConcepts,
                category: codeCategory,
                reasoning,
                decision,
                processingTime
            });
            
            return {
                answer: decision.selectedAnswer,
                confidence: decision.confidence,
                reasoning: decision.explanation,
                processingTime: Math.round(processingTime),
                category: codeCategory,
                concepts: medicalConcepts
            };
            
        } catch (error) {
            console.error('Error processing question:', error);
            const processingTime = performance.now() - startTime;
            
            return {
                answer: 'A', // Safe fallback
                confidence: 0.60,
                reasoning: 'Error in processing - using fallback logic',
                processingTime: Math.round(processingTime),
                error: error.message
            };
        }
    }

    //This Basically parses the question to extract and detect:
    //*Anatomical systems
    //*Procedures
    //*Conditions
    //*Modifiers
    //*Key terms
    //These features influence which rules are applied later
    extractMedicalConcepts(questionText) {
        const concepts = {
            anatomicalSystems: [],
            procedures: [],
            conditions: [],
            modifiers: [],
            keyTerms: []
        };
        
        const text = questionText.toLowerCase();
        
        
        const anatomicalPatterns = {
            cardiovascular: ['heart', 'cardiac', 'artery', 'vein', 'blood pressure', 'circulation'],
            respiratory: ['lung', 'breathing', 'airway', 'chest', 'pulmonary', 'sinus', 'nasal', 'nose'],
            musculoskeletal: ['bone', 'joint', 'muscle', 'orthopedic', 'fracture', 'wrist', 'arm', 'leg'],
            nervous: ['brain', 'nerve', 'neurologic', 'spinal', 'headache', 'migraine'],
            digestive: ['stomach', 'intestine', 'liver', 'gastro', 'digestive', 'mouth', 'oral', 'cheek'],
            genitourinary: ['kidney', 'bladder', 'urinary', 'renal', 'urine', 'urologist'],
            endocrine: ['thyroid', 'diabetes', 'hormone', 'pancreas', 'insulin', 'parathyroid'],
            integumentary: ['skin', 'lesion', 'rash', 'dermatitis', 'biopsy', 'cut', 'infected', 'chin']
        };
        
        Object.keys(anatomicalPatterns).forEach(system => {
            if (anatomicalPatterns[system].some(term => text.includes(term))) {
                concepts.anatomicalSystems.push(system);
            }
        });
        
        const procedurePatterns = [
            'surgery', 'biopsy', 'excision', 'incision', 'drainage', 'removal',
            'endoscopy', 'catheterization', 'transplant', 'repair', 'replacement',
            'injection', 'aspiration', 'cauterization', 'examination', 'x-ray',
            'lobectomy', 'nephrostolithotomy', 'angiography', 'cystourethroscopy',
            'sinusotomy', 'parathyroidectomy', 'ultrasound'
        ];
        
        procedurePatterns.forEach(procedure => {
            if (text.includes(procedure)) {
                concepts.procedures.push(procedure);
            }
        });
        
        const conditionPatterns = [
            'hypertension', 'diabetes', 'infection', 'inflammation', 'cancer',
            'fracture', 'abscess', 'cyst', 'tumor', 'stenosis', 'hemorrhage',
            'congestion', 'stone', 'nodule', 'lesion', 'mucocele', 'seroma'
        ];
        
        conditionPatterns.forEach(condition => {
            if (text.includes(condition)) {
                concepts.conditions.push(condition);
            }
        });
        
        const modifierPatterns = {
            bilateral: ['bilateral', 'both sides', 'both'],
            acute: ['acute', 'sudden', 'rapid'],
            chronic: ['chronic', 'persistent', 'long-term', 'months'],
            complicated: ['complicated', 'complex', 'with complications'],
            simple: ['simple', 'basic', 'uncomplicated'],
            diagnostic: ['diagnostic', 'diagnose', 'assess'],
            surgical: ['surgical', 'surgery', 'operation'],
            routine: ['routine', 'regular', 'annual', 'checkup']
        };
        
        Object.keys(modifierPatterns).forEach(modifier => {
            if (modifierPatterns[modifier].some(term => text.includes(term))) {
                concepts.modifiers.push(modifier);
            }
        });
        
        const keyTerms = [
            'excision', 'incision', 'drainage', 'removal', 'biopsy', 'surgery',
            'procedure', 'diagnosis', 'treatment', 'examination', 'test',
            'specialist', 'doctor', 'physician', 'healthcare', 'medical'
        ];
        
        keyTerms.forEach(term => {
            if (text.includes(term)) {
                concepts.keyTerms.push(term);
            }
        });
        
        return concepts;
    }


    //This will auto detect which type of code is being asked for:
    //*"CPT code" in text or 5-digit options
    //*"ICD" or diagnosis in question
    //*Code options like A1234
    //*Or nothing matched
    determineCodeCategory(questionData) {
        const text = questionData.question.toLowerCase();
        
        //Direct mentions
        if (text.includes('cpt code')) return 'CPT';
        if (text.includes('icd') || text.includes('diagnosis')) return 'ICD-10-CM';
        if (text.includes('hcpcs')) return 'HCPCS';
        
        //Analyze options to determine code type
        const options = Object.values(questionData.options);
        const firstOption = options[0];
        
        if (/^\d{5}$/.test(firstOption)) return 'CPT';
        if (/^[A-Z]\d{2}(\.\d+)?$/.test(firstOption)) return 'ICD-10-CM';
        if (/^[A-Z]\d{4}$/.test(firstOption)) return 'HCPCS';
        
        //Content-based detection
        if (text.includes('procedure') || text.includes('surgery') || text.includes('examination')) {
            return 'CPT';
        }
        if (text.includes('condition') || text.includes('disease') || text.includes('diagnosed with')) {
            return 'ICD-10-CM';
        }
        if (text.includes('supply') || text.includes('equipment') || text.includes('device')) {
            return 'HCPCS';
        }
        
        return 'UNKNOWN';
    }

    //This will chose the correct rule engine:
    //*either: applyCPTReasoning(), applyICD10Reasoning(), applyHCPCSReasoning(), or applyGeneralReasoning() which is the fallback
    //Each will build a reasoning object
    async applySpecializedReasoning(analysis, concepts, category, options) {
        let reasoning = {
            primaryLogic: '',
            supportingFacts: [],
            ruleApplications: [],
            confidence: 0
        };
        
        switch (category) {
            case 'CPT':
                reasoning = await this.applyCPTReasoning(analysis, concepts, options);
                break;
            case 'ICD-10-CM':
                reasoning = await this.applyICD10Reasoning(analysis, concepts, options);
                break;
            case 'HCPCS':
                reasoning = await this.applyHCPCSReasoning(analysis, concepts, options);
                break;
            default:
                reasoning = await this.applyGeneralReasoning(analysis, concepts, options);
        }
        
        return reasoning;
    }

    //Rule engine
    async applyCPTReasoning(analysis, concepts, options) {
        const reasoning = {
            primaryLogic: 'CPT code selection based on procedure specificity',
            supportingFacts: [],
            ruleApplications: [],
            confidence: 7.5 
        };
        
        //Check for anatomical location specificity
        if (concepts.anatomicalSystems.length > 0) {
            reasoning.supportingFacts.push(`Anatomical system: ${concepts.anatomicalSystems[0]}`);
            reasoning.confidence += 1;
        }
        
        //Check for procedure complexity
        if (concepts.modifiers.includes('simple')) {
            reasoning.ruleApplications.push('Simple procedure - choose basic code');
            reasoning.confidence += 0.5;
        } else if (concepts.modifiers.includes('complicated')) {
            reasoning.ruleApplications.push('Complex procedure - choose comprehensive code');
            reasoning.confidence += 0.5;
        }
        
        //Check for bilateral procedures
        if (concepts.modifiers.includes('bilateral')) {
            reasoning.ruleApplications.push('Bilateral procedure - may require modifier or specific bilateral code');
            reasoning.confidence += 1;
        }
        
        //Specific procedure detection
        if (concepts.procedures.length > 0) {
            reasoning.supportingFacts.push(`Procedures identified: ${concepts.procedures.join(', ')}`);
            reasoning.confidence += 0.5;
        }
        
        //Analyze options for code ranges
        const optionValues = Object.values(options);
        const codeRanges = this.analyzeCPTCodeRanges(optionValues);
        if (codeRanges.length > 0) {
            reasoning.supportingFacts.push(`Code ranges analyzed: ${codeRanges.join(', ')}`);
            reasoning.confidence += 0.5;
        }
        
        return reasoning;
    }

    //Rule Engine
    async applyICD10Reasoning(analysis, concepts, options) {
        const reasoning = {
            primaryLogic: 'ICD-10-CM diagnosis code selection based on condition specificity',
            supportingFacts: [],
            ruleApplications: [],
            confidence: 7.5 
        };
        
        //Check for acute vs chronic
        if (concepts.modifiers.includes('acute')) {
            reasoning.ruleApplications.push('Acute condition - sequence first if both acute and chronic present');
            reasoning.confidence += 1;
        } else if (concepts.modifiers.includes('chronic')) {
            reasoning.ruleApplications.push('Chronic condition - sequence after acute if both present');
            reasoning.confidence += 0.5;
        }
        
        //Check for complications
        if (concepts.modifiers.includes('complicated')) {
            reasoning.ruleApplications.push('With complications - choose more specific code');
            reasoning.confidence += 1;
        }
        
        //Check for bilateral conditions
        if (concepts.modifiers.includes('bilateral')) {
            reasoning.ruleApplications.push('Bilateral condition - use bilateral-specific code if available');
            reasoning.confidence += 1;
        }
        
        //Condition detection
        if (concepts.conditions.length > 0) {
            reasoning.supportingFacts.push(`Conditions identified: ${concepts.conditions.join(', ')}`);
            reasoning.confidence += 0.5;
        }
        
        //Analyze specificity
        const optionValues = Object.values(options);
        reasoning.supportingFacts.push(`Analyzing ${optionValues.length} diagnostic options for specificity`);
        
        return reasoning;
    }

    //Rule Engine
    async applyHCPCSReasoning(analysis, concepts, options) {
        const reasoning = {
            primaryLogic: 'HCPCS Level II code selection for supplies and equipment',
            supportingFacts: [],
            ruleApplications: [],
            confidence: 7.5 
        };
        
        //Check for DME categories
        const dmeKeywords = ['wheelchair', 'device', 'equipment', 'prosthetic', 'brace'];
        const hasDME = dmeKeywords.some(keyword => 
            analysis.questionText && analysis.questionText.toLowerCase().includes(keyword)
        );
        
        if (hasDME) {
            reasoning.supportingFacts.push('Durable Medical Equipment (DME) identified');
            reasoning.confidence += 1;
        }
        
        //Check for drug administration
        const drugKeywords = ['injection', 'infusion', 'drug', 'medication'];
        const hasDrug = drugKeywords.some(keyword => 
            analysis.questionText && analysis.questionText.toLowerCase().includes(keyword)
        );
        
        if (hasDrug) {
            reasoning.supportingFacts.push('Drug administration identified');
            reasoning.confidence += 1;
        }
        
        return reasoning;
    }

    //Fallback Rule Engine
    async applyGeneralReasoning(analysis, concepts, options) {
        return {
            primaryLogic: 'General medical coding principles applied',
            supportingFacts: ['Question type not definitively determined'],
            ruleApplications: ['Using conservative approach'],
            confidence: 6.5 
        };
    }

    //findbestPattern use case - This is for when a match is found it will:
    //*Append a new ruleApplication
    //*Boosts confidence score
    //*Returns structured format
    applyPatternMatching(questionData, reasoning) {
        //Import and use existing pattern matching logic
        const findBestPattern = require('../ai/PatternMatcher');
        const patternMatch = findBestPattern(questionData.question, questionData.options);
        
        if (patternMatch) {
            reasoning.ruleApplications.push(`Pattern match found: ${patternMatch.reasoning}`);
            reasoning.confidence += 1;
            return patternMatch;
        }
        
        return null;
    }

    //Analyzes the code ranges for CPT 
    analyzeCPTCodeRanges(codes) {
        const ranges = [];
        codes.forEach(code => {
            const codeNum = parseInt(code);
            if (codeNum >= 10000 && codeNum <= 19999) ranges.push('Integumentary');
            else if (codeNum >= 20000 && codeNum <= 29999) ranges.push('Musculoskeletal');
            else if (codeNum >= 30000 && codeNum <= 39999) ranges.push('Respiratory');
            else if (codeNum >= 40000 && codeNum <= 49999) ranges.push('Digestive');
            else if (codeNum >= 50000 && codeNum <= 59999) ranges.push('Urinary');
            else if (codeNum >= 60000 && codeNum <= 69999) ranges.push('Endocrine');
            else if (codeNum >= 70000 && codeNum <= 79999) ranges.push('Radiology');
            else if (codeNum >= 80000 && codeNum <= 89999) ranges.push('Laboratory');
            else if (codeNum >= 90000 && codeNum <= 99999) ranges.push('E/M');
        });
        return [...new Set(ranges)];
    }

    //Logs performance metrics for custom agent into database
    logDecisionProcess(processData) {
        this.performanceMetrics.totalQuestions++;
        this.performanceMetrics.processingTimes.push(processData.processingTime);
        this.performanceMetrics.confidenceScores.push(processData.decision.confidence);
        
        //Log category performance
        const category = processData.category;
        if (!this.performanceMetrics.categoryPerformance[category]) {
            this.performanceMetrics.categoryPerformance[category] = {
                questions: 0,
                averageConfidence: 0,
                averageTime: 0
            };
        }
        
        const catPerf = this.performanceMetrics.categoryPerformance[category];
        catPerf.questions++;
        catPerf.averageTime = (catPerf.averageTime * (catPerf.questions - 1) + processData.processingTime) / catPerf.questions;
        catPerf.averageConfidence = (catPerf.averageConfidence * (catPerf.questions - 1) + processData.decision.confidence) / catPerf.questions;
    }

    //Loading static knowledge - enriches the engine and logic
    async loadKnowledgeBase() {
        // Load from existing MedicalPatterns.js
        const initializeKnowledgeBase = require('../knowledge/MedicalPatterns');
        const knowledgeBase = initializeKnowledgeBase();
        
        // FIXED: Don't override the comprehensive medical terminology from the new knowledge base
        // Only add if it doesn't exist
        if (!knowledgeBase.medicalTerminology) {
            knowledgeBase.medicalTerminology = {
                prefixes: {
                    'osteo': 'bone',
                    'cardio': 'heart',
                    'neuro': 'nerve',
                    'hepato': 'liver',
                    'nephro': 'kidney',
                    'pneumo': 'lung',
                    'gastro': 'stomach',
                    'dermato': 'skin'
                },
                suffixes: {
                    'itis': 'inflammation',
                    'osis': 'condition',
                    'ectomy': 'removal',
                    'ostomy': 'opening',
                    'scopy': 'examination',
                    'graphy': 'recording',
                    'plasty': 'repair',
                    'tomy': 'incision'
                },
                specialties: {
                    'cardiology': 'heart and blood vessels',
                    'orthopedics': 'bones and joints',
                    'dermatology': 'skin conditions',
                    'neurology': 'nervous system',
                    'gastroenterology': 'digestive system',
                    'urology': 'urinary system',
                    'endocrinology': 'hormones and glands'
                }
            };
        }
        
        return knowledgeBase;
    }

    //loading the coding rules - enrichs engine and logic
    async loadCodingRules() {
        return {
            cptRules: {
                'always_use_most_specific': true,
                'bilateral_modifier_50': 'Use modifier 50 for bilateral procedures when appropriate',
                'multiple_procedures': 'List most extensive procedure first',
                'bundling_rules': 'Check NCCI edits for bundling'
            },
            icd10Rules: {
                'acute_before_chronic': 'Code acute condition first when both present',
                'most_specific_available': 'Use most specific code available',
                'external_cause_codes': 'Use external cause codes when applicable',
                'combination_codes': 'Use combination codes when available'
            },
            hcpcsRules: {
                'dme_requirements': 'DME requires medical necessity documentation',
                'drug_codes': 'Use specific drug codes with appropriate units',
                'modifier_usage': 'Apply appropriate modifiers for HCPCS'
            }
        };
    }
}

//Summary -
//This custom agent has a analyzer, knowledge base, reasoning modules, decision engine, and performance tracker
module.exports = CustomMedicalCodingAgent;