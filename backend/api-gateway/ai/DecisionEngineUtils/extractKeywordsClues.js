   //This code defines four utility functions that extract clue words from a block of medical text,
   //such as a question prompt or reasoning string. These clues help the AI agent or pattern engine understand what kind of procedure, body part, or timing involved.
   //This code is essential for selecting correct medical codes

   //Each function focuses on a different category of medical context
   function extractKeywords(text) {
        const medicalKeywords = [
            'excision', 'incision', 'drainage', 'biopsy', 'endoscopy',
            'surgery', 'procedure', 'treatment', 'diagnosis', 'therapy'
        ];
        
        return medicalKeywords.filter(keyword => text.includes(keyword));
    }

    function extractAnatomicalClues(text) {
        const anatomicalTerms = [
            'head', 'neck', 'chest', 'abdomen', 'arm', 'leg', 'hand', 'foot',
            'heart', 'lung', 'liver', 'kidney', 'brain', 'bone', 'muscle'
        ];
        
        return anatomicalTerms.filter(term => text.includes(term));
    }

    function extractProcedureClues(text) {
        const procedureTerms = [
            'removal', 'repair', 'replacement', 'transplant', 'biopsy',
            'imaging', 'test', 'examination', 'injection', 'therapy'
        ];
        
        return procedureTerms.filter(term => text.includes(term));
    }

    function extractTemporalClues(text) {
        const temporalTerms = ['acute', 'chronic', 'routine', 'emergency', 'follow-up'];
        return temporalTerms.filter(term => text.includes(term));
    }

module.exports = {
    extractKeywords,
    extractAnatomicalClues,
    extractProcedureClues,
    extractTemporalClues
};