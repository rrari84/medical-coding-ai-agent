const findBestPattern = require('../ai/PatternMatcher');
const OpenAIClient = require('../ai/callOpenAIClient');
const extractMedicalKeywords = require('../utils/KeywordExtractor');
const {
    extractAllResponseData,
    extractAnswer,
    extractConfidence,
    extractReasoning
} = require('../utils/responseParser');

//IMPORTANT: This is my last presaved streamline service before I switched to MedicalCodingService2
//This file used pattern-matching first(via medical patterns as my knowledge base),
//with Open AI fallback if there is no confident pattern found


class MedicalCodingService {
    constructor() {
        this.openaiClient = new OpenAIClient();
        this.knowledgeBase = this.initializeKnowledgeBase();
    }

    initializeKnowledgeBase() {
        const initializeKnowledgeBase = require('../knowledge/MedicalPatterns');
        return initializeKnowledgeBase();
    }

    async answerQuestion(question, options) {
        const startTime = Date.now();
    
        try {
            if (!question || typeof question !== 'string') {
                throw new Error('Invalid question text provided');
            }
      
            if (!options || typeof options !== 'object') {
                throw new Error('Invalid options provided');
            }

            const patternMatch = findBestPattern(question, options);
            if (patternMatch) {
                return {
                    answer: patternMatch.answer,
                    confidence: patternMatch.confidence,
                    reasoning: patternMatch.reasoning,
                    context: {
                        keywords: extractMedicalKeywords(question),
                        relevantCodes: 1,
                        patterns: 1,
                        relationships: 0
                    },
                    processingTime: Date.now() - startTime
                };
            }

            if (this.openaiClient.openai) {
                try {
                    const response = await this.openaiClient.callOpenAI(question, options);
                    return {
                        answer: extractAnswer(response),
                        confidence: extractConfidence(response),
                        reasoning: extractReasoning(response),
                        context: {
                            keywords: extractMedicalKeywords(question),
                            relevantCodes: 0,
                            patterns: 0,
                            relationships: 0
                        },
                        processingTime: Date.now() - startTime
                    };
                } catch (openaiError) {
                    console.log('OpenAI failed, using fallback:', openaiError.message);
                }
            }

            return {
                answer: 'A',
                confidence: 0.60,
                reasoning: 'Using fallback analysis.',
                context: {
                    keywords: extractMedicalKeywords(question),
                    relevantCodes: 0,
                    patterns: 0,
                    relationships: 0
                },
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            console.error('Answer question error:', error);
            return {
                answer: 'A',
                confidence: 0.5,
                reasoning: `Error: ${error.message}`,
                context: { keywords: [], relevantCodes: 0, patterns: 0, relationships: 0 },
                processingTime: Date.now() - startTime
            };
        }
    }
}

module.exports = MedicalCodingService;