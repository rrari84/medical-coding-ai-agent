// Try and catch case to import OpenAI Node.js SDK (openai package). If it's not installed, it will log a message. 
let OpenAI;
try {
  OpenAI = require('openai');
} catch (error) {
  console.log('OpenAI not installed. Install with: npm install openai');
}

//Import the prompts from prompt template
const prompts = require('../config/prompts');

class OpenAIClient {
  constructor() {
    // Initialize OpenAI package if succesfully imported, make sure OPEN_API_KEY environment variable is set. If not set, it sets this.openai to null with fallback warning. 
    if (OpenAI && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI initialized');
    } else {
      this.openai = null;
      console.log('⚠️ OpenAI not available - using enhanced rules');
    }
    //Loads knowledge base from local module
    this.knowledgeBase = this.initializeKnowledgeBase();
  }

  //Loads and executes initializeKnowledgeBase function to return knowledge
  initializeKnowledgeBase() {
    const initializeKnowledgeBase = require('../knowledge/MedicalPatterns');
    return initializeKnowledgeBase();
  }
  
  //Throws an error if OpenAI isn't available
  async callOpenAI(question, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI not available');
    }

    //Generates a custom user prompt by combining the input with a template from prompt.js
    const prompt = this.constructPromptFromFile(question, options);

    // Extract temperature from options or use default
    const temperature = options.temperature || 0.05;
    const maxTokens = options.max_tokens || 1000;

    try {
        //Calls GPT-4 using configurable temperature for deterministic, accurate response
        //Uses system-level instructions (systemPrompt) to set the AI's behavior
        //Uses the custom prompt built from user input
        const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: prompts.systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 400
      });

      return response.choices[0].message.content;

    } catch (error) {
        //If GPT-4 is not available (e.x. due to model unavailability), it relies using GPT-3.5-turbo with a hardcoded system prompt specifically for expert medical coding
        if (error.status === 404 || error.code === 'model_not_found') {
        console.log('GPT-4 not available, trying GPT-3.5-turbo');
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: "system",
              content: "You are an expert medical coder. Follow the critical coding rules precisely for 98% accuracy."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: temperature,
          max_tokens: 300
        });

        return response.choices[0].message.content;
      }
      throw error;
    }
  }

  //Builds the user prompt from a helper function questionAnalysisPrompt inside prompt.js
  constructPromptFromFile(question, options) {
        return prompts.questionAnalysisPrompt({ question, options });
  } 

}

module.exports = OpenAIClient;