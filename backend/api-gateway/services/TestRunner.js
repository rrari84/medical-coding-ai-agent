//==================== PURPOSE ====================
//This file defines my full suite of experimental test runners for evaluating the medical coding AI agents
//It performs four types of evaluations--Pattern matching, Prompt Engineered GPT-4o, Combined Custom AI Agent, and an Ensemble.
//It stores all results in PostgreSQL database.
//Heres a breakdown of how it works,
//TestRunner.js exports multiple async functions that:
//*Run specific test types using different agents
//*Normalize input questions
//*Evaluate input questions
//*Track performance statistics
//*Save results to a PostgreSQL database
//*Return structured JSON responses via Express.js route

const { MedicalCodingService2 } = require('./MedicalCodingService2'); //pre-saved streamline service
const UniversalQuestionHandler = require('../utils/UniversalQuestionHandler'); //Normalization function
const DatabaseService = require('./databaseService'); //database connection

const db = new DatabaseService();

//This runs a baseline non-AI rule-based test using your pattern matcher (findBestPattern)
//This basically Normalizes incoming questions
//And for each question it will: *run findbestPattern() to get an AI answer and confidence
//*Track whether its correct and store reasoning/confidence
//Computes a test-wide metrics like accuracy, average, confidence, duration.
//then saves everything to database and returns detailed result payload

//HIGHLIGHT-> This is technically used as my control group to compare against AI agents
//Records number of pattern matches with confidence > 0.5 for metadata
async function runPatternMatcherTestWithStorage(req, res) {
  const startTime = Date.now();
  
  try {
    const { questions, testName = 'Pattern Matcher Test' } = req.body;
    
    console.log('🔧 RUNNING PATTERN MATCHER TEST WITH DATABASE STORAGE...');
    
    const findBestPattern = require('../ai/PatternMatcher');
    const normalizedQuestions = questions.map(q => UniversalQuestionHandler.normalizeQuestion(q));
    const results = [];
    let correctCount = 0;
    let totalProcessingTime = 0;

    for (const question of normalizedQuestions) {
      const questionStartTime = Date.now();
      
      try {
        const patternResult = findBestPattern(question.text, question.options);
        
        let aiAnswer, confidence, reasoning;
        if (patternResult) {
          aiAnswer = patternResult.answer;
          confidence = patternResult.confidence;
          reasoning = patternResult.reasoning;
        } else {
          aiAnswer = 'A';
          confidence = 0.25;
          reasoning = 'No pattern match found, using default';
        }
        
        const processingTime = Date.now() - questionStartTime;
        totalProcessingTime += processingTime;
        
        const isCorrect = aiAnswer === question.correct;
        if (isCorrect) correctCount++;
        
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: aiAnswer,
          ai_answer: aiAnswer,
          correctAnswer: question.correct,
          isCorrect: isCorrect,
          is_correct: isCorrect,
          confidence: confidence,
          reasoning: reasoning,
          processing_time: processingTime,
          source: 'pattern_matcher'
        });
        
        console.log(`Q${question.id}: ${isCorrect ? '✅' : '❌'} ${aiAnswer} (${(confidence*100).toFixed(0)}%)`);
        
      } catch (error) {
        console.log(`Q${question.id}: ❌ ERROR - ${error.message}`);
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: 'ERROR',
          ai_answer: 'ERROR',
          correctAnswer: question.correct,
          isCorrect: false,
          is_correct: false,
          confidence: 0,
          reasoning: `Error: ${error.message}`,
          processing_time: 0,
          source: 'pattern_matcher_error'
        });
      }
    }
    
    const testDuration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (correctCount / normalizedQuestions.length) * 100;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const avgProcessingTime = Math.round(totalProcessingTime / normalizedQuestions.length);

    //Save to database
    const dbData = {
      test_name: testName,
      agent_type: 'pattern',
      questions_tested: normalizedQuestions.length,
      correct_answers: correctCount,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      total_processing_time: totalProcessingTime,
      test_duration: testDuration,
      metadata: {
        test_type: 'pattern_matcher_only',
        total_patterns_matched: results.filter(r => r.confidence > 0.5).length
      },
      question_results: results.map(r => ({
        question_id: r.questionId,
        question_text: r.question_text,
        question_category: r.question_category,
        correct_answer: r.correct_answer,
        ai_answer: r.ai_answer,
        is_correct: r.is_correct,
        confidence: r.confidence,
        processing_time: r.processing_time,
        reasoning: r.reasoning
      }))
    };

    const testRunId = await db.saveTestRun(dbData);
    
    console.log(`\n🔧 PATTERN MATCHER RESULTS (CONTROL):`);
    console.log(`Score: ${correctCount}/${normalizedQuestions.length} (${accuracy.toFixed(1)}%)`);
    console.log(`Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Test Duration: ${testDuration}s`);
    console.log(`Saved to database with ID: ${testRunId}`);
    
    res.json({
      test_run_id: testRunId,
      test_type: 'pattern_matcher_only',
      score: `${correctCount}/${normalizedQuestions.length}`,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      test_duration: testDuration,
      passed: accuracy >= 98,
      is_control_case: true,
      detailed_results: results
    });
    
  } catch (error) {
    console.error('🚨 PATTERN MATCHER TEST ERROR:', error);
    res.status(500).json({
      error: 'Pattern matcher test failed',
      details: error.message
    });
  }
}


