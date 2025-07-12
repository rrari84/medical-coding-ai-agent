const anatomicalSystemMatching = require('./DecisionEngineStrategies/anatomicalSystemMatching');
const codeRangeValidation = require('./DecisionEngineStrategies/codeRangeValidation');
const eliminationByExclusion = require('./DecisionEngineStrategies/eliminationByExclusion');
const exactPatternMatch = require('./DecisionEngineStrategies/exactPatternMatch');
const medicalReasoningChain = require('./DecisionEngineStrategies/medicalReasoningChain');
const procedureComplexityAnalysis = require('./DecisionEngineStrategies/procedureComplexityAnalysis');
const statisticalFallback = require('./DecisionEngineStrategies/statisticalFallback');
const terminologyDecomposition = require('./DecisionEngineStrategies/terminologyDecomposition');
const normalizeOptions = require('./DecisionEngineUtils/normalizeOptions');
const analyzeQuestion = require('./DecisionEngineUtils/analyzeQuestion');
const analyzeCodeOptions = require('./DecisionEngineUtils/analyzeCodeOptions');
const {
    assessComplexity,
    buildReasoningChain,
    identifyAnatomicalSystem,
    matchToAnatomicalSystem,
    analyzeProcedureComplexity,
    selectByComplexity,
    decomposeTerminology,
    selectByTerminology,
    checkMedicalLogic
} = require('./DecisionEngineUtils/complexityTerminologyBuildUtils');
const {
    validateCodeRanges,
    getStatisticalChoice,
    applyTiebreaker,
    eliminateIncorrectOptions,
    selectByValidation,
} = require('./DecisionEngineUtils/codeValidationUtils');

//This is the core AI agent for determining the correct medical code option using a sequence of decision strategies and logical reasoning.
class MedicalCodingDecisionEngine {
    constructor() {
        this.knowledgeBase = null;
        this.codingRules = null;
        this.decisionThresholds = {
            highConfidence: 0.92,
            mediumConfidence: 0.75,
            lowConfidence: 0.60
        };
        
        //Decision-making strategies in order of preference
        this.decisionStrategies = [
            'exactPatternMatch',
            'medicalReasoningChain',
            'anatomicalSystemMatching',
            'procedureComplexityAnalysis',
            'terminologyDecomposition',
            'codeRangeValidation',
            'eliminationByExclusion',
            'statisticalFallback'
        ];
    }
    //injects external knowledge and rules, separating logic from data
    async initialize(knowledgeBase, codingRules) {
        this.knowledgeBase = knowledgeBase;
        this.codingRules = codingRules;
        console.log('Enhanced Decision Engine initialized with comprehensive knowledge base');
    }
    
    //Main Logic: Purpose - Central method to decide which medical code to select, Iterates through decision strategies in order, then uses fallback if all else fails...
    //Key Steps Here:
    //1.Normalize Options
    //2.Build decisionContext with analysis results
    //3.Applies each strategy with applyStrategy
    //4.Returns first successful result meeting confidence threshold
    //5.If all else fails, uses emergencyFallback
    async makeDecision(reasoning, patternMatch, options) {
        console.log('🧠 Enhanced Decision Engine: Making decision...');
        
        if (!options || typeof options !== 'object') {
            throw new Error('Invalid options object passed to makeDecision');
        }

        //Normalize options to ensure consistent format: Normalization
        const normalizedOptions = normalizeOptions(options);
        
        //Enhanced decision-making process:
        const decisionContext = {
            reasoning,
            patternMatch,
            options: normalizedOptions,
            questionAnalysis: analyzeQuestion(reasoning),
            codeAnalysis: analyzeCodeOptions(normalizedOptions)
        };

        for (const strategyName of this.decisionStrategies) {
            const result = await this.applyStrategy(strategyName, decisionContext);
            if (result && result.confidence >= this.decisionThresholds.lowConfidence) {
                console.log(`✅ Decision made using strategy: ${strategyName}`);
                return this.formatDecisionResult(result, strategyName);
            }
        }

        // Ultimate fallback
        console.log('⚠️ All strategies failed, using emergency fallback');
        return this.emergencyFallback(normalizedOptions);
    }

    // ==================== DECISION STRATEGIES ====================

