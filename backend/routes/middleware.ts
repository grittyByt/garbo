import rateLimit from 'express-rate-limit';

export const loginIpLimiter = rateLimit({

    // 5 login tries per 15 min per IP
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
});