//So this function runs GPT-4o on all questions with enhanced retry logic and knowledge base validation.
//Heres the core process:
//*Constructs enhanced prompt using createEnhancedMedicalPrompt from MedicalKnowledgeIntegrator(Knowledge Base) if its available.
//*Run OpenAI's GPT-4o vis callOpenAI() with prompt
//*Extract answer, confidence, reasoning.
//*If confidence is high but knowledge base (KB) disagrees, then: it will run a aggressive retry to force justification or force KB recommendation
//*If no validation issues -> Optionally run gentle retry to tone down over-confidence
//*Save final results and retry metadata.
//HIGHLIGHT -> THIS IS THE AI AGENT THAT I WORKED INTENSIVELY ON
//Important to note its integration of knowledge base validation using MedicalKnowledgeIntegrator, Implements an aggressive retry logic, 
//Handles extarction failures gracefully, and tracks problematic questions for future testing(super duper useful)
async function runGPT4oTestWithStorage(req, res) {
  const startTime = Date.now();
  
  try {
    const { questions, testName = 'GPT-4o Test' } = req.body;
    
    console.log('🤖 RUNNING GPT-4O TEST WITH DATABASE STORAGE...');
    
    const OpenAIClient = require('../ai/callOpenAIClient');
    const { extractAllResponseData } = require('../utils/responseParser'); // ✅ This path is correct
    
    const openaiClient = new OpenAIClient();
    if (!openaiClient.openai) {
      return res.status(400).json({ error: 'OpenAI not available' });
    }
    
    const normalizedQuestions = questions.map(q => UniversalQuestionHandler.normalizeQuestion(q));
    const results = [];
    let correctCount = 0;
    let totalProcessingTime = 0;
    
    //Track questions that commonly fail for retry logic
    const problematicQuestions = new Set();

    for (const question of normalizedQuestions) {
      const questionStartTime = Date.now();
      
      try {
        let promptToUse;
        let integrator = null;
        
        try {
          //Try to load the knowledge base integration
          const { createEnhancedMedicalPrompt, MedicalKnowledgeIntegrator } = require('../knowledge/MedicalKnowledgeIntegrator');
          const extractMedicalKeywords = require('../utils/KeywordExtractor');
          
          const keywords = extractMedicalKeywords(question.text);
          promptToUse = createEnhancedMedicalPrompt(question, question.options, keywords);
          integrator = new MedicalKnowledgeIntegrator();
          
          console.log(`🧠 Using enhanced KB prompt for Q${question.id}`);
        } catch (kbError) {
          console.log(`⚠️ KB integration failed, using basic prompt: ${kbError.message}`);
          
          //Fallback to basic prompt -> took from prompt.js
          promptToUse = `You are a medical coding expert. Analyze this question:

QUESTION: ${question.text}

OPTIONS:
A. ${question.options.A}
B. ${question.options.B}
C. ${question.options.C}
D. ${question.options.D}

Provide your answer in this format:
ANSWER: [A/B/C/D]
CONFIDENCE: [0.0-1.0]
REASONING: [Your explanation]`;
        }

        console.log(`\n🔍 Processing Q${question.id}...`);
        
        //Initial attempt
        const openaiResponse = await openaiClient.callOpenAI(promptToUse, {
          temperature: 0.1,
          max_tokens: 1000
        });
        
        //Safe extraction with proper error handling
        let responseData;
        try {
          responseData = extractAllResponseData(openaiResponse);
        } catch (extractError) {
          console.log(`❌ Extraction error: ${extractError.message}`);
          responseData = {
            answer: 'A',
            confidence: 0.3,
            reasoning: `Extraction failed: ${extractError.message}`
          };
        }
        
        let aiAnswer = responseData.answer || 'A';
        let confidence = responseData.confidence || 0.5; //Always ensure confidence has a value
        let reasoning = responseData.reasoning || 'Default reasoning due to extraction failure';
        
        console.log(`📊 Initial response: Answer=${aiAnswer}, Confidence=${confidence}`);
        
        //RETRY LOGIC WITH KNOWLEDGE BASE VALIDATION (if available)
        let validation = { 
          isValid: true, 
          confidence: 0.5, 
          reasoning: 'No validation performed', 
          warnings: [] 
        }; //Default validation
        
        if (integrator) {
          try {
            validation = integrator.validateAnswer(question.text, aiAnswer, question.options);
            console.log(`🔍 KB Validation: Valid=${validation.isValid}, KB Confidence=${validation.confidence}, Warnings=${validation.warnings.length}`);
          } catch (validationError) {
            console.log(`⚠️ Validation error: ${validationError.message}`);
            //Keep default validation on error
          }
        } else {
          console.log(`📝 No integrator available - skipping KB validation`);
        }
        
         //ULTRA-AGGRESSIVE RETRY LOGIC - Force AI to follow KB recommendations
        if (validation.warnings.length > 0 || confidence >= 0.95 || problematicQuestions.has(question.id)) {
          console.log(`🔄 FORCED RETRY - KB warnings: ${validation.warnings.length}, High confidence: ${confidence >= 0.95}, Known difficult: ${problematicQuestions.has(question.id)}`);
          
          if (validation.warnings.length > 0) {
            console.log(`⚠️ KB Validation warnings: ${validation.warnings.join('; ')}`);
            
            //EXTRACT THE RECOMMENDED ANSWER FROM KB WARNING
            let kbRecommendedAnswer = null;
            validation.warnings.forEach(warning => {
              const match = warning.match(/Pattern suggests (\w+)/i);
              if (match) {
                //Convert code to option letter
                const suggestedCode = match[1];
                Object.keys(question.options).forEach(letter => {
                  if (question.options[letter] === suggestedCode) {
                    kbRecommendedAnswer = letter;
                  }
                });
              }
            });
            
            if (kbRecommendedAnswer && kbRecommendedAnswer !== aiAnswer) {
              console.log(`🎯 KB STRONGLY RECOMMENDS: ${kbRecommendedAnswer} instead of ${aiAnswer}`);
              
              //FORCE THE AI TO JUSTIFY WHY IT'S IGNORING THE KB (why why why whyyy)
              const aggressivePrompt = `🚨 CRITICAL ERROR DETECTED 🚨

The medical coding knowledge base STRONGLY DISAGREES with your answer!

QUESTION: ${question.text}

OPTIONS:
A. ${question.options.A}
B. ${question.options.B}  
C. ${question.options.C}
D. ${question.options.D}

YOUR ANSWER: ${aiAnswer} (${question.options[aiAnswer]})
KNOWLEDGE BASE RECOMMENDATION: ${kbRecommendedAnswer} (${question.options[kbRecommendedAnswer]})

The knowledge base has high confidence that ${kbRecommendedAnswer} is correct.

🚨 YOU MUST EITHER:
1. CHANGE your answer to ${kbRecommendedAnswer} (recommended)
2. OR provide COMPELLING medical coding evidence why ${aiAnswer} is better than ${kbRecommendedAnswer}

If you cannot provide strong evidence against the knowledge base, you MUST change your answer.

ANSWER: [A/B/C/D]
CONFIDENCE: [0.0-1.0]
REASONING: [If keeping ${aiAnswer}, provide compelling evidence. If changing to ${kbRecommendedAnswer}, explain why KB is correct]`;

              try {
                const aggressiveResponse = await openaiClient.callOpenAI(aggressivePrompt, {
                  temperature: 0.1, //Very low temperature for consistency
                  max_tokens: 600
                });
                
                const aggressiveData = extractAllResponseData(aggressiveResponse);
                
                //If AI STILL doesn't change, FORCE the KB recommendation
                if (aggressiveData.answer && aggressiveData.answer === kbRecommendedAnswer) {
                  console.log(`✅ AI ACCEPTED KB RECOMMENDATION: ${aiAnswer} -> ${kbRecommendedAnswer}`);
                  aiAnswer = aggressiveData.answer;
                  confidence = Math.min(aggressiveData.confidence || 0.8, 0.9);
                  reasoning = `KB-CORRECTED: ${aggressiveData.reasoning || 'Changed to follow knowledge base recommendation'}`;
                } else if (aggressiveData.answer === aiAnswer) {
                  console.log(`⚠️ AI REJECTED KB with reasoning: ${aggressiveData.reasoning?.substring(0, 100)}...`);
                  //Keep original but reduce confidence significantly
                  confidence = Math.min(confidence * 0.6, 0.7);
                  reasoning = `KB-DISPUTED: ${aggressiveData.reasoning || reasoning}`;
                } else {
                  //AI chose a third option - this is unexpected
                  console.log(`🤔 AI chose unexpected option: ${aggressiveData.answer}`);
                  aiAnswer = aggressiveData.answer || aiAnswer;
                  confidence = aggressiveData.confidence || 0.6;
                  reasoning = `UNEXPECTED: ${aggressiveData.reasoning || reasoning}`;
                }
                
              } catch (aggressiveError) {
                console.log(`❌ Aggressive retry failed: ${aggressiveError.message}`);
                //If aggressive retry fails, at least reduce confidence
                confidence = Math.min(confidence * 0.7, 0.8);
                reasoning = `KB-WARNING-IGNORED: ${reasoning}`;
              }
            }
          } else {
            //High confidence but no KB warnings - use gentler retry
            const gentlePrompt = `You answered with very high confidence (${confidence}). Please double-check:

QUESTION: ${question.text}

OPTIONS:
A. ${question.options.A}
B. ${question.options.B}
C. ${question.options.C}
D. ${question.options.D}

Your answer: ${aiAnswer}
Your confidence: ${confidence}

Please verify your answer is correct and be more conservative with confidence.

ANSWER: [A/B/C/D]
CONFIDENCE: [0.0-1.0 - be more conservative]
REASONING: [Brief verification]`;

            try {
              const gentleResponse = await openaiClient.callOpenAI(gentlePrompt, {
                temperature: 0.15,
                max_tokens: 400
              });
              
              const gentleData = extractAllResponseData(gentleResponse);
              
              if (gentleData.answer !== aiAnswer) {
                console.log(`📝 GENTLE RETRY: Answer ${aiAnswer}->${gentleData.answer}, Confidence ${confidence}->${gentleData.confidence}`);
                aiAnswer = gentleData.answer || aiAnswer;
                confidence = gentleData.confidence || confidence;
                reasoning = `RECONSIDERED: ${gentleData.reasoning || reasoning}`;
              } else {
                console.log(`✅ GENTLE RETRY: Confirmed ${aiAnswer}, reduced confidence to ${Math.min(gentleData.confidence || confidence, 0.85)}`);
                confidence = Math.min(gentleData.confidence || confidence, 0.85);
                reasoning = `VERIFIED: ${gentleData.reasoning || reasoning}`;
              }
              
            } catch (gentleError) {
              console.log(`❌ Gentle retry failed: ${gentleError.message}`);
              confidence = Math.min(confidence, 0.85);
            }
          }
          
          //Add delay after retry
          await new Promise(resolve => setTimeout(resolve, 200));
        } else if (confidence >= 0.90) {
          console.log(`✅ High confidence (${confidence}) with no validation concerns - keeping answer ${aiAnswer}`);
        }
        
        const processingTime = Date.now() - questionStartTime;
        totalProcessingTime += processingTime;
        
        const isCorrect = aiAnswer === question.correct;
        if (isCorrect) correctCount++;
        
        //LOG HIGH CONFIDENCE ERRORS FOR ANALYSIS
        if (!isCorrect && confidence > 0.8) {
          console.log(`\n🚨 HIGH CONFIDENCE ERROR - Q${question.id}:`);
          console.log(`Question: ${question.text.substring(0, 100)}...`);
          console.log(`AI chose: ${aiAnswer} (${question.options[aiAnswer]})`);
          console.log(`Correct: ${question.correct} (${question.options[question.correct]})`);
          console.log(`Confidence: ${confidence}`);
          console.log(`Reasoning: ${reasoning.substring(0, 200)}...`);
          console.log(`---`);
          
          //Add to problematic questions for future runs
          problematicQuestions.add(question.id);
        }
        
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: aiAnswer,
          ai_answer: aiAnswer,
          correctAnswer: question.correct,
          isCorrect: isCorrect,
          is_correct: isCorrect,
          confidence: confidence,
          reasoning: reasoning,
          processing_time: processingTime,
          source: confidence >= 0.95 ? 'gpt4o_high_confidence' : 'gpt4o_standard'
        });
        
        console.log(`Q${question.id}: ${isCorrect ? '✅' : '❌'} ${aiAnswer} (${(confidence*100).toFixed(0)}%)`);
        
      } catch (error) {
        console.log(`Q${question.id}: ❌ ERROR - ${error.message}`);
        console.error('Full error:', error);
        
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: 'ERROR',
          ai_answer: 'ERROR',
          correctAnswer: question.correct,
          isCorrect: false,
          is_correct: false,
          confidence: 0,
          reasoning: `Error: ${error.message}`,
          processing_time: 0,
          source: 'gpt4o_error'
        });
      }
      
      //Rate limiting pause
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const testDuration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (correctCount / normalizedQuestions.length) * 100;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const avgProcessingTime = Math.round(totalProcessingTime / normalizedQuestions.length);

    //Save to database
    const dbData = {
      test_name: testName,
      agent_type: 'gpt4o',
      questions_tested: normalizedQuestions.length,
      correct_answers: correctCount,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      total_processing_time: totalProcessingTime,
      test_duration: testDuration,
      metadata: {
        test_type: 'gpt4o_with_retry',
        model_used: 'gpt-4',
        openai_version: 'latest',
        retry_logic_enabled: true
      },
      question_results: results.map(r => ({
        question_id: r.questionId,
        question_text: r.question_text,
        question_category: r.question_category,
        correct_answer: r.correct_answer,
        ai_answer: r.ai_answer,
        is_correct: r.is_correct,
        confidence: r.confidence,
        processing_time: r.processing_time,
        reasoning: r.reasoning
      }))
    };

    const testRunId = await db.saveTestRun(dbData);
    
    console.log(`\n🤖 GPT-4O ENHANCED RESULTS:`);
    console.log(`Score: ${correctCount}/${normalizedQuestions.length} (${accuracy.toFixed(1)}%)`);
    console.log(`Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Test Duration: ${testDuration}s`);
    console.log(`Problematic Questions: ${Array.from(problematicQuestions).join(', ')}`);
    console.log(`Saved to database with ID: ${testRunId}`);
    
    res.json({
      test_run_id: testRunId,
      test_type: 'gpt4o_enhanced',
      score: `${correctCount}/${normalizedQuestions.length}`,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      test_duration: testDuration,
      passed: accuracy >= 98,
      ai_agent_type: 'enhanced_medical_coding_llm',
      problematic_questions: Array.from(problematicQuestions),
      detailed_results: results
    });
    
  } catch (error) {
    console.error('🚨 GPT-4O ENHANCED TEST ERROR:', error);
    res.status(500).json({
      error: 'GPT-4o enhanced test failed',
      details: error.message
    });
  }
}

