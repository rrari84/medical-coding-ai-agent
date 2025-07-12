const CustomMedicalCodingAgent = require('../services/CustomMedicalCodingAgent');
const OpenAIClient = require('../ai/callOpenAIClient');
const findBestPattern = require('../ai/PatternMatcher');
const extractMedicalKeywords = require('../utils/KeywordExtractor');
const {
    extractAllResponseData,
    extractAnswer,
    extractConfidence,
    extractReasoning
} = require('../utils/responseParser');
const { isCancel } = require('axios');

    // ==================== PURPOSE ====================

//I leveled up the Original MedicalCodingService into MedicalCodingService2,
//Now, this file is an advanced, multi-agent, decision-quality medical coding engine with
//self-evaluation, fallback logic, and performance tracking.
//****It layers decision-making from my combination custom ai agent, pattern rules, and GPT-4o
//while also benchmarking them against each other for comparison

//Technically, this is a hybrid reasoning engine designed to utilize my custom agent (rule + LLM + logic),
//pattern-matcher(back-up with curated symbolic knowledge), and Openai which was Prompt-engineered and optimized for this exam (LLM fallback for natual language reasoning),
//Additionally, added a comparison mode to compare every single agent.

//The ai-only agent which is suppoused to be made for this take-home, would be considered the
//gpt-4o wrapper agent (which originally gave 68/100 score and I prompt engineered to bring up to a 93/100)


class MedicalCodingService2 {
    constructor() {
        //Existing components
        this.openaiClient = new OpenAIClient();
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        //Add custom agent -> most-advanced engine (combines everything)
        this.customAgent = new CustomMedicalCodingAgent();
        this.useCustomAgent = true; //Flag to enable/disable custom agent
        
        //Performance comparison tracking -> tracks OpenAI vs. pattern vs. custom decision performance
        this.comparisonMetrics = {
            openai_results: [],
            custom_results: [],
            agreement_rate: 0,
            performance_comparison: {}
        };
    }

    //This is bootstrapping my CustomMedicalCodingAgent
    //This is useful if it loads the ML models, cached rules, or GPT client
    async initialize() {
        await this.customAgent.initialize();
        console.log('Enhanced Medical Coding Service initialized with custom agent');
    }

