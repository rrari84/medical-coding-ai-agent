    //This module defines a set of helper functions that categorize medical codes by analyzing their format.
    //These are essential for automated medical coding agents, because understanding which domain or category a given code belongs will help determine if the
    //selected answer fits the context of the question

    function getCPTRange(code) {
        const codeNum = parseInt(code);
        const ranges = [
            { start: 10000, end: 19999, name: 'Integumentary' },
            { start: 20000, end: 29999, name: 'Musculoskeletal' },
            { start: 30000, end: 39999, name: 'Respiratory' },
            { start: 40000, end: 49999, name: 'Digestive' },
            { start: 50000, end: 59999, name: 'Urinary' },
            { start: 60000, end: 69999, name: 'Endocrine' },
            { start: 70000, end: 79999, name: 'Radiology' },
            { start: 80000, end: 89999, name: 'Laboratory' },
            { start: 90000, end: 99999, name: 'Medicine' }
        ];
        
        for (const range of ranges) {
            if (codeNum >= range.start && codeNum <= range.end) {
                return range.name;
            }
        }
        
        return 'Unknown';
    }

    function getICD10Range(code) {
        const firstLetter = code.charAt(0);
        const chapters = {
            'A': 'Infectious diseases', 'B': 'Infectious diseases',
            'C': 'Neoplasms', 'D': 'Blood/Neoplasms',
            'E': 'Endocrine', 'F': 'Mental disorders',
            'G': 'Nervous system', 'H': 'Eye/Ear',
            'I': 'Circulatory', 'J': 'Respiratory',
            'K': 'Digestive', 'L': 'Skin',
            'M': 'Musculoskeletal', 'N': 'Genitourinary'
        };
        
        return chapters[firstLetter] || 'Unknown';
    }

    function getHCPCSRange(code) {
        const firstLetter = code.charAt(0);
        const categories = {
            'A': 'Medical supplies', 'B': 'Enteral therapy',
            'C': 'Outpatient PPS', 'D': 'Dental',
            'E': 'DME', 'G': 'Professional services',
            'H': 'Behavioral health', 'J': 'Drugs',
            'K': 'Temporary', 'L': 'Orthotics/Prosthetics',
            'M': 'Medical services', 'P': 'Pathology',
            'Q': 'Temporary', 'R': 'Radiology',
            'S': 'Temporary', 'T': 'State Medicaid',
            'V': 'Vision', 'X': 'Private payer'
        };
        
        return categories[firstLetter] || 'Unknown';
    }
        
    function getExpectedCPTRanges(medicalDomain) {
        const domainRanges = {
            'surgery': ['10000-19999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999'],
            'radiology': ['70000-79999'],
            'laboratory': ['80000-89999'],
            'medicine': ['90000-99999'],
            'emergency': ['99000-99999'],
            'preventive': ['99000-99999']
        };
        
        return domainRanges[medicalDomain] || ['10000-99999'];
    }

module.exports = {
    getCPTRange,
    getICD10Range,
    getHCPCSRange,
    getExpectedCPTRanges
};