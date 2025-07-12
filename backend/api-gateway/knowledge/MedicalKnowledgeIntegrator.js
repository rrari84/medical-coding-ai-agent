//Purpose: This module is supposed to enhance medical coding decision-making for the gpt-4o agent I am prompt engineering,
//It will:
//1.Find Patterns relevant to a question using Medical Pattern Knowledge Base
//2.Generating contextual guidance to assist model decision-making
//3.Validating answers against known coding patterns
//4.Enhancing prompts for downstream models with clear structure, domain knowledge, and confidence calibration
const initializeKnowledgeBase = require('./MedicalPatterns');

class MedicalKnowledgeIntegrator {
    //Loading in coding knowledge base from MedicalPatterns.js
  constructor() {
    this.kb = initializeKnowledgeBase();
  }

  //Find relevant patterns based on question content:
  //Searches for top 3 most relevant patterns by:
  //1.Scanning keywords in the question
  //2.Giving either +2 points for each matched keyword or -3 penalty for any excluded keyword
  //3.Only returns patterns with a positive score
  findRelevantPatterns(questionText) {
    const questionLower = questionText.toLowerCase();
    const relevantPatterns = [];
    const scores = [];

    //Check each pattern in the knowledge base
    Object.entries(this.kb.patterns).forEach(([patternName, pattern]) => {
      let score = 0;
      let matchedKeywords = [];
      let excludedKeywords = [];

      //Check positive keywords
      if (pattern.keywords) {
        pattern.keywords.forEach(keyword => {
          if (questionLower.includes(keyword.toLowerCase())) {
            score += 2;
            matchedKeywords.push(keyword);
          }
        });
      }

      //Check negative keywords (exclusions)
      if (pattern.excludeKeywords) {
        pattern.excludeKeywords.forEach(excludeKeyword => {
          if (questionLower.includes(excludeKeyword.toLowerCase())) {
            score -= 3; //Heavy penalty for exclusions
            excludedKeywords.push(excludeKeyword);
          }
        });
      }

      //Only include patterns with positive score and matched keywords
      if (score > 0 && matchedKeywords.length > 0) {
        relevantPatterns.push({
          name: patternName,
          pattern: pattern,
          score: score,
          matchedKeywords: matchedKeywords,
          excludedKeywords: excludedKeywords
        });
        scores.push(score);
      }
    });

    //Sort by relevance score
    relevantPatterns.sort((a, b) => b.score - a.score);
    
    return relevantPatterns.slice(0, 3); //Return top 3 most relevant
  }

  //Generate contextual guidance based on matched patterns:
  //Creates a readable breakdown of which coding patterns apply
  //and if no match is found, it will fall back to generateGenericGuidance, returning general advice
  generateContextualGuidance(questionText) {
    const relevantPatterns = this.findRelevantPatterns(questionText);
    
    if (relevantPatterns.length === 0) {
      return this.generateGenericGuidance(questionText);
    }

    let guidance = '\n🧠 RELEVANT MEDICAL CODING PATTERNS:\n\n';

    relevantPatterns.forEach((item, index) => {
      const pattern = item.pattern;
      
      guidance += `${index + 1}. **${pattern.category.toUpperCase()} PATTERN**:\n`;
      guidance += `   Keywords found: ${item.matchedKeywords.join(', ')}\n`;
      
      if (item.excludedKeywords.length > 0) {
        guidance += `   ⚠️ Exclusion keywords present: ${item.excludedKeywords.join(', ')}\n`;
      }
      
      //Add category-specific guidance
      guidance += this.getCategorySpecificGuidance(pattern.category);
      guidance += `   Confidence level: ${(pattern.confidence * 100).toFixed(0)}%\n\n`;
    });

    return guidance;
  }

