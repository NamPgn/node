import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Helper function để lấy IP thật từ client
const getClientIp = (req: Request): any => {
  // Lấy IP từ các header
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  // Nếu có nhiều IP trong x-forwarded-for, lấy IP đầu tiên (IP của client)
  const clientIp = Array.isArray(forwardedFor) 
    ? forwardedFor[0]?.trim()
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : null;

  return clientIp || realIp || req.ip || 'unknown';
};

// Rate limiter cho IP
export const ipRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giới hạn 2 request/IP/24h
  keyGenerator: (req: Request) => getClientIp(req),
  message: {
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 24h",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next, options) => {
    const ip = getClientIp(req);
    console.log(`IP Rate Limit Exceeded - Client IP: ${ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Rate limiter cho Product
export const productRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // Giới hạn 30 report/product/24h
  keyGenerator: (req: Request) => {
    const productId = req.body.productId || "unknown";
    const ip = getClientIp(req);
    console.log(`Product Rate Limit Check - Product ID: ${productId}, Client IP: ${ip}`);
    return `${productId}-${ip}`; // Kết hợp productId và IP để tăng tính bảo mật
  },
  message: {
    message: "Phim này đã nhận quá nhiều báo cáo trong 24h qua",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next, options) => {
    const productId = req.body.productId;
    const ip = getClientIp(req);
    console.log(`Product Rate Limit Exceeded - Product ID: ${productId}, Client IP: ${ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Rate limiter cho fingerprint
export const fingerprintRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giới hạn 2 request/fingerprint/24h
  keyGenerator: (req: Request) => {
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || 'unknown';
    const fingerprint = `${ip}-${userAgent}`;
    console.log(`Fingerprint Rate Limit Check - Fingerprint: ${fingerprint}`);
    return fingerprint;
  },
  message: {
    message: "Đánh giá của bạn đã được gửi, vui lòng thử lại sau",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next, options) => {
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];
    const fingerprint = `${ip}-${userAgent}`;
    console.log(`Fingerprint Rate Limit Exceeded - Fingerprint: ${fingerprint}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Middleware kết hợp tất cả rate limiters
export const reportRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Log request info for debugging
    const clientIp = getClientIp(req);
    console.log('Report Request Info:', {
      clientIp,
      forwardedFor: req.headers['x-forwarded-for'],
      realIP: req.headers['x-real-ip'],
      userAgent: req.headers['user-agent'],
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });

    // Áp dụng lần lượt các rate limiters
    await new Promise((resolve, reject) => {
      ipRateLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    await new Promise((resolve, reject) => {
      productRateLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    await new Promise((resolve, reject) => {
      fingerprintRateLimiter(req, res, (err) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    next();
  } catch (error) {
    const clientIp = getClientIp(req);
    console.error('Rate limit error:', {
      error,
      clientIp,
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });
    
    if (!res.headersSent) {
      res.status(429).json({
        message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
        success: false
      });
    }
  }
};