    //This is the primary method used for live coding decisions. 
    async answerQuestion(question, options) {
        const startTime = Date.now();
        
        //Heres Logic breakdown:
        try {
            //1.Validate inputs
            if (!question || typeof question !== 'string') {
                throw new Error('Invalid question text provided');
            }
            if (!options || typeof options !== 'object') {
                throw new Error('Invalid options provided');
            }

            const questionData = { question, options };
            
            //2.Try custom agent first if enabled
            if (this.useCustomAgent) {
                try {
                    const customResult = await this.customAgent.processQuestion(questionData);
                    
                    //If high confidence (>= 0.85), return custom result 
                    if (customResult.confidence >= 0.85) {
                        return {
                            answer: customResult.answer,
                            confidence: customResult.confidence,
                            reasoning: customResult.reasoning,
                            source: 'custom_agent',
                            context: {
                                keywords: customResult.concepts,
                                category: customResult.category,
                                processingTime: customResult.processingTime
                            },
                            processingTime: Date.now() - startTime
                        };
                    }
                    
                    // If medium confidence (>= 0.7), get second opinion from patterns or OpenAI
                    if (customResult.confidence >= 0.7) {
                        const patternMatch = findBestPattern(question, options);
                        if (patternMatch && patternMatch.confidence >= 0.85) {
                            //Compare results
                            if (customResult.answer === patternMatch.answer) {
                                return {
                                    answer: customResult.answer,
                                    confidence: Math.max(customResult.confidence, patternMatch.confidence),
                                    reasoning: `Custom agent and pattern matching agree: ${customResult.reasoning}`,
                                    source: 'custom_agent_confirmed',
                                    context: {
                                        keywords: customResult.concepts,
                                        category: customResult.category,
                                        agreement: 'pattern_match'
                                    },
                                    processingTime: Date.now() - startTime
                                };
                            }
                        }
                    }
                    
                    // Store custom result for comparison
                    this.comparisonMetrics.custom_results.push(customResult);
                    
                } catch (customError) {
                    console.log('Custom agent failed, falling back:', customError.message);
                }
            }

            //3.Fallback to existing pattern matching
            const patternMatch = findBestPattern(question, options);
            if (patternMatch) {
                return {
                    answer: patternMatch.answer,
                    confidence: patternMatch.confidence,
                    reasoning: patternMatch.reasoning,
                    source: 'pattern_matching',
                    context: {
                        keywords: extractMedicalKeywords(question),
                        relevantCodes: 1,
                        patterns: 1
                    },
                    processingTime: Date.now() - startTime
                };
            }

            //4.Fallback to OpenAI
            if (this.openaiClient.openai) {
                try {
                    const response = await this.openaiClient.callOpenAI(question, options);
                    const openaiResult = {
                        answer: extractAnswer(response),
                        confidence: extractConfidence(response),
                        reasoning: extractReasoning(response),
                        source: 'openai'
                    };
                    
                    //Store OpenAI result for comparison, for later benchmarking
                    this.comparisonMetrics.openai_results.push(openaiResult);
                    
                    return {
                        answer: openaiResult.answer,
                        confidence: openaiResult.confidence,
                        reasoning: openaiResult.reasoning,
                        source: 'openai',
                        context: {
                            keywords: extractMedicalKeywords(question),
                            model_used: 'gpt-4'
                        },
                        processingTime: Date.now() - startTime
                    };
                } catch (openaiError) {
                    console.log('OpenAI failed, using fallback:', openaiError.message);
                }
            }

            //5. Final fallback -> default to A, low risk and will still generate a answer to give
            return {
                answer: 'A',
                confidence: 0.60,
                reasoning: 'Using fallback analysis - no high-confidence method available.',
                source: 'fallback',
                context: {
                    keywords: extractMedicalKeywords(question)
                },
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            console.error('Answer question error:', error);
            return {
                answer: 'A',
                confidence: 0.5,
                reasoning: `Error: ${error.message}`,
                source: 'error_fallback',
                context: {},
                processingTime: Date.now() - startTime
            };
        }
    }

    //This method runs a full side-by-side evaluation of all 3 agents
    async runComparisonTest(questions) {
        console.log('🔬 Running Custom Agent vs OpenAI Comparison Test...');
        
        const results = {
            total_questions: questions.length,
            custom_agent_results: [],
            openai_results: [],
            pattern_results: [],
            agreement_analysis: {},
            performance_metrics: {}
        };

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            console.log(`Processing question ${i + 1}/${questions.length}`);

            const correctAnswer = question.correct || question.correctAnswer || question.answer;

            //Test custom agent
            try {
                const customResult = await this.customAgent.processQuestion({
                    question: question.text || question.question,
                    options: question.options
                });

                results.custom_agent_results.push({
                    ...customResult,
                    correctAnswer: correctAnswer,
                    isCorrect: customResult.answer === correctAnswer,
                    questionId: question.id || i + 1
                });
            } catch (error) {
                console.log(`Custom agent failed on question ${i + 1}:`, error.message);

                results.custom_agent_results.push({
                    answer:'ERROR',
                    correctAnswer: correctAnswer,
                    isCorrect: false,
                    confidence: 0,
                    reasoning: 'Error: ${error.message}',
                    questionId: question.id || i + 1
                });
            }

            //Test pattern matching
            const patternResult = findBestPattern(question.text || question.question, question.options);
            if (patternResult) {
                 results.pattern_results.push({
                    ...patternResult,
                    correctAnswer: correctAnswer,
                    isCorrect: patternResult.answer === correctAnswer,
                    questionId: question.id || i + 1
                });
            } else {
                //Fallback pattern result
                results.pattern_results.push({
                    answer: 'A', //Default fallback
                    correctAnswer: correctAnswer,
                    isCorrect: 'A' === correctAnswer,
                    confidence: 0.5,
                    reasoning: 'No pattern match found',
                    questionId: question.id || i + 1
                });
            }

            //Test OpenAI (if available)
            if (this.openaiClient.openai) {
                try {
                    const openaiResponse = await this.openaiClient.callOpenAI(
                        question.text || question.question, 
                        question.options
                    );
                    const openaiResult = {
                        answer: extractAnswer(openaiResponse),
                        confidence: extractConfidence(openaiResponse),
                        reasoning: extractReasoning(openaiResponse),
                        correctAnswer: correctAnswer,
                        isCorrect: extractAnswer(openaiResponse) === correctAnswer,
                        questionId: question.id || i + 1
                    };
                    results.openai_results.push(openaiResult);
                } catch (error) {
                    console.log(`OpenAI failed on question ${i + 1}:`, error.message);

                    results.openai_results.push({
                        answer: 'ERROR',
                        correctAnswer: correctAnswer,
                        isCorrect: false,
                        confidence: 0,
                        reasoning: `Error: ${error.message}`,
                        questionId: question.id || i + 1
                    });
                }
            }
        }

        //Analyze agreement and performance -> allows for full comparison and graphing later of stored results
        results.agreement_analysis = this.analyzeAgreement(results);
        results.performance_metrics = this.calculatePerformanceMetrics(results);

        return results;
    }

