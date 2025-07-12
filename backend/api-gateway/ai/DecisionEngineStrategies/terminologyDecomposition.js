    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 5: Terminology Decomposition
    module.export = async function terminologyDecomposition(context, helpers) {
        const { reasoning, options, questionAnalysis } = context;
        const { decomposeTerminology, selectByTerminology } = helpers;
        
        const termAnalysis = decomposeTerminology(reasoning, questionAnalysis);
        
        if (termAnalysis.confidence >= 0.70) {
            const selectedAnswer = selectByTerminology(termAnalysis, options);
            
            if (selectedAnswer) {
                return {
                    selectedAnswer,
                    confidence: termAnalysis.confidence,
                    reasoning: `Terminology decomposition: ${termAnalysis.explanation}`,
                    strategy: 'terminologyDecomposition'
                };
            }
        }
        
        return null;
    }