interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  return (event: any) => {
    const clientIP =
      getHeader(event, 'x-forwarded-for') ||
      getHeader(event, 'x-real-ip') ||
      'unknown';
    const key = `${event.node.req.url}:${clientIP}`;
    const now = Date.now();

    // Clean up expired entries
    for (const [k, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(k);
      }
    }

    const entry = rateLimitStore.get(key);

    if (!entry) {
      // First request from this IP for this endpoint
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return true;
    }

    if (now > entry.resetTime) {
      // Window has expired, reset
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return true;
    }

    if (entry.count >= options.maxRequests) {
      // Rate limit exceeded
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
      });
    }

    // Increment counter
    entry.count++;
    return true;
  };
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 attempts per minute
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
});

export const mediaRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute (for file uploads)
});
