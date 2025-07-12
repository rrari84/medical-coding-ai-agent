//This module is part of my MedicalCodingDecisionEngine. It implements utility strategies for:
//*Validating code options using expected coding ranges
//*Eliminating incorrect options
//*Breaking ties using heuristics
//*Choosing answers statistically when logic fails

//These functions are especially useful when my primary agent is returning multiple possible answers
//Or applying a structured fallback reasoning


const { assessComplexity,
    buildReasoningChain,
    identifyAnatomicalSystem,
    matchToAnatomicalSystem,
    analyzeProcedureComplexity,
    selectByComplexity,
    decomposeTerminology,
    selectByTerminology,
    checkMedicalLogic } = require('./complexityTerminologyBuildUtils');
const {
    getCPTRange,
    getICD10Range,
    getHCPCSRange,
    getExpectedCPTRanges
} = require('./getRanges');
    
    function validateCodeRanges(reasoning, codeAnalysis, questionAnalysis) {
        let validCodes = [];
        let explanation = '';
        
        try {
            //Check if we have valid inputs
            if (!codeAnalysis || !codeAnalysis.codeTypes || !reasoning) {
                return {
                    validCodes: [],
                    confidence: 0,
                    explanation: 'Insufficient data for code range validation'
                };
            }
            
            //Check if codes are in expected ranges for the question type
            if (questionAnalysis.questionType === 'CPT' && questionAnalysis.medicalDomain) {
                const expectedRanges = getExpectedCPTRanges(questionAnalysis.medicalDomain);
                
                for (const [letter, codeType] of Object.entries(codeAnalysis.codeTypes)) {
                    if (codeType === 'CPT' && codeAnalysis.codeRanges && codeAnalysis.codeRanges[letter]) {
                        const range = codeAnalysis.codeRanges[letter];
                        const inRange = expectedRanges.some(expectedRange => 
                            range.includes(expectedRange.split('-')[0]) || 
                            expectedRange.includes(range)
                        );
                        
                        if (inRange) {
                            validCodes.push(letter);
                        }
                    }
                }
            }
            
            return {
                validCodes,
                confidence: validCodes.length > 0 ? 0.75 : 0,
                explanation: `Validated ${validCodes.length} codes in expected ranges`
            };
        } catch (error) {
            console.log('Code range validation error:', error.message);
            return {
                validCodes: [],
                confidence: 0,
                explanation: 'Error in code range validation'
            };
        }
    }

    function selectByValidation(validationResult, options) {
        if (validationResult.validCodes.length === 1) {
            return validationResult.validCodes[0];
        } else if (validationResult.validCodes.length > 1) {
            // Apply additional logic to choose between valid codes
            return validationResult.validCodes[0];
        }
        return null;
    }

    function eliminateIncorrectOptions(reasoning, options, questionAnalysis) {
        const remainingOptions = [...Object.keys(options)];
        const eliminationReasons = [];
        
        // Eliminate based on code type mismatch
        if (questionAnalysis.questionType === 'CPT') {
            const nonCPTOptions = remainingOptions.filter(letter => {
                const code = options[letter];
                return !/^\d{5}$/.test(code);
            });
            
            nonCPTOptions.forEach(letter => {
                const index = remainingOptions.indexOf(letter);
                if (index > -1) {
                    remainingOptions.splice(index, 1);
                    eliminationReasons.push(`Eliminated ${letter}: Not CPT format`);
                }
            });
        }
        
        //Eliminate based on anatomical system mismatch
        const anatomicalSystem = identifyAnatomicalSystem(reasoning, questionAnalysis);
        if (anatomicalSystem) {
            //Add elimination logic based on anatomical system
        }
        
        return {
            remainingOptions,
            eliminationReasons,
            explanation: eliminationReasons.join('; ')
        };
    }

    function applyTiebreaker(remainingOptions, options, reasoning) {
        //Apply various tiebreaker rules
        
        //Rule 1: Prefer more specific codes (higher numbers in same range)
        const codes = remainingOptions.map(letter => ({
            letter,
            code: options[letter],
            numeric: parseInt(options[letter]) || 0
        }));
        
        codes.sort((a, b) => b.numeric - a.numeric);
        
        return {
            answer: codes[0].letter,
            explanation: `Chose more specific code: ${codes[0].code}`
        };
    }

    function getStatisticalChoice(questionAnalysis, options) {
        //Statistical patterns based on question type
        const optionKeys = Object.keys(options);
        
        if (questionAnalysis.questionType === 'CPT') {
            //For CPT questions, prefer options that are actual CPT codes
            const cptOptions = optionKeys.filter(key => {
                const value = options[key];
                return /^\d{5}$/.test(value);
            });
            
            if (cptOptions.length > 0) {
                //Among CPT codes, prefer middle range options
                const preferenceOrder = ['B', 'C', 'A', 'D'];
                for (const letter of preferenceOrder) {
                    if (cptOptions.includes(letter)) {
                        return { answer: letter, explanation: 'CPT statistical preference' };
                    }
                }
            }
        }
        
        if (questionAnalysis.questionType === 'ICD10') {
            //For ICD-10 questions, prefer options that are actual ICD codes
            const icdOptions = optionKeys.filter(key => {
                const value = options[key];
                return /^[A-Z]\d{2}(\.\d+)?$/.test(value);
            });
            
            if (icdOptions.length > 0) {
                const preferenceOrder = ['A', 'B', 'C', 'D'];
                for (const letter of preferenceOrder) {
                    if (icdOptions.includes(letter)) {
                        return { answer: letter, explanation: 'ICD-10 statistical preference' };
                    }
                }
            }
        }
        
        if (questionAnalysis.questionType === 'TERMINOLOGY') {
            //For terminology questions, prefer descriptive answers
            const preferenceOrder = ['B', 'A', 'C', 'D'];
            for (const letter of preferenceOrder) {
                if (optionKeys.includes(letter)) {
                    return { answer: letter, explanation: 'Terminology statistical preference' };
                }
            }
        }
        
        //General fallback: A, B, C, D order (not always C!)
        const preferenceOrder = ['A', 'B', 'C', 'D'];
        for (const letter of preferenceOrder) {
            if (optionKeys.includes(letter)) {
                return { answer: letter, explanation: 'General statistical preference' };
            }
        }
        
        return { answer: optionKeys[0], explanation: 'First available option' };
    }


module.exports = {
    validateCodeRanges,
    getStatisticalChoice,
    applyTiebreaker,
    eliminateIncorrectOptions,
    selectByValidation,
};