//This functions purpose if to run my CustomMedicalCodingAgent on each question and store the results
//Here are the Key functionalities:
//*Uses my internal processQuestion() method, which runs: Concept extraction(anatomy, procedures, etc), rule-based reasoning,
//category-specific logic, confidence calibration.
//*Stores advanced metadata: reasoning, categories, concepts.
//*Aggregates total performance (accuracy, average, confidence, etc).
//*Saves results via DatabaseService
//HIGHLIGHTS -> This function uses a modular, rule-enhanced internal agent
//It tracks concepts and categories for each question and is designed to be comparable to GPT-4o
async function runCustomAgentTestWithStorage(req, res) {
  const startTime = Date.now();
  
  try {
    const { questions, testName = 'Custom Agent Test' } = req.body;
    
    console.log('🎯 RUNNING CUSTOM AGENT TEST WITH DATABASE STORAGE...');
    
    const customOnlyService = new MedicalCodingService2();
    customOnlyService.useCustomAgent = true;
    await customOnlyService.initialize();
    
    const normalizedQuestions = questions.map(q => UniversalQuestionHandler.normalizeQuestion(q));
    const results = [];
    let correctCount = 0;
    let totalProcessingTime = 0;

    for (const question of normalizedQuestions) {
      try {
        const result = await customOnlyService.customAgent.processQuestion({
          question: question.text,
          options: question.options
        });
        
        totalProcessingTime += (result.processingTime || 0);
        
        const isCorrect = result.answer === question.correct;
        if (isCorrect) correctCount++;
        
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: result.answer,
          ai_answer: result.answer,
          correctAnswer: question.correct,
          isCorrect: isCorrect,
          is_correct: isCorrect,
          confidence: result.confidence,
          reasoning: result.reasoning,
          processing_time: result.processingTime || 0,
          category: result.category,
          concepts: result.concepts,
          source: 'custom_agent'
        });
        
        console.log(`Q${question.id}: ${isCorrect ? '✅' : '❌'} ${result.answer} (${(result.confidence*100).toFixed(0)}%)`);
        
      } catch (error) {
        console.log(`Q${question.id}: ❌ ERROR - ${error.message}`);
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: 'ERROR',
          ai_answer: 'ERROR',
          correctAnswer: question.correct,
          isCorrect: false,
          is_correct: false,
          confidence: 0,
          reasoning: `Error: ${error.message}`,
          processing_time: 0,
          source: 'custom_agent_error'
        });
      }
    }
    
    const testDuration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (correctCount / normalizedQuestions.length) * 100;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const avgProcessingTime = Math.round(totalProcessingTime / normalizedQuestions.length);

    //Save to database
    const dbData = {
      test_name: testName,
      agent_type: 'custom',
      questions_tested: normalizedQuestions.length,
      correct_answers: correctCount,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      total_processing_time: totalProcessingTime,
      test_duration: testDuration,
      metadata: {
        test_type: 'custom_agent_only',
        agent_performance: customOnlyService.customAgent.performanceMetrics
      },
      question_results: results.map(r => ({
        question_id: r.questionId,
        question_text: r.question_text,
        question_category: r.question_category,
        correct_answer: r.correct_answer,
        ai_answer: r.ai_answer,
        is_correct: r.is_correct,
        confidence: r.confidence,
        processing_time: r.processing_time,
        reasoning: r.reasoning
      }))
    };

    const testRunId = await db.saveTestRun(dbData);
    
    console.log(`\n🎯 CUSTOM AGENT RESULTS (AI AGENT #2):`);
    console.log(`Score: ${correctCount}/${normalizedQuestions.length} (${accuracy.toFixed(1)}%)`);
    console.log(`Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Test Duration: ${testDuration}s`);
    console.log(`Saved to database with ID: ${testRunId}`);
    
    res.json({
      test_run_id: testRunId,
      test_type: 'custom_agent_only',
      score: `${correctCount}/${normalizedQuestions.length}`,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      test_duration: testDuration,
      passed: accuracy >= 98,
      agent_performance: customOnlyService.customAgent.performanceMetrics,
      detailed_results: results
    });
    
  } catch (error) {
    console.error('🚨 CUSTOM AGENT TEST ERROR:', error);
    res.status(500).json({
      error: 'Custom agent test failed',
      details: error.message
    });
  }
}

