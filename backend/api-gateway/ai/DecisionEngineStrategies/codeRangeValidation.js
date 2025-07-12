    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 6: Code Range Validation
    module.exports = async function codeRangeValidation(context, helpers) {
        try {
            const { reasoning, options, questionAnalysis, codeAnalysis } = context;
            const { validateCodeRanges, selectByValidation } = helpers;
            
            // FIXED: Check if we have valid codeAnalysis before proceeding
            if (!codeAnalysis || !codeAnalysis.codeTypes) {
                console.log('Code range validation skipped: No code analysis available');
                return null;
            }
            
            // Validate codes against expected ranges
            const validationResult = validateCodeRanges(reasoning, codeAnalysis, questionAnalysis);
            
            if (validationResult.confidence >= 0.70) {
                const selectedAnswer = selectByValidation(validationResult, options);
                
                if (selectedAnswer) {
                    return {
                        selectedAnswer,
                        confidence: validationResult.confidence,
                        reasoning: `Code range validation: ${validationResult.explanation}`,
                        strategy: 'codeRangeValidation'
                    };
                }
            }
            
            return null;
        } catch (error) {
            console.log('Code range validation failed safely:', error.message);
            return null;
        }
    }