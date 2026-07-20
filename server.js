// Load environment variables from .env early
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./src/config/database');
const { validateEnvironment } = require('./src/config/environment');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
