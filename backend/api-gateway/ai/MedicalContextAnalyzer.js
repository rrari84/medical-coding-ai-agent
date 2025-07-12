//This class takes a raw medical question and returns a structured object describing a type of question(category:CPT, ICD, guidelines), Medical Domain(ex., radiology, surgery), Complexity of the question, and contextual clues
//This class acts like the first stage of a pipeline, feeding structured data to MedicalCodingDecisionEngine 
class MedicalContextAnalyzer {
    constructor() {
        this.contextPatterns = this.initializeContextPatterns(); //On instantiation, it will initialize common contextual keywords to help in clue extraction, such as temporalPatterns, severityPatterns, and lateralityPatterns
    }

    //Primary Method - Returns a structured analysis object of the input
    async analyzeQuestion(questionData) {
        const analysis = {
            questionText: questionData.question || questionData.text,
            questionType: this.determineQuestionType(questionData),
            complexity: this.assessComplexity(questionData),
            medicalDomain: this.identifyMedicalDomain(questionData),
            contextClues: this.extractContextClues(questionData)
        };

        return analysis;
    }

    //Classifies the type of question using simple keyword-based heuristics, for example as CPT_LOOKUP means "which CPT code..."
    determineQuestionType(questionData) {
        const text = (questionData.question || questionData.text || '').toLowerCase();
        
        if (text.includes('which cpt code') || text.includes('cpt code')) return 'CPT_LOOKUP';
        if (text.includes('which icd') || text.includes('diagnosis')) return 'ICD_LOOKUP';
        if (text.includes('hcpcs')) return 'HCPCS_LOOKUP';
        if (text.includes('what does') && text.includes('mean')) return 'TERMINOLOGY';
        if (text.includes('according to') && text.includes('guidelines')) return 'GUIDELINES';
        
        return 'GENERAL_CODING';
    }

    //Returns a numeric complexity score(1-5) based on certain keywords
    //Used later for matching procedure/code complexity and confidence calibration
    assessComplexity(questionData) {
        const text = (questionData.question || questionData.text || '').toLowerCase();
        let complexity = 1;

        //Increase complexity for multiple conditions
        if (text.includes('and') || text.includes('with')) complexity += 1;
        if (text.includes('bilateral')) complexity += 1;
        if (text.includes('complicated') || text.includes('complex')) complexity += 2;
        if (text.includes('without') || text.includes('exclude')) complexity += 1;

        return Math.min(5, complexity);
    }

    //Maps question to a medical specialty domain using keyword lists
    identifyMedicalDomain(questionData) {
        const text = (questionData.question || questionData.text || '').toLowerCase();
        
        const domains = {
            'surgery': ['surgery', 'surgical', 'procedure', 'operation'],
            'radiology': ['x-ray', 'mri', 'ct', 'ultrasound', 'imaging'],
            'laboratory': ['test', 'lab', 'blood', 'analysis'],
            'emergency': ['emergency', 'er', 'trauma', 'accident'],
            'preventive': ['checkup', 'screening', 'routine', 'annual']
        };

        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return domain;
            }
        }

        return 'general'; //Returns 'general' if no match found
    }

    //Finds specific contextual tags to help narrow decision logic
    //These will help influence code selection (ex., bilateral-specific codes) and will also help refine decision strategies (such as anatomicalSystemMatching)
    extractContextClues(questionData) {
        const text = (questionData.question || questionData.text || '').toLowerCase();
        const clues = [];

        //Time indicators
        if (text.includes('acute') || text.includes('sudden')) clues.push('acute_condition');
        if (text.includes('chronic') || text.includes('persistent')) clues.push('chronic_condition');
        
        //Severity indicators
        if (text.includes('severe') || text.includes('critical')) clues.push('high_severity');
        if (text.includes('mild') || text.includes('simple')) clues.push('low_severity');
        
        //Anatomical indicators
        if (text.includes('bilateral') || text.includes('both')) clues.push('bilateral');
        if (text.includes('unilateral') || text.includes('one side')) clues.push('unilateral');

        return clues;
    }

    //Returns an object with keyword arrays, this pattern data is reused for dynamic pattern matching, feed into other modules (like highlighting context in a UI)
    initializeContextPatterns() {
        return {
            //Context patterns for better analysis
            temporalPatterns: ['acute', 'chronic', 'sudden', 'gradual'],
            severityPatterns: ['mild', 'moderate', 'severe', 'critical'],
            lateralityPatterns: ['bilateral', 'unilateral', 'left', 'right']
        };
    }
}
module.exports = MedicalContextAnalyzer;