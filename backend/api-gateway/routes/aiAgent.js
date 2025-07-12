const express = require('express');
const router = express.Router(); //to define endpoints

//Import Test runners with PostgresSQL database storage, dont forget to connect to database :)
//Each is a controller that runs a specific test (like pattern-matcher or GPT-4o) then stores the results in the database
const {
  runPatternMatcherTestWithStorage,
  runGPT4oTestWithStorage,
  runCustomAgentTestWithStorage,
  runEnsembleTestWithStorage,
  getStoredMetrics,
  getDetailedComparison,
  deleteTestRun,
  getQuestionResults
} = require('../services/TestRunner');

//Import the updated service
//This is the gpt/pattern logic/ensemble logic/custom ai logic wrapper
const { MedicalCodingService2 } = require('../services/MedicalCodingService2');

//Initialize the updated AI agent
const medicalAI = new MedicalCodingService2();

//Initialize on first load since intialization is quite expensive ( GPT 4o Keys :P )
let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    await medicalAI.initialize();
    isInitialized = true;
  }
}

//Homepage Routes that just explains what my API does -- useful for my vue.js browser
router.get('/', (req, res) => {
  res.json({ 
    message: 'Enhanced Medical Coding AI Analysis System',
    features: [
      'Custom Medical Coding Agent with specialized reasoning',
      'OpenAI GPT-4o integration',
      'Pattern matching control system',
      'Ensemble AI agent combination',
      'PostgreSQL metrics storage',
      'Persistent performance tracking',
      'Detailed test comparison analytics'
    ],
    target: '98%+ accuracy',
    available_tests: [
      'POST /pattern-matcher-test - Control case (rule-based)',
      'POST /gpt4o-test - AI Agent #1 (GPT-4o)',
      'POST /custom-agent-test - AI Agent #2 (Custom)',
      'POST /ensemble-test - Both AI agents combined',
      'GET /metrics - Retrieve stored performance metrics',
      'GET /comparison - Detailed agent comparison data'
    ],
    database_features: [
      'Persistent test result storage',
      'Performance trend analysis',
      'Question-level result tracking',
      'Agent comparison metrics'
    ]
  });
});

// ==================== EXPERIMENTAL TESTS WITH DATABASE STORAGE ====================

//These endpoints will:
//*Take in a list of questions
//*Run them through one specific agent
//*Store the test run results in the database
//*Return metrics like accuracy and test run ID

//Control Test: Pattern Matcher (Non-AI Baseline - My Control Case)
router.post('/pattern-matcher-test', runPatternMatcherTestWithStorage);

//AI Agent #1: GPT-4o Test
router.post('/gpt4o-test', runGPT4oTestWithStorage);

//AI Agent #2: Custom Agent Test  
router.post('/custom-agent-test', runCustomAgentTestWithStorage);

//Ensemble: Both AI Agents Combined (No Pattern Matcher)
router.post('/ensemble-test', runEnsembleTestWithStorage);

// ==================== DATABASE METRICS AND ANALYTICS ====================

//These routes will:
//*Get general accuracy/performance stats
//*See how agents answered the same questions differently
//*Get per-question answers for specific test-run
//*Deletes test data if needed

//Get stored performance metrics
router.get('/metrics', getStoredMetrics);

//Get detailed comparison data
router.get('/comparison', getDetailedComparison);

//Get question-level results for a specific test run
router.get('/test-run/:testRunId/questions', getQuestionResults);

//Delete a specific test run
router.delete('/test-run/:testRunId', deleteTestRun);

//Get agent performance summary
//This endpoint will:
//*Loads performance data from the DB for all agents
//*Calculates: Which agent is best, whether target (98%) was met,
//Average accuracy and total questions per agent, improvement over ther rule-based pattern agent
//*It will also return a full summary with improvement deltas
router.get('/agent-summary', async (req, res) => {
  try {
    const DatabaseService = require('../services/databaseService');
    const db = new DatabaseService();
    
    const performance = await db.getAgentPerformance();
    const comparison = await db.getTestComparison();
    
    //Calculate improvement metrics
    const patternPerf = performance.find(p => p.agent_type === 'pattern');
    const improvements = performance.map(p => ({
      ...p,
      improvement_over_control: patternPerf ? 
        (p.avg_accuracy - patternPerf.avg_accuracy).toFixed(1) : 0
    }));
    
    res.json({
      agent_performance: improvements,
      test_comparison: comparison,
      summary: {
        total_tests: performance.reduce((sum, p) => sum + p.total_tests, 0),
        total_questions: performance.reduce((sum, p) => sum + p.total_questions, 0),
        best_agent: performance.find(p => p.avg_accuracy === Math.max(...performance.map(a => a.avg_accuracy))),
        target_achieved: performance.some(p => p.best_accuracy >= 98)
      }
    });
    
  } catch (error) {
    console.error('Agent summary error:', error);
    res.status(500).json({
      error: 'Failed to get agent summary',
      details: error.message
    });
  }
});

