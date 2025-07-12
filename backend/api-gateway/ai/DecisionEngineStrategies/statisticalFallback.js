    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 8: Statistical Fallback
    module.exports = async function statisticalFallback(context, helpers) {
        const { options, questionAnalysis } = context;
        const { getStatisticalChoice } = helpers;
        
        // Use statistical patterns based on question type
        const statisticalChoice = getStatisticalChoice(questionAnalysis, options);
        
        return {
            selectedAnswer: statisticalChoice.answer,
            confidence: 0.60,
            reasoning: `Statistical fallback: ${statisticalChoice.explanation}`,
            strategy: 'statisticalFallback'
        };
    }