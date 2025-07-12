//This function is a centralized reasoning analyzer used to extract
//structured metadata from a medical question's reasoning object,
//enabling deeper downstream decision-making

//It converts the raw logic and facts from a medical reasoning explanation into a machine-readable set of clinical features
//that help an AI make better coding decisions

const {
    determineQuestionType,
    identifyMedicalDomain
} = require('./questionUtils');
const {
    extractKeywords,
    extractAnatomicalClues,
    extractProcedureClues,
    extractTemporalClues
} = require('./extractKeywordsClues')
const {
    assessComplexity,
    buildReasoningChain,
    identifyAnatomicalSystem,
    matchToAnatomicalSystem,
    analyzeProcedureComplexity,
    selectByComplexity,
    decomposeTerminology,
    selectByTerminology,
    checkMedicalLogic
} = require('./complexityTerminologyBuildUtils');
   
   function analyzeQuestion(reasoning) {
        const questionText = reasoning.primaryLogic || '';
        const supportingFacts = reasoning.supportingFacts || [];
        const allText = (questionText + ' ' + supportingFacts.join(' ')).toLowerCase();
        
        return {
            questionType: determineQuestionType(allText),
            medicalDomain: identifyMedicalDomain(allText),
            complexity: assessComplexity(allText),
            keywords: extractKeywords(allText),
            anatomicalClues: extractAnatomicalClues(allText),
            procedureClues: extractProcedureClues(allText),
            temporalClues: extractTemporalClues(allText)
        };
    }

module.exports = analyzeQuestion;