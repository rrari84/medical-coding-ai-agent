//Purpose: This code defines a universal utility class that ensures medical coding questions
//are consistently formatted, regardless of how they were originally written.
//It normalizes any incoming question object into a consistent, predictable format.
//Heres how it works in steps throughout the code:

class UniversalQuestionHandler {
  static normalizeQuestion(question) {
    const normalized = { //1. initialize the normalized template
      id: null,
      text: '',
      options: {},
      correct: '',
      category: 'General',
      explanation: ''
    };

    //2.Normalize ID - supporting various naming conventions
    normalized.id = question.id || question.questionId || null;

    //3.Normalize text - Extract question text - handles ALL different formats
    normalized.text = question.text || 
                     question.question || 
                     question.questionText || 
                     question.prompt || '';

    //4.Normalize options - Extract options - handles ALL your different formats
    if (question.options) {
      if (typeof question.options === 'object' && !Array.isArray(question.options)) {
        //Format: { A: "option1", B: "option2", C: "option3", D: "option4" }
        normalized.options = question.options;
      } else if (Array.isArray(question.options)) {
        //Format: ["option1", "option2", "option3", "option4"]
        normalized.options = {
          A: question.options[0] || '',
          B: question.options[1] || '',
          C: question.options[2] || '',
          D: question.options[3] || ''
        };
      }
    } else {
      //Check for individual option properties (your new format)
      normalized.options = {
        A: question.optionA || question.option_a || question.A || '',
        B: question.optionB || question.option_b || question.B || '',
        C: question.optionC || question.option_c || question.C || '',
        D: question.optionD || question.option_d || question.D || ''
      };
    }

    //5.Normalize correct answer - Extract correct answer - handles ALL your different formats
    normalized.correct = (question.correct || 
                         question.correctAnswer || 
                         question.answer || 
                         question.solution || 'A').toString().toUpperCase();

    //6.Normalize category - Extract category
    normalized.category = question.category || 
                         question.type || 
                         question.subject || 
                         question.topic || 'General';

    return normalized;
  }
}

module.exports = UniversalQuestionHandler;