    ////Strategy Handling: Apply decision strategies in order of preference, passed by necessary helpers
    async applyStrategy(strategyName, context) {
        try {
            switch (strategyName) {
                case 'exactPatternMatch':
                    return exactPatternMatch(context, {
                        findMatchingOption: this.findMatchingOption.bind(this)
                    });
                case 'medicalReasoningChain':
                    return medicalReasoningChain(context, {
                        buildReasoningChain: buildReasoningChain.bind(this), 
                        selectByMedicalLogic: this.selectByMedicalLogic.bind(this)
                    });
                case 'anatomicalSystemMatching':
                    return anatomicalSystemMatching(context, {
                        identifyAnatomicalSystem: identifyAnatomicalSystem.bind(this),
                        matchToAnatomicalSystem: matchToAnatomicalSystem.bind(this)
                    });
                case 'procedureComplexityAnalysis':
                    return procedureComplexityAnalysis(context, {
                        analyzeProcedureComplexity: analyzeProcedureComplexity.bind(this),
                        selectByComplexity: selectByComplexity.bind(this)
                    });
                case 'terminologyDecomposition':
                    return terminologyDecomposition(context, {
                        decomposeTerminology: decomposeTerminology.bind(this),
                        selectByTerminology: selectByTerminology.bind(this)
                    });
                case 'codeRangeValidation':
                    return codeRangeValidation(context, {
                        validateCodeRanges: validateCodeRanges.bind(this), 
                        selectByValidation: selectByValidation.bind(this) 
                    });
                case 'eliminationByExclusion':
                    return eliminationByExclusion(context, {
                        eliminateIncorrectOptions: eliminateIncorrectOptions.bind(this), 
                        applyTiebreaker: applyTiebreaker.bind(this)
                    });
                case 'statisticalFallback':
                    return statisticalFallback(context, {
                        getStatisticalChoice: getStatisticalChoice.bind(this)
                    });
                default:
                    return null;
            }
        } catch (error) {
            console.log(`Strategy ${strategyName} failed:`, error.message);
            return null;
        }
    }

    // ==================== UTILITY METHODS ====================
    
    //Decision Util: Finding matching target code options
    findMatchingOption(targetCode, options) {
        for (const [letter, code] of Object.entries(options)) {
            if (code === targetCode) {
                return letter;
            }
        }
        return null;
    }

    //Decision Util: Format the decision result, including confidence, reasoning, and strategy used, etc.
    formatDecisionResult(result, strategy) {
        return {
            selectedAnswer: result.selectedAnswer,
            confidence: Math.min(0.98, Math.max(0.60, result.confidence)),
            explanation: result.reasoning,
            decisionPath: [strategy],
            strategy: strategy,
            metadata: {
                strategyUsed: strategy,
                originalConfidence: result.confidence,
                adjustedConfidence: Math.min(0.98, Math.max(0.60, result.confidence))
            }
        };
    }
    
    //Decision Util: Last-resort logic: Prefers codes in CPT range 40000-49999, if none, use statistical preference(C,B,D,A), else fallback to first available.
    emergencyFallback(options) {
        const optionKeys = Object.keys(options);
        
        //Emergency fallback with basic logic
        console.log('🚨 Emergency fallback activated');
        
        //Try to find a CPT code in 40000-49999 range (common procedures)
        for (const [letter, code] of Object.entries(options)) {
            if (/^\d{5}$/.test(code)) {
                const codeNum = parseInt(code);
                if (codeNum >= 40000 && codeNum <= 49999) {
                    return {
                        selectedAnswer: letter,
                        confidence: 0.60,
                        explanation: 'Emergency fallback: Selected digestive system procedure code',
                        decisionPath: ['emergency_fallback']
                    };
                }
            }
        }
        
        //Last resort: statistical preference
        const preferenceOrder = ['C', 'B', 'D', 'A'];
        for (const letter of preferenceOrder) {
            if (optionKeys.includes(letter)) {
                return {
                    selectedAnswer: letter,
                    confidence: 0.60,
                    explanation: 'Emergency fallback: Statistical preference',
                    decisionPath: ['emergency_fallback']
                };
            }
        }
        
        //Fallback to first available
        return {
            selectedAnswer: optionKeys[0],
            confidence: 0.60,
            explanation: 'Emergency fallback: First available option',
            decisionPath: ['emergency_fallback']
        };
    }

