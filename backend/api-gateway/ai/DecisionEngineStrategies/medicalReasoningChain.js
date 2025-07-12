    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 2: Medical Reasoning Chain
    module.exports = async function medicalReasoningChain(context, helpers) {
        const { reasoning, options, questionAnalysis } = context;
        const { buildReasoningChain, selectByMedicalLogic } = helpers;
        
        // Build medical reasoning chain
        const reasoningChain = this.buildReasoningChain(reasoning, questionAnalysis);
        
        if (reasoningChain.strength >= 0.80) {
            const selectedAnswer = selectByMedicalLogic(reasoningChain, options);
            
            if (selectedAnswer) {
                return {
                    selectedAnswer,
                    confidence: reasoningChain.strength,
                    reasoning: `Medical reasoning chain: ${reasoningChain.explanation}`,
                    strategy: 'medicalReasoningChain'
                };
            }
        }
        
        return null;
    }