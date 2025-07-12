    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 4: Procedure Complexity Analysis
    module.exports = async function procedureComplexityAnalysis(context, helpers) {
        const { reasoning, options, questionAnalysis } = context;
        const { analyzeProcedureComplexity, selectByComplexity } = helpers;
        
        const complexityAnalysis = analyzeProcedureComplexity(reasoning, questionAnalysis);
        
        if (complexityAnalysis.confidence >= 0.70) {
            const selectedAnswer = selectByComplexity(complexityAnalysis, options);
            
            if (selectedAnswer) {
                return {
                    selectedAnswer,
                    confidence: complexityAnalysis.confidence,
                    reasoning: `Procedure complexity analysis: ${complexityAnalysis.explanation}`,
                    strategy: 'procedureComplexityAnalysis'
                };
            }
        }
        
        return null;
    }