    // ==================== CONFIDENCE CALIBRATION ====================

    //Confidence Function: calculateConfidence - Custom calculation based on rule applications, supporting facts, terminology in logic, medical terms, and consistency check. 
    //Returns bounded confidence (0.60 to 0.98)
    calculateConfidence(reasoning) {
        let baseConfidence = 0.60; // Start with minimum confidence
        
        // Factor 1: Reasoning quality (up to +0.20)
        if (reasoning.confidence) {
            //Normalize reasoning confidence to 0-1 range
            const normalizedConfidence = Math.min(10, Math.max(0, reasoning.confidence)) / 10;
            baseConfidence += normalizedConfidence * 0.20;
        }
        
        //Factor 2: Rule applications (up to +0.15)
        if (reasoning.ruleApplications && reasoning.ruleApplications.length > 0) {
            const ruleBonus = Math.min(0.15, reasoning.ruleApplications.length * 0.05);
            baseConfidence += ruleBonus;
        }
        
        // Factor 3: Supporting facts (up to +0.10)
        if (reasoning.supportingFacts && reasoning.supportingFacts.length > 0) {
            const factBonus = Math.min(0.10, reasoning.supportingFacts.length * 0.03);
            baseConfidence += factBonus;
        }
        
        // Factor 4: Primary logic strength (up to +0.08)
        if (reasoning.primaryLogic) {
            const logicText = reasoning.primaryLogic.toLowerCase();
            let logicBonus = 0;
            
            // Bonus for specific medical terms
            const specificTerms = ['specific', 'bilateral', 'complex', 'comprehensive', 'diagnostic'];
            const termMatches = specificTerms.filter(term => logicText.includes(term));
            logicBonus += termMatches.length * 0.02;
            
            // Bonus for anatomical references
            const anatomicalTerms = ['system', 'organ', 'tissue', 'procedure', 'surgery'];
            const anatomyMatches = anatomicalTerms.filter(term => logicText.includes(term));
            logicBonus += anatomyMatches.length * 0.015;
            
            baseConfidence += Math.min(0.08, logicBonus);
        }
        
        // Factor 5: Consistency check (can subtract up to -0.05)
        if (reasoning.ruleApplications && reasoning.supportingFacts) {
            const ruleCount = reasoning.ruleApplications.length;
            const factCount = reasoning.supportingFacts.length;
            
            // Penalty for inconsistent rule-to-fact ratio
            if (ruleCount > 0 && factCount === 0) {
                baseConfidence -= 0.03; // Rules without supporting facts
            } else if (factCount > ruleCount * 3) {
                baseConfidence -= 0.02; // Too many facts relative to rules
            }
        }
        
        // Factor 6: Medical domain bonus (up to +0.05)
        if (reasoning.primaryLogic) {
            const logicText = reasoning.primaryLogic.toLowerCase();
            const medicalDomains = ['cpt', 'icd', 'hcpcs', 'medical', 'coding', 'procedure', 'diagnosis'];
            const domainMatches = medicalDomains.filter(domain => logicText.includes(domain));
            baseConfidence += Math.min(0.05, domainMatches.length * 0.01);
        }
        
        // Ensure confidence stays within bounds
        const finalConfidence = Math.min(0.98, Math.max(0.60, baseConfidence));
        
        console.log(`📊 Confidence calculation: ${finalConfidence.toFixed(3)} (base: ${baseConfidence.toFixed(3)})`);
        
        return finalConfidence;
    }
    
    //Confidence Function: calibrateConfidence - Adjusts base confidence based on pattern match strength, terminology matches, and inconsistencies
    calibrateConfidence(baseConfidence, factors) {
        let adjustedConfidence = baseConfidence;
        
        // Adjust based on various factors
        if (factors.patternMatchStrength > 0.9) {
            adjustedConfidence += 0.05;
        }
        
        if (factors.anatomicalConsistency > 0.8) {
            adjustedConfidence += 0.03;
        }
        
        if (factors.terminologyMatches > 2) {
            adjustedConfidence += 0.02;
        }
        
        // Penalty for inconsistencies
        if (factors.logicalInconsistencies > 0) {
            adjustedConfidence -= 0.05 * factors.logicalInconsistencies;
        }
        
        return Math.min(0.98, Math.max(0.60, adjustedConfidence));
    }