  //Generate category-specific guidance
  //Returns focus areas for each coding category
  //Used by the contextual guidance generator to guide LLM reasoning
  getCategorySpecificGuidance(category) {
    const guidanceMap = {
      'oral_surgery': '   Focus: Distinguish between excision vs biopsy, and anatomical specificity (floor of mouth vs general oral)\n',
      'integumentary': '   Focus: Differentiate incision/drainage vs excision, and complexity levels (simple vs complex)\n',
      'musculoskeletal': '   Focus: Anatomical location specificity and procedure approach (superficial vs deep)\n',
      'respiratory': '   Focus: Diagnostic vs surgical endoscopy, and anatomical specificity\n',
      'endocrine': '   Focus: Procedure type (lobectomy vs total vs biopsy) and approach method\n',
      'genitourinary': '   Focus: Procedure complexity and approach (percutaneous vs open)\n',
      'radiology': '   Focus: View count specificity and anatomical region\n',
      'medical_terminology': '   Focus: Root word meanings and prefix/suffix combinations\n',
      'anatomy': '   Focus: Structure-function relationships and anatomical locations\n',
      'cardiovascular_diagnosis': '   Focus: Primary vs secondary conditions and complication presence\n',
      'laboratory': '   Focus: Test type specificity and methodology\n'
    };

    return guidanceMap[category] || '   Focus: Apply general coding principles of specificity and accuracy\n';
  }

  //Generate generic guidance when no specific patterns match
  generateGenericGuidance(questionText) {
    const questionLower = questionText.toLowerCase();
    let guidance = '\n🔍 GENERAL CODING ANALYSIS APPROACH:\n\n';

    // Determine likely code type
    if (questionLower.includes('cpt') || questionLower.includes('procedure') || questionLower.includes('surgery')) {
      guidance += '**CPT CODE FOCUS**:\n';
      guidance += '- Identify exact procedure performed\n';
      guidance += '- Consider anatomical specificity\n';
      guidance += '- Check approach method (open, endoscopic, percutaneous)\n';
      guidance += '- Verify complexity level\n\n';
    }
    
    if (questionLower.includes('icd') || questionLower.includes('diagnosis') || questionLower.includes('condition')) {
      guidance += '**ICD-10-CM FOCUS**:\n';
      guidance += '- Identify primary condition\n';
      guidance += '- Check for acute vs chronic\n';
      guidance += '- Consider laterality (bilateral/unilateral)\n';
      guidance += '- Look for complications or manifestations\n\n';
    }
    
    if (questionLower.includes('hcpcs') || questionLower.includes('supply') || questionLower.includes('equipment')) {
      guidance += '**HCPCS LEVEL II FOCUS**:\n';
      guidance += '- Identify supply or equipment type\n';
      guidance += '- Consider functionality and features\n';
      guidance += '- Check for quantity specifications\n\n';
    }

    return guidance;
  }

  //Get code range context for better understanding:
  //This will check the numerical range of codes in the options
  //then it will look up which category each range corresponds to
  getCodeRangeContext(options) {
    let context = '';
    const optionCodes = Object.values(options);
    
    //Analyze code ranges represented in options
    const ranges = new Set();
    optionCodes.forEach(code => {
      if (typeof code === 'string') {
        const numericCode = parseInt(code.replace(/[^\d]/g, ''));
        if (numericCode) {
          //Find which range this code belongs to
          Object.entries(this.kb.cptCodeRanges).forEach(([range, info]) => {
            const [start, end] = range.split('-').map(r => parseInt(r));
            if (numericCode >= start && numericCode <= end) {
              ranges.add(`${range}: ${info.category}`);
            }
          });
        }
      }
    });

    if (ranges.size > 0) {
      context += '\n📋 CODE RANGE CONTEXT:\n';
      ranges.forEach(range => {
        context += `- ${range}\n`;
      });
      context += '\n';
    }

    return context;
  }

  //Main function to enhance prompts
  //This combines contextual guidance and code range context
  //Prompt-Engineering: Useful as part of a prompt to guide GPT-4 or other agents
  enhancePrompt(questionText, options) {
    const contextualGuidance = this.generateContextualGuidance(questionText);
    const codeRangeContext = this.getCodeRangeContext(options);
    
    return contextualGuidance + codeRangeContext;
  }

  //Get confidence threshold based on pattern matches:
  //This sets the minimum confidecne level the model should use:
  //If the pattern matches -> base confidence + 0.05 buffer (max 95%)
  //If no pattern -> fallback to 70%
  //This helps regulate the model confidence output realistically, based on evidence
  getConfidenceThreshold(questionText) {
    const relevantPatterns = this.findRelevantPatterns(questionText);
    
    if (relevantPatterns.length === 0) {
      return 0.7; //Lower threshold for generic questions
    }
    
    //Use the highest confidence from matched patterns
    const maxPatternConfidence = Math.max(...relevantPatterns.map(p => p.pattern.confidence));
    return Math.min(maxPatternConfidence + 0.05, 0.95); // Add small buffer, cap at 95%
  }