//This function combines GPT-4o and the custom agent. Choose best answer using ensemble logic.
//This is how it works:
//*Run both agents in parallel using Promise.allSettled
//*Compare answers: If they agree -> pick shared answer and boost confidence
//if they disagree -> choose one with higher confidence
//*Store metadata showing agent agreement, fallback usage, etc.
//HIGHLIGHTS -> They measures and reports agreement rate between models
//It will choose safer or more trusted answer.
//Tracks if fallback occurred (ex. one agent fails)
async function runEnsembleTestWithStorage(req, res) {
  const startTime = Date.now();
  
  try {
    const { questions, testName = 'Ensemble Test' } = req.body;
    
    console.log('🎯 RUNNING ENSEMBLE TEST WITH DATABASE STORAGE...');
    
    //Initialize both AI systems
    const customOnlyService = new MedicalCodingService2();
    customOnlyService.useCustomAgent = true;
    await customOnlyService.initialize();
    
    const OpenAIClient = require('../ai/callOpenAIClient');
    const { extractAnswer, extractConfidence, extractReasoning } = require('../utils/responseParser');
    const openaiClient = new OpenAIClient();
    
    if (!openaiClient.openai) {
      return res.status(400).json({ error: 'OpenAI not available for ensemble' });
    }
    
    const normalizedQuestions = questions.map(q => UniversalQuestionHandler.normalizeQuestion(q));
    const results = [];
    let correctCount = 0;
    let totalProcessingTime = 0;

    for (const question of normalizedQuestions) {
      const questionStartTime = Date.now();
      
      try {
        //Get both AI agent results
        const [customResult, gpt4oResponse] = await Promise.allSettled([
          customOnlyService.customAgent.processQuestion({
            question: question.text,
            options: question.options
          }),
          openaiClient.callOpenAI(question.text, question.options)
        ]);
        
        let finalAnswer, finalConfidence, finalReasoning;
        let ensembleMetadata = {};
        
        //Ensemble logic
        if (customResult.status === 'fulfilled' && gpt4oResponse.status === 'fulfilled') {
          const customAnswer = customResult.value.answer;
          const customConf = customResult.value.confidence;
          
          const gpt4oAnswer = extractAnswer(gpt4oResponse.value);
          const gpt4oConf = extractConfidence(gpt4oResponse.value);
          
          ensembleMetadata = {
            custom_answer: customAnswer,
            custom_confidence: customConf,
            gpt4o_answer: gpt4oAnswer,
            gpt4o_confidence: gpt4oConf,
            agreement: customAnswer === gpt4oAnswer
          };
          
          if (customAnswer === gpt4oAnswer) {
            //Agreement - boost confidence
            finalAnswer = customAnswer;
            finalConfidence = Math.min(0.98, Math.max(customConf, gpt4oConf) + 0.1);
            finalReasoning = `Both AI agents agree: ${customAnswer}`;
          } else {
            //Disagreement - use higher confidence
            if (customConf > gpt4oConf) {
              finalAnswer = customAnswer;
              finalConfidence = customConf;
              finalReasoning = `Custom agent (${customConf.toFixed(2)}) vs GPT-4o (${gpt4oConf.toFixed(2)})`;
            } else {
              finalAnswer = gpt4oAnswer;
              finalConfidence = gpt4oConf;
              finalReasoning = `GPT-4o (${gpt4oConf.toFixed(2)}) vs Custom agent (${customConf.toFixed(2)})`;
            }
          }
        } else if (customResult.status === 'fulfilled') {
          finalAnswer = customResult.value.answer;
          finalConfidence = customResult.value.confidence;
          finalReasoning = 'Custom agent only (GPT-4o failed)';
          ensembleMetadata = { custom_only: true, gpt4o_failed: true };
        } else if (gpt4oResponse.status === 'fulfilled') {
          finalAnswer = extractAnswer(gpt4oResponse.value);
          finalConfidence = extractConfidence(gpt4oResponse.value);
          finalReasoning = 'GPT-4o only (Custom agent failed)';
          ensembleMetadata = { gpt4o_only: true, custom_failed: true };
        } else {
          throw new Error('Both AI agents failed');
        }
        
        const processingTime = Date.now() - questionStartTime;
        totalProcessingTime += processingTime;
        
        const isCorrect = finalAnswer === question.correct;
        if (isCorrect) correctCount++;
        
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: finalAnswer,
          ai_answer: finalAnswer,
          correctAnswer: question.correct,
          isCorrect: isCorrect,
          is_correct: isCorrect,
          confidence: finalConfidence,
          reasoning: finalReasoning,
          processing_time: processingTime,
          source: 'ensemble',
          ensemble_metadata: ensembleMetadata
        });
        
        console.log(`Q${question.id}: ${isCorrect ? '✅' : '❌'} ${finalAnswer} (${(finalConfidence*100).toFixed(0)}%)`);
        
      } catch (error) {
        console.log(`Q${question.id}: ❌ ERROR - ${error.message}`);
        results.push({
          questionId: question.id,
          question_text: question.text,
          question_category: question.category,
          correct_answer: question.correct,
          aiAnswer: 'ERROR',
          ai_answer: 'ERROR',
          correctAnswer: question.correct,
          isCorrect: false,
          is_correct: false,
          confidence: 0,
          reasoning: `Error: ${error.message}`,
          processing_time: 0,
          source: 'ensemble_error'
        });
      }
      
      //Rate limiting pause
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const testDuration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = (correctCount / normalizedQuestions.length) * 100;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const avgProcessingTime = Math.round(totalProcessingTime / normalizedQuestions.length);

    //Calculate ensemble-specific metrics
    const agreementCount = results.filter(r => 
      r.ensemble_metadata && r.ensemble_metadata.agreement === true
    ).length;
    const agreementRate = (agreementCount / normalizedQuestions.length) * 100;

    //Save to database
    const dbData = {
      test_name: testName,
      agent_type: 'ensemble',
      questions_tested: normalizedQuestions.length,
      correct_answers: correctCount,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      total_processing_time: totalProcessingTime,
      test_duration: testDuration,
      metadata: {
        test_type: 'ensemble',
        agreement_rate: agreementRate,
        agreement_count: agreementCount,
        both_agents_used: results.filter(r => 
          r.ensemble_metadata && 
          !r.ensemble_metadata.custom_only && 
          !r.ensemble_metadata.gpt4o_only
        ).length
      },
      question_results: results.map(r => ({
        question_id: r.questionId,
        question_text: r.question_text,
        question_category: r.question_category,
        correct_answer: r.correct_answer,
        ai_answer: r.ai_answer,
        is_correct: r.is_correct,
        confidence: r.confidence,
        processing_time: r.processing_time,
        reasoning: r.reasoning
      }))
    };

    const testRunId = await db.saveTestRun(dbData);
    
    console.log(`\n🎯 ENSEMBLE RESULTS (BOTH AI AGENTS):`);
    console.log(`Score: ${correctCount}/${normalizedQuestions.length} (${accuracy.toFixed(1)}%)`);
    console.log(`Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Agreement Rate: ${agreementRate.toFixed(1)}%`);
    console.log(`Test Duration: ${testDuration}s`);
    console.log(`Saved to database with ID: ${testRunId}`);
    
    res.json({
      test_run_id: testRunId,
      test_type: 'ensemble',
      score: `${correctCount}/${normalizedQuestions.length}`,
      accuracy: accuracy,
      avg_confidence: avgConfidence,
      avg_processing_time: avgProcessingTime,
      test_duration: testDuration,
      agreement_rate: agreementRate,
      passed: accuracy >= 98,
      ai_agent_type: 'ensemble_of_both',
      detailed_results: results
    });
    
  } catch (error) {
    console.error('🚨 ENSEMBLE TEST ERROR:', error);
    res.status(500).json({
      error: 'Ensemble test failed',
      details: error.message
    });
  }
}

