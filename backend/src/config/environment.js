const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const validateEnvironment = () => {
  // Provide safe defaults for local development so the app doesn't crash when env vars are missing
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
  if (!process.env.PORT) process.env.PORT = '5000';

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      // In production we must have these set
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // For development/test, warn and set sensible defaults so the server can start locally
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}. Using development defaults.`);

    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/stp-dev';
    }
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'dev_jwt_secret_change_me';
    }
  }

  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d'
  },
  apiKeys: {
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY,
    openWeather: process.env.OPENWEATHER_API_KEY,
    openAI: process.env.OPENAI_API_KEY
  }
};

module.exports = {
  validateEnvironment,
  config
};
