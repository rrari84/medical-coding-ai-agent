const initializeKnowledgeBase = require('../knowledge/MedicalPatterns'); //contains known keyword/code/answer patterns like "biopsy of skin" or "thyroid removal"
const extractMedicalKeywords = require('../utils/KeywordExtractor'); //pulls medically relevant terms from the question


//Purpose: To analyze a medical coding question and multiple-choice options then, either:
//1. Match against known medical patterns (via MedicalPatterns.js)
//2. Score those patterns based on keywords, categories, and codes
//3. Return the best match with either selected answer(A,B,etc.), confidence level, or reasoning explanation
function findBestPattern(question, options) {
  const keywords = extractMedicalKeywords(question);
  const questionLower = (question || '').toLowerCase();

  //Normalization: Handles both array formats and object formats
  //stores final answer options in normalizedOptions and codes(all values for easier lookup)
  let normalizedOptions = {};
  let codes = [];
  if (Array.isArray(options)) {
    //Convert array to object format: ["val1", "val2"] -> {A: "val1", B: "val2"}
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    options.forEach((value, index) => {
      if (index < letters.length) {
        normalizedOptions[letters[index]] = value;
      }
    });
    codes = options;
    console.log(`🔧 Converted array options to object:`, normalizedOptions);
  } else if (options && typeof options === 'object') {
    normalizedOptions = options;
    codes = Object.values(options);
  } else {
    console.error('❌ Invalid options format:', options);
    return null;
  }

  //Initialize knowledge base, load it in
  const knowledgeBase = initializeKnowledgeBase();

  console.log(`🔍 Searching for patterns in: "${questionLower}"`);
  console.log(`🔍 Available patterns: ${Object.keys(knowledgeBase.patterns).length}`);

  //More comprehensive pattern matching with score values
  //Each pattern is evaluated based on a heuristic score
  //Max ~1.2
  //If no good match, >0.4
  //Fallback logic is applied
  const allPatterns = Object.entries(knowledgeBase.patterns);
  let bestMatch = null;
  let bestScore = 0;

  for (const [patternName, pattern] of allPatterns) {
    let score = 0;
    let hasRequiredKeywords = false;
    let hasExcludedKeywords = false;

    //Check required keywords (more flexible matching)
    if (pattern.keywords && pattern.keywords.length > 0) {
      const matchedKeywords = pattern.keywords.filter(keyword => 
        questionLower.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        hasRequiredKeywords = true;
        //Score based on keyword match percentage
        score += (matchedKeywords.length / pattern.keywords.length) * 0.6;
        
        //Bonus for exact matches
        if (matchedKeywords.length === pattern.keywords.length) {
          score += 0.3;
        }
        
        console.log(`🔍 Pattern "${patternName}": matched ${matchedKeywords.length}/${pattern.keywords.length} keywords: ${matchedKeywords.join(', ')}`);
      }
    }

    //Check excluded keywords
    if (pattern.excludeKeywords && pattern.excludeKeywords.length > 0) {
      const excludedMatches = pattern.excludeKeywords.filter(keyword => 
        questionLower.includes(keyword.toLowerCase())
      );
      
      if (excludedMatches.length > 0) {
        hasExcludedKeywords = true;
        score -= 0.4; //Penalty for excluded keywords
        console.log(`🔍 Pattern "${patternName}": found excluded keywords: ${excludedMatches.join(', ')}`);
      }
    }

    //Skip if excluded keywords found
    if (hasExcludedKeywords) {
      continue;
    }

    //Only consider patterns with some keyword matches
    if (!hasRequiredKeywords) {
      continue;
    }

    //Check for code matches in options
    if (pattern.preferredCode && codes.includes(pattern.preferredCode)) {
      score += 0.3;
      console.log(`🔍 Pattern "${patternName}": preferred code ${pattern.preferredCode} found in options`);
    }

    //Check for text-based answers
    if (pattern.preferredAnswer) {
      const answerMatch = Object.values(normalizedOptions).some(optionValue => 
        optionValue.toLowerCase().includes(pattern.preferredAnswer.toLowerCase())
      );
      if (answerMatch) {
        score += 0.3;
        console.log(`🔍 Pattern "${patternName}": preferred answer "${pattern.preferredAnswer}" found in options`);
      }
    }

    //Contextual matching bonuses
    if (pattern.category) {
      //Bonus for specific categories
      const categoryKeywords = {
        'oral_surgery': ['mouth', 'oral', 'dentist', 'tongue', 'cheek'],
        'integumentary': ['skin', 'lesion', 'biopsy', 'rash', 'cut'],
        'respiratory': ['breathing', 'sinus', 'nasal', 'lung', 'airway'],
        'endocrine': ['thyroid', 'hormone', 'gland', 'diabetes'],
        'genitourinary': ['kidney', 'urine', 'bladder', 'renal'],
        'cardiovascular': ['heart', 'blood', 'pressure', 'cardiac'],
        'musculoskeletal': ['bone', 'joint', 'muscle', 'fracture']
      };

      const categoryKeys = categoryKeywords[pattern.category] || [];
      const categoryMatches = categoryKeys.filter(key => questionLower.includes(key));
      if (categoryMatches.length > 0) {
        score += 0.2;
        console.log(`🔍 Pattern "${patternName}": category bonus for ${categoryMatches.join(', ')}`);
      }
    }

    //Update best match
    if (score > bestScore && score > 0.4) { //Minimum threshold
      bestScore = score;
      bestMatch = {
        patternName,
        pattern,
        score,
        matchedKeywords: pattern.keywords.filter(k => questionLower.includes(k.toLowerCase()))
      };
    }
  }

  //If we found a good match, return it
  if (bestMatch && bestScore > 0.4) {
    const pattern = bestMatch.pattern;
    let result = null;

    //Try to find the answer option
    if (pattern.preferredCode && codes.includes(pattern.preferredCode)) {
      const optionKey = Object.keys(normalizedOptions).find(key => 
        normalizedOptions[key] === pattern.preferredCode
      );
      if (optionKey) {
        result = {
          answer: optionKey,
          confidence: Math.min(0.96, pattern.confidence || 0.85),
          reasoning: pattern.reasoning || `Matched pattern: ${bestMatch.patternName}. Code ${pattern.preferredCode} selected.`
        };
      }
    } else if (pattern.preferredAnswer) {
      const optionKey = Object.keys(normalizedOptions).find(key => 
        normalizedOptions[key].toLowerCase().includes(pattern.preferredAnswer.toLowerCase())
      );
      if (optionKey) {
        result = {
          answer: optionKey,
          confidence: Math.min(0.96, pattern.confidence || 0.85),
          reasoning: pattern.reasoning || `Matched pattern: ${bestMatch.patternName}. Answer "${pattern.preferredAnswer}" selected.`
        };
      }
    }

    if (result) {
      console.log(`🎯 BEST MATCH: ${bestMatch.patternName} (score: ${bestScore.toFixed(2)}) -> ${result.answer}`);
      console.log(`🎯 Reasoning: ${result.reasoning}`);
      return result;
    }
  }

  //Fallback pattern matching based on code analysis
  console.log(`🔍 No direct pattern match found. Trying code analysis...`);
  
  //Try to match based on code types and ranges
  const codeAnalysis = analyzeCodeOptions(normalizedOptions);
  const fallbackMatch = findFallbackMatch(questionLower, codeAnalysis, normalizedOptions);
  
  if (fallbackMatch) {
    console.log(`🎯 Fallback match found: ${fallbackMatch.answer} (${fallbackMatch.reasoning})`);
    return fallbackMatch;
  }

  console.log(`🔍 No pattern match found for question: "${questionLower.substring(0, 100)}..."`);
  return null;
}