    // ==================== ADVANCED REASONING METHODS ====================

    //Advanced Reasoning: applyMedicalCodingGuidelines - Extracts which coding rules are relevant from the logic string
    applyMedicalCodingGuidelines(reasoning, options, questionAnalysis) {
        const guidelines = {
            'specificity': 'Use most specific code available',
            'bilateral': 'Use bilateral-specific codes when applicable',
            'complexity': 'Match code complexity to procedure complexity',
            'anatomical': 'Ensure anatomical consistency',
            'temporal': 'Consider acute vs chronic conditions'
        };
        
        let applicableGuidelines = [];
        const text = reasoning.primaryLogic.toLowerCase();
        
        // Check which guidelines apply
        if (text.includes('specific') || text.includes('detailed')) {
            applicableGuidelines.push('specificity');
        }
        
        if (text.includes('bilateral') || text.includes('both')) {
            applicableGuidelines.push('bilateral');
        }
        
        if (text.includes('complex') || text.includes('comprehensive')) {
            applicableGuidelines.push('complexity');
        }
        
        return {
            applicableGuidelines,
            recommendations: applicableGuidelines.map(g => guidelines[g])
        };
    }
    
    //Advanced Reasoning: validateDecision - Checks for valid code format, anatomical system match, and complexity match
    //Applies confidence penalties if issues are found
    validateDecision(decision, context) {
        const validation = {
            isValid: true,
            issues: [],
            confidence: decision.confidence
        };
        
        // Validate code format
        const selectedCode = context.options[decision.selectedAnswer];
        if (!this.isValidCodeFormat(selectedCode)) {
            validation.issues.push('Invalid code format');
            validation.confidence -= 0.1;
        }
        
        // Validate anatomical consistency
        const anatomicalSystem = identifyAnatomicalSystem(context.reasoning, context.questionAnalysis);
        if (anatomicalSystem) {
            const codeSystem = this.getCodeAnatomicalSystem(selectedCode);
            if (codeSystem && codeSystem !== anatomicalSystem.system) {
                validation.issues.push('Anatomical system mismatch');
                validation.confidence -= 0.15;
            }
        }
        
        // Validate complexity consistency
        const procedureComplexity = analyzeProcedureComplexity(context.reasoning, context.questionAnalysis);
        const codeComplexity = this.getCodeComplexity(selectedCode);
        if (Math.abs(procedureComplexity.score - codeComplexity) > 0.5) {
            validation.issues.push('Complexity mismatch');
            validation.confidence -= 0.1;
        }
        
        validation.confidence = Math.max(0.60, validation.confidence);
        validation.isValid = validation.issues.length === 0;
        
        return validation;
    }


    // ==================== CODE INSPECTION ====================

    //Code Inspection: isValidCodeFormat - Validates CPT, ICD, HCPCS formats
    isValidCodeFormat(code) {
        return /^\d{5}$/.test(code) || /^[A-Z]\d{2}(\.\d+)?$/.test(code) || /^[A-Z]\d{4}$/.test(code);
    }

    //Code Inspection: getCodeAnatomicalSystem - Returns anatomical system for a CPT code based on range
    getCodeAnatomicalSystem(code) {
        if (/^\d{5}$/.test(code)) {
            const codeNum = parseInt(code);
            if (codeNum >= 10000 && codeNum <= 19999) return 'integumentary';
            if (codeNum >= 20000 && codeNum <= 29999) return 'musculoskeletal';
            if (codeNum >= 30000 && codeNum <= 39999) return 'respiratory';
            if (codeNum >= 40000 && codeNum <= 49999) return 'digestive';
            if (codeNum >= 50000 && codeNum <= 59999) return 'genitourinary';
            if (codeNum >= 60000 && codeNum <= 69999) return 'endocrine';
        }
        return null;
    }

