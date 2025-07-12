
//Strategy module that MedicalCodingDecisionEngine loops through to try different strategies
//Strategy 3: Anatomical System Matching
module.exports = async function anatomicalSystemMatching(context, helpers) {
        const { reasoning, options, questionAnalysis } = context;
        const { identifyAnatomicalSystem, matchToAnatomicalSystem } = helpers;

        
        //Identify anatomical system
        const anatomicalSystem = identifyAnatomicalSystem(reasoning, questionAnalysis);
        
        if (anatomicalSystem) {
            const systemMatch = matchToAnatomicalSystem(anatomicalSystem, options);
            
            if (systemMatch && systemMatch.confidence >= 0.75) {
                return {
                    selectedAnswer: systemMatch.answer,
                    confidence: systemMatch.confidence,
                    reasoning: `Anatomical system matching: ${systemMatch.explanation}`,
                    strategy: 'anatomicalSystemMatching'
                };
            }
        }
        
        return null;
    }

 