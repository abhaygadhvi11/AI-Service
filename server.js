const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const apiKeysRoutes = require('./routes/api-keys');
const apiCallsRoutes = require('./routes/api-calls');

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/keys', apiKeysRoutes);
app.use('/api/calls', apiCallsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Service - API Key Management System',
    version: '1.0.0',
    endpoints: {
      'Health Check': 'GET /health',
      'API Keys': {
        'Generate Key': 'POST /api/keys/generate',
        'List Keys': 'GET /api/keys',
        'Get Key Details': 'GET /api/keys/:id',
        'Get Key Stats': 'GET /api/keys/:id/stats',
        'Revoke Key': 'PATCH /api/keys/:id/revoke',
        'Delete Key': 'DELETE /api/keys/:id'
      },
      'API Calls': {
        'Execute API': 'POST /api/calls/execute (requires X-API-Key header)',
        'Get Logs': 'GET /api/calls/logs (requires X-API-Key header)',
        'Admin - All Calls': 'GET /api/calls/admin/all-calls',
        'Admin - Statistics': 'GET /api/calls/admin/statistics'
      }
    },
    documentation: {
      'Generate API Key': {
        method: 'POST',
        endpoint: '/api/keys/generate',
        body: {
          total_calls: 100,
          name: 'My App Key'
        }
      },
      'Execute API Call': {
        method: 'POST',
        endpoint: '/api/calls/execute',
        headers: {
          'X-API-Key': 'your-api-key-here',
          'Content-Type': 'application/json'
        },
        body: {
          endpoint: '/some-endpoint',
          action: 'process_data'
        }
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
 Database: ${process.env.DB_NAME || 'api_service'} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}
`);
});

module.exports = app;