  //Validate answer against knowledge base patterns
  //This will check if a selected answer is valid given the best-matching pattern
  //Decision-making feedback system for the LLM pre-exisitng decision making
  validateAnswer(questionText, selectedAnswer, options) {
    const relevantPatterns = this.findRelevantPatterns(questionText);
    const validation = {
      isValid: true,
      confidence: 0.5,
      reasoning: 'No specific pattern match found',
      warnings: []
    };

    if (relevantPatterns.length > 0) {
      const topPattern = relevantPatterns[0].pattern;
      
      //Check if selected answer matches preferred code/answer
      if (topPattern.preferredCode) {
        const selectedCode = options[selectedAnswer];
        if (selectedCode === topPattern.preferredCode) {
          validation.confidence = topPattern.confidence;
          validation.reasoning = topPattern.reasoning;
        } else {
          validation.confidence = 0.3;
          validation.warnings.push(`Pattern suggests ${topPattern.preferredCode}, but selected ${selectedCode}`);
        }
      }
      
      if (topPattern.preferredAnswer) {
        const selectedText = options[selectedAnswer];
        if (selectedText && selectedText.toLowerCase().includes(topPattern.preferredAnswer.toLowerCase())) {
          validation.confidence = topPattern.confidence;
          validation.reasoning = topPattern.reasoning;
        } else {
          validation.confidence = 0.3;
          validation.warnings.push(`Pattern suggests answer containing "${topPattern.preferredAnswer}"`);
        }
      }
    }

    return validation;
  }
}

//A better prompt function that uses your existing knowledge base
//Promptt-Engineering: This just creates a model-facing prompt:
//I made a extremely structured, calibrated, and focused prompt which has dramatically improved LLM reliability and explainability
//Added this function to take my 68/100 to a 86/100, helped a lot..
function createEnhancedMedicalPrompt(question, options, keywords = []) {
  const integrator = new MedicalKnowledgeIntegrator();
  const enhancement = integrator.enhancePrompt(question.text, question.options);
  const confidenceThreshold = integrator.getConfidenceThreshold(question.text);
  
  return `You are a medical coding expert. Analyze this question with extreme precision:

QUESTION: ${question.text}

OPTIONS:
A. ${question.options.A}
B. ${question.options.B}
C. ${question.options.C}
D. ${question.options.D}

${keywords.length > 0 ? `KEY MEDICAL TERMS IDENTIFIED: ${keywords.join(', ')}\n` : ''}

${enhancement}

🎯 CRITICAL ANALYSIS STEPS:
1. **PROCEDURE/CONDITION IDENTIFICATION**: What exactly is being described?
2. **ANATOMICAL SPECIFICITY**: Exact location, laterality, complexity
3. **METHODOLOGY**: Approach, technique, extent of procedure  
4. **CODE CATEGORY**: CPT (procedures), ICD-10 (diagnoses), HCPCS (supplies)
5. **PATTERN MATCHING**: Apply relevant patterns from above
6. **OPTION ELIMINATION**: Rule out obviously incorrect choices

⚠️ CONFIDENCE CALIBRATION:
- Only use confidence above ${(confidenceThreshold * 100).toFixed(0)}% if you're absolutely certain
- Use 0.6-0.8 for typical confidence levels
- Use 0.4-0.6 if uncertain or conflicting information

RESPONSE FORMAT:
PROCEDURE_TYPE: [What type of procedure/diagnosis is this?]
KEY_ANATOMICAL_DETAILS: [Specific anatomical information]
PATTERN_RECOGNITION: [Which patterns from above apply?]
OPTION_ANALYSIS: [Brief analysis of why each option is right/wrong]
ANSWER: [A/B/C/D]
CONFIDENCE: [0.0-1.0 - be realistic and calibrated]
REASONING: [Detailed explanation of your choice]
  `;
}

module.exports = {
  MedicalKnowledgeIntegrator,
  createEnhancedMedicalPrompt
};