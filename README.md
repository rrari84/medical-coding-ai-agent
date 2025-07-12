# 🧠 Medical Coding AI Agent

A modular, knowledge-grounded AI system for **automated medical code selection** (CPT, ICD-10-CM, HCPCS) from clinical text. Built for intelligent integration into EHR workflows, with explainability, pattern safety, and performance benchmarking.

<img width="801" height="467" alt="image" src="https://github.com/user-attachments/assets/f6cdc97f-e12c-4af5-9776-36a301d898e1" />


---

## 📌 Overview

This project implements a **multi-agent medical coding engine** using:

- 🤖 Custom-built Medical Coding Agent
- 🧩 Pattern-based rule matcher (control baseline)
- 🔗 OpenAI GPT-4o integration (fallback)
- 🧠 Ensemble reasoning via a Decision Engine
- 📊 Full PostgreSQL-backed metrics & test history
- 🧪 Batch test suite with real coding questions
- 🧼 RESTful API built with Express.js
- 🖥️ Vue.js frontend for performance dashboards *(optional)*

> Designed as a scalable prototype for AI-enhanced EHR systems.

---

## 🧱 Architecture
Client (Vue.js dashboard)
↓
Express API Gateway (Node.js)
├── PatternMatcher (Rules)
├── CustomAgent (Knowledge + Logic)
├── GPT-4o (LLM Fallback)
└── Decision Engine (Confidence, Heuristics)
└── Knowledge Base (Patterns, Code Ranges)
└── PostgreSQL DB (Test Results, Metrics)


> For a full diagram: see `/docs/architecture.png` or Notion.

---

## 🤖 Agents

### 🔹 `PatternMatcher` (Baseline)
- Hardcoded rules and keyword patterns  
- Zero-shot, deterministic  
- No external dependencies  

### 🔸 `CustomMedicalCodingAgent`
- Modular reasoning:
  - Anatomical system mapping
  - Code range validation
  - Procedure complexity scoring
  - Terminology decomposition
- Uses a structured **Medical Knowledge Base**
- Outputs reasoning, confidence, and explanation

### ⚡ `OpenAI GPT-4o` (Fallback)
- Uses GPT-4o via `callOpenAIClient.js`
- Response parsed using regex patterns for:
  - Answer (`A`–`D`)
  - Confidence
  - Explanation

### 🧠 `Ensemble Mode`
- Runs all 3 agents
- Measures agreement rate
- Selects best or fallback based on confidence

---

## 🧠 Knowledge Base

- Located in `/knowledge/MedicalPatterns.js`
- Includes:
  - Prefixes, suffixes, root terms
  - Anatomical keyword mapping
  - Code range data (CPT/ICD/HCPCS)
  - Clinical logic heuristics

---

## 🗂️ Database Schema

Tables:
- `test_runs`
- `question_results`
- `agent_performance`
- `test_comparison`

Stored Metrics:
- Accuracy
- Confidence
- Per-question breakdown
- Agent-level summary

---

## 🚀 Setup & Run

### 1. Clone the Repo

```bash
git clone https://github.com/rrari84/medical-coding-ai-agent
cd medical-coding-ai-agent
```

### 2. Install Backend
```bash
cd backend
npm install
```
create .env in backend/api-gateway/:
```bash
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=medical_coding_ai
DB_PORT=5432
OPENAI_API_KEY=sk-...
```
### 3. Set Up Database (PostgreSQL)
- Make sure you have Docker installed and running in the background.
```bash
docker-compose up -d postgres
# OR run schema manually:
psql -U postgres -f db/schema.sql
```

### 4. Run Backend API
```bash
npm start
# Express running at http://localhost:3000
node server.js
#^ in order to start up the server
```
### 5. Frontend 
- Optional but reccommended for better user experience,
although test is run through command line.

```bash
cd frontend\frontend
npm install
npm run dev
```

## 🧪 API Endpoints

| Route                         | Description                            |
| ----------------------------- | -------------------------------------- |
| `POST /pattern-matcher-test`  | Run baseline test with rules           |
| `POST /custom-agent-test`     | Run CustomMedicalCodingAgent           |
| `POST /gpt4o-test`            | Run GPT-4o agent                       |
| `POST /ensemble-test`         | Run all agents and compare             |
| `POST /run-all-experiments`   | Run all agents on a batch of questions |
| `GET /metrics`                | Summary of performance by agent        |
| `GET /comparison`             | Comparison of agents over time         |
| `GET /test-run/:id/questions` | Retrieve question-level results        |
| `DELETE /test-run/:id`        | Delete a specific test run             |

## 🧪 Example Test Input
```bash
{
  "questions": [
    {
      "id": 1,
      "question": "What is the correct CPT code for bilateral nasal sinusotomy?",
      "options": {
        "A": "30140",
        "B": "31255",
        "C": "30520",
        "D": "31254"
      },
      "correct": "B"
    }
  ],
  "testName": "Bilateral Sinusotomy Test"
}
```

## 📈 Performance Tracking
- Each test logs:
  - Accuracy (% correct)
  - Confidence (avg, per-question)
  - Time per question
  - Agent comparison (agreement, disagreements)

View metrics via:
```bash
GET /agent-summary
```

##🛡️ License
MIT License. See LICENSE.

##✍️ Author
Areeba R.








