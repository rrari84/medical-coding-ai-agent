//This function is a code classificiation utility that helps your medical coding AI agent understand and organize the answer options by analyzing:
//What type of code each option is (CPT, ICD10, or HCPCS)
//Which sub-range or system it belongs (ex. integumentary or circulatory)

const {
    getCPTRange,
    getICD10Range,
    getHCPCSRange
} = require('./getRanges');
   
   function analyzeCodeOptions(options) {
        const analysis = {
            codeTypes: {},
            codeRanges: {},
            anatomicalSystems: {},
            complexity: {}
        };
        
        for (const [letter, code] of Object.entries(options)) {
            //Determine code type
            if (/^\d{5}$/.test(code)) {
                analysis.codeTypes[letter] = 'CPT';
                analysis.codeRanges[letter] = getCPTRange(code);
            } else if (/^[A-Z]\d{2}(\.\d+)?$/.test(code)) {
                analysis.codeTypes[letter] = 'ICD10';
                analysis.codeRanges[letter] = getICD10Range(code);
            } else if (/^[A-Z]\d{4}$/.test(code)) {
                analysis.codeTypes[letter] = 'HCPCS';
                analysis.codeRanges[letter] = getHCPCSRange(code);
            }
        }
        
        return analysis;
    }

module.exports = analyzeCodeOptions;