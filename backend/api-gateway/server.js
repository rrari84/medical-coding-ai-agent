require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

console.log('Starting Medical Coding API...');
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('FHIR_SERVER_URL:', process.env.FHIR_SERVER_URL);

// Basic middleware
app.use(express.json({ limit: '10mb' }));

// Optional database connection - don't crash if it fails
let pool = null;
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
  try {
  const { Pool } = require('pg');
  pool = new Pool({
    host: 'localhost',        // Direct connection to Docker
    port: 5433,
    database: 'medical_coding',
    user: 'postgres',
    password: 'postgres',
    max: 20,
    connectionTimeoutMillis: 5000,
  });
  global.pool = pool; // Make pool available globally
  console.log('Database pool configured');
} catch (error) {
  console.log('Database configuration failed:', error.message);
}
} else {
  console.log('Database configuration incomplete - running without database');
}

// Routes - with error handling for missing route files
try {
  console.log('Loading routes...');
  
  // Try to load routes, but don't crash if they don't exist
  try {
    const aiAgentRoutes = require('./routes/aiAgent');
    app.use('/api/ai-agent', aiAgentRoutes);
    console.log('AI Agent routes loaded');
  } catch (err) {
    console.log('AI Agent routes error:', err.message);
    console.log('Creating fallback route for /api/ai-agent');
    app.get('/api/ai-agent*', (req, res) => res.json({ message: 'AI Agent API - Route file not found' }));
  }
  
  try {
    const codingRoutes = require('./routes/aiAgent');
    app.use('/api/coding', codingRoutes);
    console.log('Coding routes loaded');
  } catch (err) {
    console.log('Coding routes not found, creating basic route');
    app.get('/api/coding*', (req, res) => res.json({ message: 'Coding API' }));
  }
  
  try {
    const fhirRoutes = require('./routes/fhir');
    app.use('/api/fhir', fhirRoutes);
    console.log('FHIR routes loaded');
  } catch (err) {
    console.log('FHIR routes not found, creating basic route');
    app.get('/api/fhir*', (req, res) => res.json({ message: 'FHIR API' }));
  }
  
} catch (error) {
  console.log('Route loading error:', error.message);
}

// Health check endpoints
app.get('/health', async (req, res) => {
  console.log('Health check called at', new Date().toISOString());
  
  const health = {
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    database: 'not configured',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  };
  
  // Test database if available
  if (pool) {
    try {
      await pool.query('SELECT 1');
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.databaseError = error.message;
    }
  }
  
  res.status(200).json(health);
});

app.get('/ready', (req, res) => {
  console.log('Readiness check called');
  res.status(200).json({ 
    status: 'ready', 
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  res.json({ 
    message: 'Medical Coding AI Agent API Gateway',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      ready: '/ready',
      aiAgent: '/api/ai-agent',
      coding: '/api/coding',
      fhir: '/api/fhir'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(error.status || 500).json({
    error: {
      message: error.message,
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Medical Coding AI Agent API running on port ${port}`);
  console.log(`Server started at ${new Date().toISOString()}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Node version: ${process.version}`);
});

// Keep alive interval
setInterval(() => {
  console.log(`Server heartbeat: ${new Date().toISOString()}, uptime: ${process.uptime()}s`);
}, 60000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    if (pool) pool.end();
    process.exit(0);
  });
});

console.log('Server setup complete, listening for requests...');

module.exports = { app, pool };