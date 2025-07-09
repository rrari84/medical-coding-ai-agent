## 🔧 Setup Instructions

### 1. Environment Setup
```sh
# Copy environment template
cp .env.example .env

# Edit .env and docker-compose.yml, add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Start up server.js, it should state open-api key as set and have database information set
node server.js

# Go to your api-gateway\tests folder and insert here to run full test :)
node run-full-test.js
```
### Great!, You've set up the environment 