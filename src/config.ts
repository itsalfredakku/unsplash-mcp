import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface UnsplashConfig {
  userAgent: string;
  requestDelay: number;
  cacheTtl: number;
  maxRetries: number;
  baseUrl: string;
}

// Get random user agent if none specified
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export const config: UnsplashConfig = {
  userAgent: process.env.USER_AGENT || getRandomUserAgent(),
  requestDelay: parseInt(process.env.REQUEST_DELAY || '1000'),
  cacheTtl: parseInt(process.env.CACHE_TTL || '300'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  baseUrl: 'https://unsplash.com',
};

export function validateConfig(): void {
  if (config.requestDelay < 500) {
    console.warn('Request delay is very low, consider increasing to avoid rate limiting');
  }
  
  if (config.maxRetries > 10) {
    console.warn('Max retries is very high, this might cause long delays');
  }
}
