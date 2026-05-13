/**
 * @file server.js
 * @description Main entry point for the PsyConnect backend server.
 * 
 * This file handles:
 * - Express application setup
 * - Database connection (MySQL)
 * - Middleware configuration (CORS, JSON parsing)
 * - Route registration
 * - Global error handling
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Security Middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Use Helmet for secure headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for local dev/simplicity unless specific rules are needed
    crossOriginEmbedderPolicy: false
}));

// Body parsing (Moved to top to handle large payloads early)
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Basic rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard." }
});

// Apply limiter to all API routes
app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static('public'));

// MySQL connection (using mysql2)
const db = require('./db/mysql');
db.getConnection()
  .then((conn) => {
      console.log('✅ MySQL connected successfully');
      conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/user', require('./routes/user'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/appointments', require('./routes/appointments'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[DEBUG] PAYLOAD LIMIT SET TO 100MB`);
});

module.exports = app;
