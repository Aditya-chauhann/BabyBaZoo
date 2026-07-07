import { redisService } from './redis.service';
import { logger } from '../utils/logger';

const EXCHANGE_RATE_KEY = 'currency:usd_to_inr';
// Cache for 24 hours
const EXCHANGE_RATE_TTL = 24 * 60 * 60;

export class CurrencyService {
  async getUsdToInrRate(): Promise<number> {
    const cachedRate = await redisService.get<number>(EXCHANGE_RATE_KEY);
    if (cachedRate) return cachedRate;

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      
      const data = await response.json();
      const inrRate = data.rates.INR;
      
      if (inrRate) {
        await redisService.set(EXCHANGE_RATE_KEY, inrRate, EXCHANGE_RATE_TTL);
        return inrRate;
      }
    } catch (error) {
      logger.error('Exchange rate fetch error', { error: (error as Error).message });
    }

    // Fallback static rate if API fails
    return 83.5;
  }
}

export const currencyService = new CurrencyService();
