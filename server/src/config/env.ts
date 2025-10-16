import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/coffeeapp',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};