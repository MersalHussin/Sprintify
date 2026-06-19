import { rateLimit } from 'express-rate-limit';

// AI-only per-user AI rate limiter
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req => req.user?.id ?? req.ip ?? "unknown",
    message: {
        error: "Too many AI requests; you are rate limited."
    }
});

// Global Rate Limiter, per-user and falls back to ip address
export const globalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: req => req.user?.id ?? req.ip ?? "unknown",
    message: {
        error: "Too many requests; you are rate limited."
    }
});