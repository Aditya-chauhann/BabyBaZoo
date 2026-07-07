import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { getRedisClient } from './config/redis';

async function bootstrap() {
  try {
    // Initialize Redis connection
    const redisClient = getRedisClient();
    
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB successfully');
    
    app.listen(env.PORT, () => {
      logger.info(`Babybazoo server listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

bootstrap();
