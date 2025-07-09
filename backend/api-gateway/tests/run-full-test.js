
// Full practice test runner
const axios = require('axios');
const fs = require('fs');

async function runFullPracticeTest() {
  console.log('🏥 Medical Coding CPC Practice Test');
  console.log('🎯 Target: 98% accuracy (98/100 questions)');
  console.log('=' * 50);
  
  // Load questions
  const questions = JSON.parse(fs.readFileSync('practice-questions-full.json', 'utf8'));
  
  try {
    console.log('🚀 Starting full practice test...');
    const response = await axios.post('http://localhost:3000/api/ai-agent/practice-test', {
      questions: questions,
      testName: 'CPC_Practice_Test_Full'
    });
    
    const results = response.data;
    
    console.log('\n🎊 FINAL RESULTS:');
    console.log('=' * 30);
    console.log(`Score: ${results.score} (${results.accuracy.toFixed(1)}%)`);
    console.log(`Target: 98% (${Math.ceil(questions.length * 0.98)} correct)`);
    console.log(`Status: ${results.passed ? '🎉 PASSED!' : '📈 Keep optimizing'}`);
    
    if (results.passed) {
      console.log('\n🏆 CONGRATULATIONS! You achieved 98%+ accuracy!');
      console.log('Your AI agent is ready for the real CPC exam!');
    } else {
      const needed = Math.ceil(questions.length * 0.98) - parseInt(results.score.split('/')[0]);
      console.log(`\n💡 Need ${needed} more correct answers to reach 98%`);
      
      // Analyze mistakes
      const mistakes = results.results.filter(r => !r.isCorrect);
      console.log(`\n❌ Mistakes (${mistakes.length}):`);
      mistakes.slice(0, 5).forEach((mistake, i) => {
        console.log(`${i + 1}. Q${mistake.questionId}: Got ${mistake.aiAnswer}, should be ${mistake.correctAnswer}`);
      });
      
      if (mistakes.length > 5) {
        console.log(`   ... and ${mistakes.length - 5} more`);
      }
    }
    
    // Save detailed results
    fs.writeFileSync('test-results-full.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Detailed results saved to test-results-full.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

runFullPracticeTest().catch(console.error);
