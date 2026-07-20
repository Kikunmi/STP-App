const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./src/middleware/errorHandler');
const { requestLogger } = require('./src/middleware/logger');
const authRoutes = require('./src/routes/authRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const userRoutes = require('./src/routes/userRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const itineraryRoutes = require('./src/routes/itineraryRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const favoriteDestinationRoutes = require('./src/routes/favoriteDestinationRoutes');
const sharedTripRoutes = require('./src/routes/sharedTripRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('dev'));
app.use(requestLogger);

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', itineraryRoutes);
app.use('/api', expenseRoutes);
app.use('/api', favoriteDestinationRoutes);
app.use('/api', sharedTripRoutes);
app.use('/api', recommendationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