// ==================== BATCH TESTING ====================

//This endpoint will:
//*Accepts a list of questions
//*Runs all 4 agents on them(pattern, custom, GPT-4o, ensemble)
//*Stores each test run is DB
//*Returns: Per-agent, Test-runs for tracking, Best-performing agent, whether any agent hit the 98% target
//Useful for batch testing during development or benchmarking updates

//Run all experiments in sequence with database storage
router.post('/run-all-experiments', async (req, res) => {
  try {
    const { questions, testName = 'Complete_Experimental_Suite' } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ 
        error: 'Missing or invalid questions array' 
      });
    }

    console.log('🧪 RUNNING COMPLETE EXPERIMENTAL SUITE WITH DATABASE STORAGE...');
    console.log(`📊 Testing ${questions.length} questions across 4 methods`);
    
    const results = {
      experiment_name: testName,
      timestamp: new Date().toISOString(),
      questions_tested: questions.length,
      target_accuracy: 98,
      test_run_ids: {},
      results: {}
    };

    //Mock request/response for internal calls
    const createMockRes = (resolve) => ({
      json: resolve,
      status: (code) => ({ json: (data) => resolve({ status: code, ...data }) })
    });
    
    const mockReq = { body: { questions, testName: `${testName}_Pattern` } };

    //1.Pattern Matcher (Control)
    try {
      console.log('\n1️⃣ Running Pattern Matcher (Control)...');
      results.results.pattern_matcher = await new Promise((resolve) => {
        runPatternMatcherTestWithStorage(mockReq, createMockRes(resolve));
      });
      results.test_run_ids.pattern = results.results.pattern_matcher.test_run_id;
    } catch (error) {
      console.error('Pattern matcher failed:', error.message);
      results.results.pattern_matcher = { error: error.message };
    }

    //2.Custom Agent (AI Agent #2)
    try {
      console.log('\n2️⃣ Running Custom Agent (AI Agent #2)...');
      const customReq = { body: { questions, testName: `${testName}_Custom` } };
      results.results.custom_agent = await new Promise((resolve) => {
        runCustomAgentTestWithStorage(customReq, createMockRes(resolve));
      });
      results.test_run_ids.custom = results.results.custom_agent.test_run_id;
    } catch (error) {
      console.error('Custom agent failed:', error.message);
      results.results.custom_agent = { error: error.message };
    }

    //3.GPT-4o (AI Agent #1)
    try {
      console.log('\n3️⃣ Running GPT-4o (AI Agent #1)...');
      const gptReq = { body: { questions, testName: `${testName}_GPT4o` } };
      results.results.gpt4o = await new Promise((resolve) => {
        runGPT4oTestWithStorage(gptReq, createMockRes(resolve));
      });
      results.test_run_ids.gpt4o = results.results.gpt4o.test_run_id;
    } catch (error) {
      console.error('GPT-4o failed:', error.message);
      results.results.gpt4o = { error: error.message };
    }

    //4.Ensemble (Both AI Agents)
    try {
      console.log('\n4️⃣ Running Ensemble (Both AI Agents)...');
      const ensembleReq = { body: { questions, testName: `${testName}_Ensemble` } };
      results.results.ensemble = await new Promise((resolve) => {
        runEnsembleTestWithStorage(ensembleReq, createMockRes(resolve));
      });
      results.test_run_ids.ensemble = results.results.ensemble.test_run_id;
    } catch (error) {
      console.error('Ensemble failed:', error.message);
      results.results.ensemble = { error: error.message };
    }

    //Calculate performance summary
    const summary = {
      pattern_accuracy: results.results.pattern_matcher?.accuracy || 0,
      custom_accuracy: results.results.custom_agent?.accuracy || 0,
      gpt4o_accuracy: results.results.gpt4o?.accuracy || 0,
      ensemble_accuracy: results.results.ensemble?.accuracy || 0
    };

    //Find best performing agent
    const accuracies = [
      { agent: 'pattern', accuracy: summary.pattern_accuracy },
      { agent: 'custom', accuracy: summary.custom_accuracy },
      { agent: 'gpt4o', accuracy: summary.gpt4o_accuracy },
      { agent: 'ensemble', accuracy: summary.ensemble_accuracy }
    ];
    
    summary.best_performing = accuracies.reduce((a, b) => 
      a.accuracy > b.accuracy ? a : b
    );

    summary.ai_improvement = Math.max(
      summary.custom_accuracy - summary.pattern_accuracy,
      summary.gpt4o_accuracy - summary.pattern_accuracy,
      summary.ensemble_accuracy - summary.pattern_accuracy
    );

    summary.target_achieved = Object.values(summary).some(acc => 
      typeof acc === 'number' && acc >= 98
    );

    results.performance_summary = summary;

    console.log('\n🎯 EXPERIMENTAL RESULTS SUMMARY:');
    console.log(`Control (Pattern): ${summary.pattern_accuracy.toFixed(1)}%`);
    console.log(`AI Agent #1 (GPT-4o): ${summary.gpt4o_accuracy.toFixed(1)}%`);
    console.log(`AI Agent #2 (Custom): ${summary.custom_accuracy.toFixed(1)}%`);
    console.log(`Ensemble: ${summary.ensemble_accuracy.toFixed(1)}%`);
    console.log(`Best: ${summary.best_performing.agent} (${summary.best_performing.accuracy.toFixed(1)}%)`);
    console.log(`AI Improvement: +${summary.ai_improvement.toFixed(1)}%`);
    console.log(`Target Achieved: ${summary.target_achieved ? '✅ YES' : '❌ NO'}`);

    res.json(results);

  } catch (error) {
    console.error('🚨 EXPERIMENTAL SUITE ERROR:', error);
    res.status(500).json({
      error: 'Failed to run experimental suite',
      details: error.message
    });
  }
});