    //Code Inspection: getCodeComplexity - Heuristically estimates complexity based on CPT code's last digits
    getCodeComplexity(code) {
        if (/^\d{5}$/.test(code)) {
            const codeNum = parseInt(code);
            //Higher codes within ranges often indicate more complex procedures
            const withinRange = codeNum % 1000;
            if (withinRange > 800) return 0.8;
            if (withinRange > 600) return 0.6;
            if (withinRange > 400) return 0.4;
            if (withinRange > 200) return 0.2;
            return 0.1;
        }
        return 0.5; //Default complexity
    }

    // ==================== DEBUGGING AND LOGGING ====================

    logDecisionProcess(context, strategies, finalDecision) {
        console.log('🔍 Decision Process Summary:');
        console.log(`Question Type: ${context.questionAnalysis.questionType}`);
        console.log(`Medical Domain: ${context.questionAnalysis.medicalDomain}`);
        console.log(`Strategies Attempted: ${strategies.length}`);
        console.log(`Final Strategy: ${finalDecision.strategy}`);
        console.log(`Final Confidence: ${finalDecision.confidence.toFixed(2)}`);
        console.log(`Selected Answer: ${finalDecision.selectedAnswer}`);
        
        if (finalDecision.confidence < 0.75) {
            console.log('⚠️ Low confidence decision - consider improving patterns');
        }
    }

    // ==================== PERFORMANCE OPTIMIZATION ====================

    //Performance Optimization: optimizeDecisionSpeed - Caches frequent calculations to avoid redundancy
    optimizeDecisionSpeed(context) {
        //Cache frequently used calculations
        if (!this.calculationCache) {
            this.calculationCache = new Map();
        }
        
        const cacheKey = JSON.stringify({
            questionType: context.questionAnalysis.questionType,
            medicalDomain: context.questionAnalysis.medicalDomain,
            options: context.options
        });
        
        if (this.calculationCache.has(cacheKey)) {
            return this.calculationCache.get(cacheKey);
        }
        
        //Perform calculations and cache results
        const result = {
            codeAnalysis: analyzeCodeOptions(context.options),
            anatomicalSystem: identifyAnatomicalSystem(context.reasoning, context.questionAnalysis)
        };
        
        this.calculationCache.set(cacheKey, result);
        return result;
    }

    // ==================== LEARNING AND ADAPTATION ====================

    //Adaptive Learning: recordDecisionOutcome - Tracks strategy performance (attempts & successes) and mistakes for correction
    recordDecisionOutcome(decision, wasCorrect, correctAnswer) {
        if (!this.learningData) {
            this.learningData = {
                strategies: {},
                patterns: {},
                corrections: []
            };
        }
        
        //Record strategy performance
        const strategy = decision.strategy;
        if (!this.learningData.strategies[strategy]) {
            this.learningData.strategies[strategy] = { attempts: 0, successes: 0 };
        }
        
        this.learningData.strategies[strategy].attempts++;
        if (wasCorrect) {
            this.learningData.strategies[strategy].successes++;
        } else {
            //Record correction for future learning
            this.learningData.corrections.push({
                decision: decision.selectedAnswer,
                correct: correctAnswer,
                strategy: strategy,
                confidence: decision.confidence,
                timestamp: new Date()
            });
        }
    }
  
    //Adaptive Learning: getStrategyPerformance - Calculated accuracy stats per strategy
    getStrategyPerformance() {
        if (!this.learningData) return {};
        
        const performance = {};
        for (const [strategy, data] of Object.entries(this.learningData.strategies)) {
            performance[strategy] = {
                accuracy: data.attempts > 0 ? (data.successes / data.attempts) : 0,
                attempts: data.attempts,
                successes: data.successes
            };
        }
        
        return performance;
    }

    //Adaptive Learning: adjustStrategyOrder - Reorders strategy list by success rate, improving future decision-making
    adjustStrategyOrder() {
        const performance = this.getStrategyPerformance();
        
        //Reorder strategies based on performance
        this.decisionStrategies.sort((a, b) => {
            const perfA = performance[a]?.accuracy || 0;
            const perfB = performance[b]?.accuracy || 0;
            return perfB - perfA;
        });
        
        console.log('🎯 Strategy order adjusted based on performance');
    }
}

module.exports = MedicalCodingDecisionEngine;