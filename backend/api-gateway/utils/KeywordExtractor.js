//Purpose: This utility function extracts key medical terms from a given question string. 
//It helps downstream AI agents or logic engine understand the context of the medical question.

function extractMedicalKeywords(question) {
    //SAFETY CHECK - this fixes the .toLowerCase error if the input is null or not a string
    if (!question || typeof question !== 'string') {
        console.log('⚠️ Invalid question text:', question);
        return [];
    }

    //Converts the entire question to lowercase for case-insensitive matching
    const questionLower = question.toLowerCase();
    const keywords = [];

    //A scan for known common medical terms: these terms are hardcoded and cover a range of categories
    const medicalTerms = [
        'excision', 'incision', 'drainage', 'biopsy', 'endoscopy',
        'oral', 'mouth', 'floor', 'thyroid', 'kidney', 'nasal', 'sinus',
        'hypertension', 'diabetes', 'wheelchair', 'hemoglobin',
        'bradycardia', 'lesion', 'cyst', 'abscess'
    ];

    //Each is checked via:
    medicalTerms.forEach(term => {
        if (questionLower.includes(term)) {
            keywords.push(term);
        }//adds matching terms to the keywords array
    });

    return keywords; //returns array
}

module.exports = extractMedicalKeywords;