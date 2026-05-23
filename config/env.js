import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required variables
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable: ${envVar}`);
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
  }
}

// Validate JWT_SECRET length
if (process.env.JWT_SECRET.length < 32) {
  console.error('Error: JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

// Export configuration object
export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI,
    options: {
      // Mongoose 6+ handles these automatically
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
  },
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
    verificationMinutes: parseInt(process.env.EMAIL_VERIFICATION_MINUTES, 10) || 15
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
