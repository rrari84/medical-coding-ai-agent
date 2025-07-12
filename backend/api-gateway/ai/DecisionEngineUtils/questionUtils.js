   //This module contains two classification functions used in my medical coding system
   //to understand the intent and context of a question.

   function determineQuestionType(text) {
        if (text.includes('cpt code') || text.includes('procedure')) return 'CPT';
        if (text.includes('icd') || text.includes('diagnosis')) return 'ICD10';
        if (text.includes('hcpcs')) return 'HCPCS';
        if (text.includes('what does') && text.includes('mean')) return 'TERMINOLOGY';
        return 'GENERAL';
    }

    function identifyMedicalDomain(text) {
        const domains = {
            'surgery': ['surgery', 'surgical', 'procedure', 'operation', 'excision', 'incision'],
            'radiology': ['x-ray', 'mri', 'ct', 'ultrasound', 'imaging'],
            'laboratory': ['test', 'lab', 'blood', 'analysis', 'panel'],
            'emergency': ['emergency', 'er', 'trauma', 'accident'],
            'preventive': ['checkup', 'screening', 'routine', 'annual']
        };
        
        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return domain;
            }
        }
        
        return 'general';
    }

module.exports = {
    determineQuestionType,
    identifyMedicalDomain
};