//This next functions support analysis and dashboarding:

//Database API endpoints -> retrieves agent performance summary, recent test history, category-level accuracy, and cross-agent comparisons
async function getStoredMetrics(req, res) {
  try {
    const { agent_type, days = 30 } = req.query;
    
    const [performance, history, comparison, categoryPerformance] = await Promise.all([
      db.getAgentPerformance(agent_type),
      db.getTestHistory(agent_type, 20),
      db.getTestComparison(),
      db.getPerformanceByCategory(agent_type)
    ]);

    res.json({
      agent_performance: performance,
      test_history: history,
      comparison: comparison,
      category_performance: categoryPerformance,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      details: error.message
    });
  }
}

//Returns daily breakdowns by agent over n days and Helps with visualizing trends and improvements.
async function getDetailedComparison(req, res) {
  try {
    const { days = 7 } = req.query;
    
    const detailedData = await db.getDetailedComparison(days);
    
    //Group by agent type for easier frontend processing
    const groupedData = {};
    detailedData.forEach(row => {
      if (!groupedData[row.agent_type]) {
        groupedData[row.agent_type] = [];
      }
      groupedData[row.agent_type].push(row);
    });

    res.json({
      detailed_comparison: detailedData,
      grouped_by_agent: groupedData,
      days_analyzed: days,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get detailed comparison error:', error);
    res.status(500).json({
      error: 'Failed to retrieve detailed comparison',
      details: error.message
    });
  }
}

//This function deletes test results by ID
async function deleteTestRun(req, res) {
  try {
    const { testRunId } = req.params;
    
    await db.deleteTestRun(testRunId);
    
    res.json({
      message: 'Test run deleted successfully',
      test_run_id: testRunId
    });
    
  } catch (error) {
    console.error('Delete test run error:', error);
    res.status(500).json({
      error: 'Failed to delete test run',
      details: error.message
    });
  }
}

//Returns all question-level results for a specific test run ID
async function getQuestionResults(req, res) {
  try {
    const { testRunId } = req.params;
    
    const questionResults = await db.getQuestionResults(testRunId);
    
    res.json({
      test_run_id: testRunId,
      question_results: questionResults,
      total_questions: questionResults.length
    });
    
  } catch (error) {
    console.error('Get question results error:', error);
    res.status(500).json({
      error: 'Failed to retrieve question results',
      details: error.message
    });
  }
}

module.exports = {
  //Super cool test functions with database storage
  runPatternMatcherTestWithStorage,
  runGPT4oTestWithStorage,
  runCustomAgentTestWithStorage,
  runEnsembleTestWithStorage,
  
  //Database API functions
  getStoredMetrics,
  getDetailedComparison,
  deleteTestRun,
  getQuestionResults,
  
  //Original functions (for backwards compatibility)
  runPatternMatcherOnlyTest: runPatternMatcherTestWithStorage,
  runGPT4oOnlyTest: runGPT4oTestWithStorage,
  runCustomAgentTest: runCustomAgentTestWithStorage,
  runEnsembleTest: runEnsembleTestWithStorage
};

//HERES WHAT MAKES THIS POWERFUL:
//Integrates three agent types: rule-based, GPT-4o, and my custom ai agent.
//Auto-saves every run to PostgreSQL for persistent tracking.
//Retry logic gives GPT-4o a chance to self-correct based on structured rules.
//Comparison-ready: allows ensemble testing and side-by-side evaluation.
//Highly modular and can scale with new agents or test types.