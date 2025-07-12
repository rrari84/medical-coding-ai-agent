    //Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
    // Strategy 1: Exact Pattern Match (Highest Priority)
    module.exports = async function exactPatternMatch(context, helpers) {
        if (!context.patternMatch) return null;
        
        const { patternMatch, options } = context;
        const { findMatchingOption } = helpers;
        
        // High confidence pattern match - USE IT!
        if (patternMatch.confidence >= 0.85) {
            // Check if the pattern match answer exists in options
            const targetAnswer = patternMatch.answer;
            
            if (options[targetAnswer]) {
                console.log(`🎯 Exact pattern match using answer: ${targetAnswer}`);
                return {
                    selectedAnswer: targetAnswer,
                    confidence: Math.min(0.96, patternMatch.confidence + 0.01),
                    reasoning: `High-confidence pattern match: ${patternMatch.reasoning}`,
                    strategy: 'exactPatternMatch'
                };
            }
            
            // If pattern has a preferred code, find matching option
            if (patternMatch.preferredCode) {
                const matchingOption = findMatchingOption(patternMatch.preferredCode, options);
                if (matchingOption) {
                    console.log(`🎯 Exact pattern match using code: ${patternMatch.preferredCode} -> ${matchingOption}`);
                    return {
                        selectedAnswer: matchingOption,
                        confidence: Math.min(0.96, patternMatch.confidence + 0.01),
                        reasoning: `High-confidence pattern match: ${patternMatch.reasoning}`,
                        strategy: 'exactPatternMatch'
                    };
                }
            }
        }
        
        return null;
    }