import { RateLimiterMemory } from 'rate-limiter-flexible';
const limiter = new RateLimiterMemory({ points: 10, duration: 60 });

export async function authLimiter(req: any, res: any, next: any) {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Terlalu banyak percubaan. Cuba lagi selepas 60 saat.' });
  }
}