// ==================== LEGACY ROUTES (for backwards compatibility) ====================

//Smart Answering Endpoint: this is the live answering route for a single medical coding question
//Its going to support the following logic:
//*agent preference -> custom agent only(Using my Pattern-matching/Decision making/Chatgpt wrapper hybrid)
//or openai_only: Prompt engineering GPT-4o with enhanced decision-making and knowledge base wrapper
//or pattern only: Just the non-ai method for control case

//Enhanced answer endpoint with agent selection
router.post('/answer', async (req, res) => {
  try {
    await ensureInitialized();
    
    const { question, options, agent_preference = 'auto' } = req.body;
    
    if (!question || !options) {
      return res.status(400).json({ 
        error: 'Missing question or options' 
      });
    }

    let result;
    
    switch (agent_preference) {
      case 'custom_only':
        result = await medicalAI.customAgent.processQuestion({ question, options });
        result.source = 'custom_agent_forced';
        break;
        
      case 'openai_only':
        if (medicalAI.openaiClient.openai) {
          const response = await medicalAI.openaiClient.callOpenAI(question, options);
          const { extractAnswer, extractConfidence, extractReasoning } = require('../utils/responseParser');
          result = {
            answer: extractAnswer(response),
            confidence: extractConfidence(response),
            reasoning: extractReasoning(response),
            source: 'openai_forced'
          };
        } else {
          return res.status(400).json({ error: 'OpenAI not available' });
        }
        break;
        
      case 'pattern_only':
        const findBestPattern = require('../ai/PatternMatcher');
        const patternResult = findBestPattern(question, options);
        if (patternResult) {
          result = {
            answer: patternResult.answer,
            confidence: patternResult.confidence,
            reasoning: patternResult.reasoning,
            source: 'pattern_forced'
          };
        } else {
          result = {
            answer: 'A',
            confidence: 0.5,
            reasoning: 'No pattern match found',
            source: 'fallback'
          };
        }
        break;
        
      default:
        result = await medicalAI.answerQuestion(question, options);
    }
    
    res.json(result);

  } catch (error) {
    console.error('Answer endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to process question',
      details: error.message 
    });
  }
});

module.exports = router;