<template>
  <div class="container">
    <div class="header">
      <h1>Medical Coding AI Analysis System</h1>
      <p>Clinical Decision Support • AI-Powered Coding Validation • Performance Analytics Dashboard</p>
    </div>

    <!-- Test Controls Dashboard -->
    <div class="dashboard">
      <div class="card test-controls">
        <h3>🧪 Experimental Tests</h3>
        <button class="btn btn-control" @click="runPatternMatcherTest" :disabled="loading">
          🔧 Control Test (Pattern)
        </button>
        <button class="btn btn-ai1" @click="runGPT4oTest" :disabled="loading">
          🤖 AI Agent #1 (GPT-4o)
        </button>
        <button class="btn btn-ai2" @click="runCustomAgentTest" :disabled="loading">
          🎯 AI Agent #2 (Custom)
        </button>
        <button class="btn btn-ensemble" @click="runEnsembleTest" :disabled="loading">
          ⚡ Ensemble (Both AI)
        </button>
        <button class="btn btn-primary" @click="runAllExperiments" :disabled="loading">
          🧪 Run All Experiments
        </button>
      </div>

      <div class="card">
        <h3>📊 Database Metrics</h3>
        <button class="btn btn-secondary" @click="loadStoredMetrics" :disabled="loading">
          📈 Load Performance History
        </button>
        <button class="btn btn-secondary" @click="loadComparison" :disabled="loading">
          📊 Agent Comparison
        </button>
        <button class="btn btn-secondary" @click="loadAgentSummary" :disabled="loading">
          📋 Agent Summary
        </button>
      </div>
    </div>

    <!-- System Status -->
    <div class="card full-width">
      <h3>📊 System Status Monitor</h3>
      <div class="metrics system-status">
        <div class="metric" :class="systemStatus.custom_agent ? 'active' : 'inactive'">
          <div class="metric-label">Custom Agent</div>
          <div class="metric-value">{{ systemStatus.custom_agent ? '🟢 Online' : '🔴 Offline' }}</div>
        </div>
        <div class="metric" :class="systemStatus.openai ? 'active' : 'inactive'">
          <div class="metric-label">OpenAI Service</div>
          <div class="metric-value">{{ systemStatus.openai ? '🟢 Connected' : '🔴 Disconnected' }}</div>
        </div>
        <div class="metric" :class="systemStatus.pattern_matching ? 'active' : 'inactive'">
          <div class="metric-label">Pattern Engine</div>
          <div class="metric-value">{{ systemStatus.pattern_matching ? '🟢 Active' : '🔴 Inactive' }}</div>
        </div>
        <div class="metric" :class="systemStatus.database ? 'active' : 'inactive'">
          <div class="metric-label">Database</div>
          <div class="metric-value">{{ systemStatus.database ? '🟢 Connected' : '🔴 Disconnected' }}</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Current Test Results -->
    <div v-if="currentTestResult" class="card full-width current-result">
      <h3>🎯 Latest Test Result</h3>
      <div class="current-test-grid">
        <div class="test-info">
          <div class="test-title">{{ getAgentName(currentTestResult.test_type || 'unknown') }}</div>
          <div class="test-score" :class="getScoreClass(currentTestResult.accuracy)">
            {{ currentTestResult.score }} ({{ currentTestResult.accuracy?.toFixed(1) }}%)
          </div>
          <div class="test-meta">
            <span>Confidence: {{ (currentTestResult.avg_confidence * 100)?.toFixed(1) }}%</span>
            <span>Duration: {{ currentTestResult.test_duration }}s</span>
            <span v-if="currentTestResult.test_run_id">ID: {{ currentTestResult.test_run_id }}</span>
          </div>
        </div>
        <div class="test-status">
          <div class="status-indicator" :class="currentTestResult.accuracy >= 98 ? 'success' : 'warning'">
            {{ currentTestResult.accuracy >= 98 ? '🎯 Target Achieved!' : '📈 Progress Made' }}
          </div>
          <div v-if="currentTestResult.agreement_rate" class="agreement">
            Agent Agreement: {{ currentTestResult.agreement_rate.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Historical Performance Summary -->
    <div v-if="agentSummary" class="card full-width performance-summary">
      <h3>📈 Historical Performance Summary</h3>
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-label">Total Tests</div>
          <div class="stat-value">{{ agentSummary.summary?.total_tests || 0 }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total Questions</div>
          <div class="stat-value">{{ agentSummary.summary?.total_questions || 0 }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Best Agent</div>
          <div class="stat-value">{{ agentSummary.summary?.best_agent?.agent_type || 'None' }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Target Achieved</div>
          <div class="stat-value" :class="agentSummary.summary?.target_achieved ? 'correct' : 'incorrect'">
            {{ agentSummary.summary?.target_achieved ? '✅ Yes' : '❌ No' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Performance Grid -->
    <div v-if="agentPerformance.length > 0" class="results-grid">
      <div v-for="agent in agentPerformance" :key="agent.agent_type" class="agent-result">
        <div class="agent-title" :class="`${agent.agent_type}-agent`">
          <span>{{ getAgentIcon(agent.agent_type) }}</span>
          {{ getAgentName(agent.agent_type) }}
          <span class="test-count">({{ agent.total_tests }} tests)</span>
        </div>

        <div class="score" :class="getScoreClass(agent.avg_accuracy)">
          {{ agent.avg_accuracy != null ? Number(agent.avg_accuracy).toFixed(2) : 'N/A'}}% avg
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="metric-label">Best Score</div>
            <div class="metric-value">{{ agent.best_accuracy != null ? Number(agent.best_accuracy).toFixed(1) : 'N/A' }}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Questions</div>
            <div class="metric-value">{{ agent.total_questions }}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Avg Confidence</div>
            <div class="metric-value">{{ (agent.avg_confidence * 100)?.toFixed(1) }}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Improvement</div>
            <div class="metric-value" :class="agent.improvement_over_control > 0 ? 'correct' : 'neutral'">
              {{ agent.improvement_over_control > 0 ? '+' : '' }}{{ agent.improvement_over_control }}%
            </div>
          </div>
        </div>

        <div class="agent-actions">
          <button class="btn btn-small" @click="viewAgentHistory(agent.agent_type)">
            📊 View History
          </button>
          <button class="btn btn-small" @click="runSingleAgentTest(agent.agent_type)">
            🧪 Run Test
          </button>
        </div>
      </div>
    </div>

    <!-- Test History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>📊 Test History - {{ selectedAgent }}</h3>
          <button class="modal-close" @click="closeHistoryModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="testHistory.length === 0" class="no-data">
            No test history found for this agent.
          </div>
          <div v-else class="history-list">
            <div v-for="test in testHistory" :key="test.id" class="history-item">
              <div class="history-main">
                <div class="history-score" :class="getScoreClass(test.accuracy)">
                    {{ typeof test.accuracy === 'number' ? test.accuracy.toFixed(1) : 'N/A' }}%
                </div>
                <div class="history-details">
                  <div class="history-name">{{ test.test_name }}</div>
                  <div class="history-meta">
                    {{ test.questions_tested }} questions • 
                    {{ formatDate(test.created_at) }} • 
                    {{ test.test_duration }}s
                  </div>
                </div>
              </div>
              <div class="history-actions">
                <button class="btn btn-small" @click="viewQuestionResults(test.id)">
                  📝 Questions
                </button>
                <button class="btn btn-small btn-danger" @click="deleteTest(test.id)">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Comparison View -->
    <div v-if="detailedComparison" class="card full-width comparison-view">
      <h3>📊 Detailed Agent Comparison</h3>
      <div class="comparison-table-container">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Tests Run</th>
              <th>Avg Accuracy</th>
              <th>Best Accuracy</th>
              <th>Avg Confidence</th>
              <th>Total Questions</th>
              <th>Last Test</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agent in detailedComparison" :key="agent.agent_type" 
                :class="`row-${agent.agent_type}`">
              <td class="agent-cell">
                <span>{{ getAgentIcon(agent.agent_type) }}</span>
                {{ getAgentName(agent.agent_type) }}
              </td>
              <td>{{ agent.total_tests }}</td>
              <td :class="getScoreClass(agent.avg_accuracy)">
                {{ agent.avg_accuracy != null ? Number(agent.avg_accuracy).toFixed(1) : 'N/A' }}%
              </td>
              <td :class="getScoreClass(agent.best_accuracy)">
                {{ agent.best_accuracy != null ? Number(agent.best_accuracy).toFixed(1) : 'N/A' }}%
              </td>
              <td>{{ (agent.avg_confidence * 100)?.toFixed(1) }}%</td>
              <td>{{ agent.avg_questions_per_test != null? Number(agent.avg_questions_per_test).toFixed(0): 'N/A' }}</td>
              <td>{{ formatDate(agent.last_test_date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// At the top of your Vue component, add the import:
import testQuestions from './data/practice-questions-full'

export default {
  name: 'MedicalCodingDashboard',
  data() {
    return {
      apiBase: 'http://localhost:3000/api/ai-agent',
      loading: false,
      loadingMessage: '',
      currentTestResult: null,
      agentPerformance: [],
      agentSummary: null,
      detailedComparison: [],
      testHistory: [],
      selectedAgent: null,
      showHistoryModal: false,
      notifications: [],
      systemStatus: {
        custom_agent: true,
        openai: true,
        pattern_matching: true,
        database: false
      }
    };
  },
  mounted() {
    this.checkSystemStatus();
    this.loadAgentSummary();
  },
  methods: {
    async checkSystemStatus() {
  try {
    console.log('Fetching from:', `${this.apiBase}/agent-summary`);
    const res = await fetch(`${this.apiBase}/agent-summary`);
    console.log('Response status:', res.status);
    const data = await res.json();
    
    // Infer status from agent performance data
    const hasCustomAgent = data.agent_performance?.some(agent => agent.agent_type === 'custom');
    const hasGPT4o = data.agent_performance?.some(agent => agent.agent_type === 'gpt4o');
    
    this.systemStatus = {
      custom_agent: hasCustomAgent,
      openai: hasGPT4o,
      pattern_matching: true, // Always available since it's rule-based
      database: true // If API responds, database is connected
    };
  } catch (err) {
    console.error('System status check failed:', err);
    this.systemStatus = {
      custom_agent: false,
      openai: false,
      pattern_matching: false,
      database: false
    };
  }
},

    // Individual test methods
    async runPatternMatcherTest() {
      await this.runSingleTest('pattern-matcher-test', 'Running Pattern Matcher (Control)...', 'pattern');
    },

    async runGPT4oTest() {
      await this.runSingleTest('gpt4o-test', 'Running GPT-4o AI Agent...', 'gpt4o');
    },

    async runCustomAgentTest() {
      await this.runSingleTest('custom-agent-test', 'Running Custom AI Agent...', 'custom');
    },

    async runEnsembleTest() {
      await this.runSingleTest('ensemble-test', 'Running Ensemble (Both AI Agents)...', 'ensemble');
    },

    async runSingleTest(endpoint, message, agentType) {
      this.loading = true;
      this.loadingMessage = message;
      try {
        console.log(`🧪 Starting ${agentType} test with ${testQuestions.length} questions`);
        
        const response = await fetch(`${this.apiBase}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: testQuestions, // Using imported questions
            testName: `${agentType} Test - ${new Date().toISOString()}`
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.currentTestResult = data;
        
        console.log(`✅ ${agentType} test completed:`, data);
        
        // Refresh metrics after test
        await this.loadAgentSummary();
        
        // Show success message
        this.showNotification(
          `${message.split('...')[0]} completed: ${data.accuracy?.toFixed(1)}% accuracy`,
          data.accuracy >= 98 ? 'success' : 'info'
        );
        
      } catch (error) {
        console.error(`❌ ${agentType} test failed:`, error);
        this.showNotification(`Test failed: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async runSingleAgentTest(agentType) {
      const testMap = {
        'pattern': 'runPatternMatcherTest',
        'gpt4o': 'runGPT4oTest', 
        'custom': 'runCustomAgentTest',
        'ensemble': 'runEnsembleTest'
      };
      
      const methodName = testMap[agentType];
      if (methodName && this[methodName]) {
        await this[methodName]();
      }
    },

    async runAllExperiments() {
      this.loading = true;
      this.loadingMessage = 'Running complete experimental suite...';
      try {
        console.log(`🧪 Starting experimental suite with ${testQuestions.length} questions`);
        
        const response = await fetch(`${this.apiBase}/run-all-experiments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: testQuestions, // Using imported questions
            testName: `Experimental Suite - ${new Date().toISOString()}`
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Experimental suite completed:', data);
        
        // Show results summary
        const summary = data.performance_summary;
        this.showNotification(
          `Experimental suite completed! Best: ${summary.best_performing.agent} (${summary.best_performing.accuracy.toFixed(1)}%). AI Improvement: +${summary.ai_improvement.toFixed(1)}%`,
          summary.target_achieved ? 'success' : 'info'
        );
        
        // Refresh all metrics
        await this.loadAgentSummary();
        
      } catch (error) {
        console.error('❌ Experimental suite failed:', error);
        this.showNotification(`Experimental suite failed: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    // ... rest of your methods stay the same ...
    async loadStoredMetrics() {
      console.log('🔄 Loading stored metrics...');
      this.loading = true;
      this.loadingMessage = 'Loading stored metrics...';
      
      try {
        const url = `${this.apiBase}/metrics`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        this.agentPerformance = data.agent_performance || [];
        this.showNotification('Metrics loaded successfully', 'success');
        
      } catch (error) {
        console.error('❌ Failed to load metrics:', error);
        this.showNotification(`Failed to load metrics: ${error.message}`, 'error');
      } finally {
        this.loading = false;
        console.log('✅ Loading completed');
      }
    },

    async loadComparison() {
      console.log('🔄 Loading comparison data...');
      this.loading = true;
      this.loadingMessage = 'Loading comparison data...';
      
      try {
        const url = `${this.apiBase}/comparison`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        this.detailedComparison = data.detailed_comparison || [];
        this.showNotification('Comparison data loaded', 'success');
        
      } catch (error) {
        console.error('❌ Failed to load comparison:', error);
        this.showNotification(`Failed to load comparison: ${error.message}`, 'error');
      } finally {
        this.loading = false;
        console.log('✅ Loading completed');
      }
    },

    async loadAgentSummary() {
      console.log('🔄 Loading agent summary...');
      this.loading = true;
      this.loadingMessage = 'Loading agent summary...';
      
      try {
        const url = `${this.apiBase}/agent-summary`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        this.agentSummary = data;
        this.agentPerformance = data.agent_performance || [];
        this.detailedComparison = data.test_comparison || [];
        
        this.showNotification('Agent summary loaded', 'success');
        
      } catch (error) {
        console.error('❌ Failed to load agent summary:', error);
        this.showNotification(`Failed to load agent summary: ${error.message}`, 'error');
      } finally {
        this.loading = false;
        console.log('✅ Loading completed');
      }
    },

    async viewAgentHistory(agentType) {
      console.log('🔄 Loading agent history for:', agentType);
      this.selectedAgent = agentType;
      this.loading = true;
      this.loadingMessage = `Loading ${agentType} history...`;
      
      try {
        const url = `${this.apiBase}/metrics?agent_type=${agentType}`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        this.testHistory = (data.test_history || []).map(test => ({
          ...test,
          accuracy: test.accuracy ? Number(test.accuracy) : 0
        }));
        this.showHistoryModal = true;
        
        this.showNotification(`${agentType} history loaded`, 'success');
        
      } catch (error) {
        console.error('❌ Failed to load test history:', error);
        this.showNotification(`Failed to load test history: ${error.message}`, 'error');
      } finally {
        this.loading = false;
        console.log('✅ Loading completed');
      }
    },

    async viewQuestionResults(testRunId) {
        console.log('viewQuestionResults called with ID:', testRunId); // <- Add this
      try {
        const response = await fetch(`${this.apiBase}/test-run/${testRunId}/questions`);
        const data = await response.json();
        
        console.log('Question results:', data);
        this.showNotification(`Loaded ${data.total_questions} question results`, 'info');
        
      } catch (error) {
        console.error('Failed to load question results:', error);
        this.showNotification('Failed to load question results', 'error');
      }
    },

    async deleteTest(testRunId) {
      if (!confirm('Are you sure you want to delete this test run?')) return;
      
      try {
        await fetch(`${this.apiBase}/test-run/${testRunId}`, { method: 'DELETE' });
        
        await this.viewAgentHistory(this.selectedAgent);
        await this.loadAgentSummary();
        
        this.showNotification('Test run deleted', 'success');
        
      } catch (error) {
        console.error('Failed to delete test run:', error);
        this.showNotification('Failed to delete test run', 'error');
      }
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
      this.selectedAgent = '';
      this.testHistory = [];
    },

    getAgentIcon(agent) {
      const icons = {
        pattern: '🔧',
        gpt4o: '🤖',
        custom: '🎯',
        ensemble: '⚡'
      };
      return icons[agent] || '🔬';
    },
    
    getAgentName(agent) {
      const names = {
        pattern: 'Pattern Matcher',
        pattern_matcher_only: 'Pattern Matcher',
        gpt4o: 'GPT-4o',
        gpt4o_only: 'GPT-4o',
        custom: 'Custom Agent',
        custom_agent_only: 'Custom Agent',
        ensemble: 'Ensemble',
        enhanced: 'Enhanced System'
      };
      return names[agent] || 'Unknown Agent';
    },
    
    getScoreClass(accuracy) {
      if (accuracy == null || isNaN(accuracy)) return 'needs-work';
      if (accuracy >= 98) return 'excellent';
      if (accuracy >= 85) return 'good';
      if (accuracy >= 70) return 'fair';
      return 'needs-work';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },

    showNotification(message, type = 'info') {
      console.log(`🔔 ${type.toUpperCase()}: ${message}`);
      
      const notificationId = Date.now();
      const notification = {
        id: notificationId,
        message,
        type,
        timestamp: new Date()
      };
      
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      }, 5000);
    }
  }
};

</script>

<style scoped>
/* Enhanced EHR-style CSS with new components */

:root {
  --ehr-primary: #1e3a8a;
  --ehr-secondary: #0f766e;
  --ehr-success: #059669;
  --ehr-warning: #d97706;
  --ehr-danger: #dc2626;
  --ehr-info: #0284c7;
  --ehr-bg-primary: lightblue;
  --ehr-bg-secondary: lightblue;
  --ehr-border: #e2e8f0;
  --ehr-text-primary: #1e293b;
  --ehr-text-secondary: #64748b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: lightskyblue;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1e293b;
}

/* Header */
.header {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1::before {
  content: "🏥";
  font-size: 1.5rem;
}

.header p {
  color: #64748b;
  font-size: 1rem;
}

/* Dashboard */
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* Cards */
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card h3 {
  color: #1e3a8a;
  margin-bottom: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Enhanced Button Styles */
.btn {
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin: 4px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  background: #94a3b8;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-control {
  background: #1e3a8a;
;
  color: white;
}

.btn-control:hover:not(:disabled) {
  background: #475569;
}

.btn-ai1 {
  background:#1e3a8a;
  color: white;
}

.btn-ai1:hover:not(:disabled) {
  background: #1e40af;
}

.btn-ai2 {
  background: #1e3a8a;
  color: white;
}

.btn-ai2:hover:not(:disabled) {
  background: #0d9488;
}

.btn-ensemble {
  background: #1e3a8a;
  color: white;
}

.btn-ensemble:hover:not(:disabled) {
  background: #ea580c;
}

.btn-primary {
  background: #1e3a8a;
  color: white;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: #047857;
}

.btn-secondary {
  background: #1e3a8a;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #0369a1;
}

.btn-small {
  padding: 6px 12px;
  font-size: 0.75rem;
}

.btn-danger {
  background: #1e3a8a;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Current Test Result */
.current-result {
  border-left: 4px solid #ffffff;
}

.current-test-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: center;
}

.test-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.test-score {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
}

.test-meta {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  color: #64748b;
}

.status-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  text-align: center;
}

.status-indicator.success {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  border: 1px solid #059669;
}

.status-indicator.warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  border: 1px solid #d97706;
}

/* Performance Summary */
.performance-summary {
  border-left: 4px solid #0284c7;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat {
  text-align: center;
  padding: 16px;
  background: lightblue;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.agent-result {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.agent-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.test-count {
  font-size: 0.75rem;
  font-weight: 400;
  color: #64748b;
  text-transform: none;
}

/* Agent Colors */
.pattern-agent { 
  color: #64748b; 
  border-left: 4px solid #64748b;
}
.gpt4o-agent { 
  color: #1e3a8a; 
  border-left: 4px solid #1e3a8a;
}
.custom-agent { 
  color: #0f766e; 
  border-left: 4px solid #0f766e;
}
.ensemble-agent { 
  color: #d97706; 
  border-left: 4px solid #d97706;
}

/* Score Classes */
.score {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 16px 0;
  font-family: 'Courier New', monospace;
}

.score.excellent { color:#059669; }
.score.good { color: #0284c7; }
.score.fair { color: #d97706; }
.score.needs-work { color: #dc2626 }

/* Metrics Grid */
.metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.metric {
  background: lightblue;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: black;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

/* System Status */
.metrics.system-status {
  grid-template-columns: repeat(4, 1fr);
}

.metric.active {
  border-left: 3px solid #059669;
  background: rgba(5, 150, 105, 0.05);
}

.metric.inactive {
  border-left: 3px solid #dc2626;
  background: rgba(220, 38, 38, 0.05);
}

/* Agent Actions */
.agent-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* Loading */
.loading {
  text-align: center;
  padding: 48px;
  background: lightblue;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin: 24px 0;
}

.spinner {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #1e3a8a;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #64748b;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: lightblue;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: lightblue;
}

.modal-header h3 {
  margin: 0;
  color: #1e3a8a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: #e2e8f0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* History List */
.no-data {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 40px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: lightblue;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.history-item:hover {
  background: #e2e8f0;
}

.history-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.history-score {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  min-width: 80px;
}

.history-details {
  flex: 1;
}

.history-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.history-meta {
  font-size: 0.875rem;
  color: #64748b;
}

.history-actions {
  display: flex;
  gap: 8px;
}

/* Comparison Table */
.comparison-view {
  border-left: 4px solid #0f766e;
}

.comparison-table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background: lightblue;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table th {
  background: #1e3a8a;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
}

.comparison-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.comparison-table tr:hover {
  background: lightblue;
}

.agent-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* Row colors for different agents */
.row-pattern td:first-child {
  border-left: 4px solid #64748b;
}

.row-gpt4o td:first-child {
  border-left: 4px solid #1e3a8a;
}

.row-custom td:first-child {
  border-left: 4px solid #0f766e;
}

.row-ensemble td:first-child {
  border-left: 4px solid #d97706;
}

/* Utility Classes */
.correct { 
  color: #059669; 
  font-weight: 600; 
}

.incorrect { 
  color: #dc2626; 
  font-weight: 600; 
}

.neutral {
  color: #64748b;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics {
    grid-template-columns: 1fr;
  }
  
  .metrics.system-status {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .current-test-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .header h1 {
    font-size: 1.5rem;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .history-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comparison-table {
    color: black;
    font-size: 0.875rem;
  }
  
  .comparison-table th,
  .comparison-table td {
    color: black;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .btn {
    width: 100%;
    margin: 2px 0;
    justify-content: center;
  }
  
  .agent-actions {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .history-actions {
    align-self: stretch;
    justify-content: space-between;
  }
}

/* Print Styles */
@media print {
  .btn, .agent-actions, .modal-overlay {
    display: none !important;
  }
  
  .container {
    background: white;
    color: black;
  }
  
  .card {
    border: 1px solid #ccc;
    break-inside: avoid;
    margin-bottom: 20px;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --ehr-bg-primary: #ffffff;
    --ehr-bg-secondary: #ffffff;
    --ehr-border: #000000;
    --ehr-text-primary: #000000;
    --ehr-text-secondary: #333333;
  }
  
  .card {
    border: 2px solid black;
  }
  
  .btn {
    border: 2px solid black;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .spinner {
    animation: none;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #1e3a8a;
  }
}
</style>