    //This basically counts how often Custom == Openai == Pattern
    //Basically whether any of them agree with each other on results and then will return as a percentage
    analyzeAgreement(results) {
        const analysis = {
            custom_vs_openai: 0,
            custom_vs_pattern: 0,
            openai_vs_pattern: 0,
            three_way_agreement: 0
        };

        const minLength = Math.min(
            results.custom_agent_results.length,
            results.openai_results.length,
            results.pattern_results.length
        );

        for (let i = 0; i < minLength; i++) {
            const customAnswer = results.custom_agent_results[i]?.answer;
            const openaiAnswer = results.openai_results[i]?.answer;
            const patternAnswer = results.pattern_results[i]?.answer;

            if (customAnswer === openaiAnswer) analysis.custom_vs_openai++;
            if (customAnswer === patternAnswer) analysis.custom_vs_pattern++;
            if (openaiAnswer === patternAnswer) analysis.openai_vs_pattern++;
            if (customAnswer === openaiAnswer && openaiAnswer === patternAnswer) {
                analysis.three_way_agreement++;
            }
        }

        //Convert to percentages
        Object.keys(analysis).forEach(key => {
            analysis[key] = ((analysis[key] / minLength) * 100).toFixed(1) + '%';
        });

        return analysis;
    } //This is so fire for my evaluation between agent alignment and trustworthiness

    //This will return structured metrics -> which is super useful for the dashboard charts
    calculatePerformanceMetrics(results) {
        return {
            custom_agent: {
                average_confidence: this.calculateAverageConfidence(results.custom_agent_results),
                average_processing_time: this.calculateAverageTime(results.custom_agent_results),
                total_processed: results.custom_agent_results.length
            },
            openai: {
                average_confidence: this.calculateAverageConfidence(results.openai_results),
                total_processed: results.openai_results.length
            },
            pattern_matching: {
                average_confidence: this.calculateAverageConfidence(results.pattern_results),
                total_processed: results.pattern_results.length
            }
        };
    }

    //Helper methods just to help to calculate numeric stats over results array
    calculateAverageConfidence(results) {
        if (results.length === 0) return 0;
        const sum = results.reduce((acc, result) => acc + (result.confidence || 0), 0);
        return (sum / results.length).toFixed(3);
    }

    calculateAverageTime(results) {
        if (results.length === 0) return 0;
        const sum = results.reduce((acc, result) => acc + (result.processingTime || 0), 0);
        return Math.round(sum / results.length);
    }

    initializeKnowledgeBase() {
        const initializeKnowledgeBase = require('../knowledge/MedicalPatterns');
        return initializeKnowledgeBase();
    }
}

module.exports = { 
    MedicalCodingService2
};