//Analyze code options for fallback matching
function analyzeCodeOptions(options) {
  const analysis = {
    cptCodes: [],
    icdCodes: [],
    hcpcsCodes: [],
    terminologyOptions: []
  };

  for (const [letter, value] of Object.entries(options)) {
    if (/^\d{5}$/.test(value)) {
      analysis.cptCodes.push({ letter, code: value, range: getCPTRange(value) });
    } else if (/^[A-Z]\d{2}(\.\d+)?$/.test(value)) {
      analysis.icdCodes.push({ letter, code: value, chapter: getICD10Chapter(value) });
    } else if (/^[A-Z]\d{4}$/.test(value)) {
      analysis.hcpcsCodes.push({ letter, code: value, category: getHCPCSCategory(value) });
    } else {
      analysis.terminologyOptions.push({ letter, text: value });
    }
  }

  return analysis;
}

//Find fallback matches based on code analysis
function findFallbackMatch(questionText, codeAnalysis, options) {
  //CPT code range matching
  if (codeAnalysis.cptCodes.length > 0) {
    //Surgery-related keywords
    if (questionText.includes('surgery') || questionText.includes('procedure') || 
        questionText.includes('excision') || questionText.includes('incision')) {
      
      //Look for integumentary system codes (10000-19999)
      if (questionText.includes('skin') || questionText.includes('lesion') || 
          questionText.includes('biopsy') || questionText.includes('drainage')) {
        const integumentaryCode = codeAnalysis.cptCodes.find(c => c.range === 'Integumentary');
        if (integumentaryCode) {
          return {
            answer: integumentaryCode.letter,
            confidence: 0.70,
            reasoning: `Fallback match: Integumentary system procedure (${integumentaryCode.code})`
          };
        }
      }
      
      //Look for respiratory system codes (30000-39999)
      if (questionText.includes('nasal') || questionText.includes('sinus') || 
          questionText.includes('nose') || questionText.includes('breathing')) {
        const respiratoryCode = codeAnalysis.cptCodes.find(c => c.range === 'Respiratory');
        if (respiratoryCode) {
          return {
            answer: respiratoryCode.letter,
            confidence: 0.70,
            reasoning: `Fallback match: Respiratory system procedure (${respiratoryCode.code})`
          };
        }
      }
      
      //Look for endocrine system codes (60000-69999)
      if (questionText.includes('thyroid') || questionText.includes('parathyroid') || 
          questionText.includes('endocrine') || questionText.includes('hormone')) {
        const endocrineCode = codeAnalysis.cptCodes.find(c => c.range === 'Endocrine');
        if (endocrineCode) {
          return {
            answer: endocrineCode.letter,
            confidence: 0.70,
            reasoning: `Fallback match: Endocrine system procedure (${endocrineCode.code})`
          };
        }
      }
    }
  }

  //ICD-10 chapter matching
  if (codeAnalysis.icdCodes.length > 0) {
    if (questionText.includes('hypertension') || questionText.includes('blood pressure')) {
      const circulatoryCode = codeAnalysis.icdCodes.find(c => c.chapter === 'Circulatory');
      if (circulatoryCode) {
        return {
          answer: circulatoryCode.letter,
          confidence: 0.70,
          reasoning: `Fallback match: Circulatory system diagnosis (${circulatoryCode.code})`
        };
      }
    }
  }

  //Terminology matching
  if (codeAnalysis.terminologyOptions.length > 0) {
    if (questionText.includes('bradycardia')) {
      const slowOption = codeAnalysis.terminologyOptions.find(t => 
        t.text.toLowerCase().includes('slow')
      );
      if (slowOption) {
        return {
          answer: slowOption.letter,
          confidence: 0.85,
          reasoning: `Fallback match: Bradycardia means slow heartbeat`
        };
      }
    }
    
    if (questionText.includes('hyperglycemia')) {
      const highOption = codeAnalysis.terminologyOptions.find(t => 
        t.text.toLowerCase().includes('high')
      );
      if (highOption) {
        return {
          answer: highOption.letter,
          confidence: 0.85,
          reasoning: `Fallback match: Hyperglycemia means high blood sugar`
        };
      }
    }
  }

  return null;
}

