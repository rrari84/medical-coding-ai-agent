    //This module contains a set of helper functions for advanced reasoning in medical coding, 
    //especially useful for CPT/ICD-10 questions
    //It supports logic around: complexity scoring, anatomical system alignment, medical terminology recognition, and code selection logic
    
    function assessComplexity(text) {
        let complexity = 1;
        if (text.includes('complex') || text.includes('comprehensive')) complexity += 2;
        if (text.includes('bilateral') || text.includes('multiple')) complexity += 1;
        if (text.includes('emergency') || text.includes('trauma')) complexity += 1;
        return Math.min(5, complexity);
    }

    function checkMedicalLogic(reasoning, questionAnalysis) {
        let score = 0;
        let explanation = '';
        
        //Check for logical consistency
        const text = reasoning.primaryLogic.toLowerCase();
        
        //Positive indicators
        if (text.includes('specific') && questionAnalysis.complexity > 2) {
            score += 0.1;
            explanation += 'Complex procedure requires specific code. ';
        }
        
        if (text.includes('bilateral') && text.includes('knee')) {
            score += 0.15;
            explanation += 'Bilateral procedure logic consistent. ';
        }
        
        //Negative indicators
        if (text.includes('simple') && questionAnalysis.complexity > 3) {
            score -= 0.1;
            explanation += 'Simple procedure inconsistent with complexity. ';
        }
        
        return {
            score: Math.max(-0.2, Math.min(0.3, score)),
            explanation: explanation.trim()
        };
    }

    function buildReasoningChain(reasoning, questionAnalysis) {
        let strength = 0.5;
        let explanation = '';
        
        //Analyze reasoning quality
        if (reasoning.ruleApplications && reasoning.ruleApplications.length > 0) {
            strength += 0.1 * reasoning.ruleApplications.length;
            explanation += `Applied ${reasoning.ruleApplications.length} coding rules. `;
        }
        
        if (reasoning.supportingFacts && reasoning.supportingFacts.length > 0) {
            strength += 0.05 * reasoning.supportingFacts.length;
            explanation += `Found ${reasoning.supportingFacts.length} supporting facts. `;
        }
        
        //Check for medical logic consistency
        const logicConsistency = this.checkMedicalLogic(reasoning, questionAnalysis);
        strength += logicConsistency.score;
        explanation += logicConsistency.explanation;
        
        return {
            strength: Math.min(0.95, strength),
            explanation: explanation.trim()
        };
    }

    function identifyAnatomicalSystem(reasoning, questionAnalysis) {
        const text = (reasoning.primaryLogic + ' ' + reasoning.supportingFacts.join(' ')).toLowerCase();
        
        //Check for anatomical system keywords
        const anatomicalSystems = {
            'integumentary': ['skin', 'lesion', 'rash', 'biopsy', 'excision', 'incision', 'drainage'],
            'musculoskeletal': ['bone', 'joint', 'muscle', 'fracture', 'arthritis', 'hematoma'],
            'cardiovascular': ['heart', 'blood', 'artery', 'vein', 'cardiac', 'circulation'],
            'respiratory': ['lung', 'breathing', 'airway', 'sinus', 'nasal', 'chest'],
            'digestive': ['stomach', 'intestine', 'liver', 'mouth', 'oral', 'gastro'],
            'genitourinary': ['kidney', 'bladder', 'urine', 'renal', 'urinary'],
            'nervous': ['brain', 'nerve', 'neurologic', 'headache', 'migraine'],
            'endocrine': ['thyroid', 'diabetes', 'hormone', 'gland', 'insulin'],
            'reproductive': ['pregnancy', 'obstetric', 'gynecologic', 'prostate']
        };
        
        for (const [system, keywords] of Object.entries(anatomicalSystems)) {
            const matches = keywords.filter(keyword => text.includes(keyword));
            if (matches.length >= 2) {
                return { system, matches, confidence: matches.length * 0.2 };
            }
        }
        
        return null;
    }

    function matchToAnatomicalSystem(anatomicalSystem, options) {
        if (!this.knowledgeBase || !this.knowledgeBase.cptCodeRanges) {
            return null;
        }
        
        const systemMappings = {
            'integumentary': ['10000-19999'],
            'musculoskeletal': ['20000-29999'],
            'respiratory': ['30000-39999'],
            'digestive': ['40000-49999'],
            'genitourinary': ['50000-59999'],
            'endocrine': ['60000-69999'],
            'cardiovascular': ['90000-99999'],
            'nervous': ['90000-99999']
        };
        
        const expectedRanges = systemMappings[anatomicalSystem.system];
        if (!expectedRanges) return null;
        
        for (const [letter, code] of Object.entries(options)) {
            if (/^\d{5}$/.test(code)) {
                const codeNum = parseInt(code);
                for (const range of expectedRanges) {
                    const [start, end] = range.split('-').map(n => parseInt(n));
                    if (codeNum >= start && codeNum <= end) {
                        return {
                            answer: letter,
                            confidence: 0.80,
                            explanation: `Code ${code} matches ${anatomicalSystem.system} system (${range})`
                        };
                    }
                }
            }
        }
        
        return null;
    }

    function analyzeProcedureComplexity(reasoning, questionAnalysis) {
        const text = (reasoning.primaryLogic + ' ' + reasoning.supportingFacts.join(' ')).toLowerCase();
        
        let complexityScore = 0;
        let explanation = '';
        
        //Simple indicators
        if (text.includes('simple') || text.includes('basic') || text.includes('routine')) {
            complexityScore -= 0.3;
            explanation += 'Simple procedure indicators found. ';
        }
        
        //Complex indicators
        if (text.includes('complex') || text.includes('comprehensive') || text.includes('extensive')) {
            complexityScore += 0.3;
            explanation += 'Complex procedure indicators found. ';
        }
        
        //Bilateral indicators
        if (text.includes('bilateral') || text.includes('both')) {
            complexityScore += 0.2;
            explanation += 'Bilateral procedure. ';
        }
        
        //Emergency indicators
        if (text.includes('emergency') || text.includes('urgent') || text.includes('trauma')) {
            complexityScore += 0.2;
            explanation += 'Emergency/urgent procedure. ';
        }
        
        return {
            score: complexityScore,
            confidence: Math.min(0.90, 0.70 + Math.abs(complexityScore)),
            explanation: explanation.trim()
        };
    }

    function selectByComplexity(complexityAnalysis, options) {
        const optionEntries = Object.entries(options);
        
        if (complexityAnalysis.score > 0.2) {
            //Choose more complex/higher codes
            const sortedOptions = optionEntries.sort((a, b) => {
                const aNum = parseInt(a[1]) || 0;
                const bNum = parseInt(b[1]) || 0;
                return bNum - aNum;
            });
            return sortedOptions[0][0];
        } else if (complexityAnalysis.score < -0.2) {
            //Choose simpler/lower codes
            const sortedOptions = optionEntries.sort((a, b) => {
                const aNum = parseInt(a[1]) || 0;
                const bNum = parseInt(b[1]) || 0;
                return aNum - bNum;
            });
            return sortedOptions[0][0];
        }
        
        return null;
    }

    function decomposeTerminology(reasoning, questionAnalysis) {
        if (!this.knowledgeBase || !this.knowledgeBase.medicalTerminology) {
            return { confidence: 0 };
        }
        
        const text = (reasoning.primaryLogic + ' ' + reasoning.supportingFacts.join(' ')).toLowerCase();
        const terminology = this.knowledgeBase.medicalTerminology;
        
        let matches = [];
        let confidence = 0;
        
        //Check for prefix matches
        for (const [prefix, meaning] of Object.entries(terminology.prefixes)) {
            if (text.includes(prefix.replace('-', ''))) {
                matches.push({ type: 'prefix', term: prefix, meaning });
                confidence += 0.1;
            }
        }
        
        //Check for suffix matches
        for (const [suffix, meaning] of Object.entries(terminology.suffixes)) {
            if (text.includes(suffix.replace('-', ''))) {
                matches.push({ type: 'suffix', term: suffix, meaning });
                confidence += 0.1;
            }
        }
        
        //Check for root matches
        for (const [root, meaning] of Object.entries(terminology.roots)) {
            if (text.includes(root.replace('/o', ''))) {
                matches.push({ type: 'root', term: root, meaning });
                confidence += 0.15;
            }
        }
        
        return {
            matches,
            confidence: Math.min(0.90, confidence),
            explanation: `Found ${matches.length} terminology matches: ${matches.map(m => `${m.term}=${m.meaning}`).join(', ')}`
        };
    }

    function selectByTerminology(termAnalysis, options) {
            if (!termAnalysis || !termAnalysis.matches || termAnalysis.matches.length === 0) {
        return Object.keys(options)[0]; // Fallback
    }

    const scores = {};

    //Go through each option and score it based on terminology matches
    for (const [letter, code] of Object.entries(options)) {
        const codeText = code.toLowerCase(); //code may contain hints
        scores[letter] = 0;

        for (const match of termAnalysis.matches) {
            const matchTerm = match.term.toLowerCase();
            const matchMeaning = match.meaning.toLowerCase();

            if (codeText.includes(matchTerm)) {
                scores[letter] += 1.5; //term is directly in code (e.g. "osteo" in description)
            } else if (codeText.includes(matchMeaning)) {
                scores[letter] += 1.0; //semantic match
            }
        }
    }

    //Sort by score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted[0][1] > 0) {
        return sorted[0][0]; //return top match
    }

    return Object.keys(options)[0]; //fallback
    }

module.exports = {
    assessComplexity,
    buildReasoningChain,
    identifyAnatomicalSystem,
    matchToAnatomicalSystem,
    analyzeProcedureComplexity,
    selectByComplexity,
    decomposeTerminology,
    selectByTerminology, 
    checkMedicalLogic
};