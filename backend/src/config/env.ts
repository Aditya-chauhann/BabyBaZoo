import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PRODUCT_TTL: 6 * 60 * 60, // 6 hours
  REDIS_CATEGORY_TTL: 24 * 60 * 60, // 24 hours
  REDIS_CART_TTL: 7 * 24 * 60 * 60, // 7 days
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/babybazoo',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretbabybazoo123',
  CJ_API_BASE_URL: process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1',
  CJ_API_KEY: process.env.CJ_API_KEY || '',
  CJ_MOCK_MODE: process.env.CJ_MOCK_MODE !== 'false', // Default to true if not specified
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};