//Helper functions: getCPTRange(classifies CPT code in anatomical ranges)
function getCPTRange(code) {
  const codeNum = parseInt(code);
  if (codeNum >= 10000 && codeNum <= 19999) return 'Integumentary';
  if (codeNum >= 20000 && codeNum <= 29999) return 'Musculoskeletal';
  if (codeNum >= 30000 && codeNum <= 39999) return 'Respiratory';
  if (codeNum >= 40000 && codeNum <= 49999) return 'Digestive';
  if (codeNum >= 50000 && codeNum <= 59999) return 'Urinary';
  if (codeNum >= 60000 && codeNum <= 69999) return 'Endocrine';
  if (codeNum >= 70000 && codeNum <= 79999) return 'Radiology';
  if (codeNum >= 80000 && codeNum <= 89999) return 'Laboratory';
  if (codeNum >= 90000 && codeNum <= 99999) return 'Medicine';
  return 'Unknown';
}
//Helper function: getICD10Chapter(Maps ICD-10 chapters)
function getICD10Chapter(code) {
  const firstChar = code.charAt(0);
  if (firstChar === 'I') return 'Circulatory';
  if (firstChar === 'J') return 'Respiratory';
  if (firstChar === 'M') return 'Musculoskeletal';
  if (firstChar === 'N') return 'Genitourinary';
  if (firstChar === 'E') return 'Endocrine';
  if (firstChar === 'L') return 'Skin';
  return 'Other';
}
//Helper function: getHCPCSCategory(Groups HCPCS codes into categories)
function getHCPCSCategory(code) {
  const firstChar = code.charAt(0);
  if (firstChar === 'K') return 'DME';
  if (firstChar === 'J') return 'Drugs';
  if (firstChar === 'A') return 'Supplies';
  if (firstChar === 'E') return 'Equipment';
  if (firstChar === 'L') return 'Prosthetics';
  return 'Other';
}

module.exports = findBestPattern;