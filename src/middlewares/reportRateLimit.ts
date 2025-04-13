import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Rate limiter cho IP
export const ipRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giới hạn 2 request/IP/24h
  message: {
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 24h",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Đếm cả request thất bại
  skipSuccessfulRequests: false // Đếm cả request thành công
});

// Rate limiter cho Product
export const productRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // Giảm xuống 30 report/product/24h
  keyGenerator: (req: Request) => req.body.productId || "unknown",
  message: {
    message: "Phim này đã nhận quá nhiều báo cáo trong 24h qua",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false
});

// Rate limiter cho fingerprint
export const fingerprintRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giảm xuống 2 request/fingerprint/24h
  keyGenerator: (req: Request) => {
    // Lấy real IP từ proxy
    const realIP = req.ip || 
                  (typeof req.headers['x-forwarded-for'] === 'string' 
                    ? req.headers['x-forwarded-for'].split(',')[0] 
                    : null) || 
                  req.headers['x-real-ip'] ||
                  'unknown';
                  
    const userAgent = req.headers["user-agent"] || 'unknown';
    return `${realIP}-${userAgent}`;  // Simplified but more reliable fingerprint
  },
  message: {
    message: "Đánh giá của bạn đã được gửi, vui lòng thử lại sau",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skipSuccessfulRequests: false
});

// Middleware kết hợp tất cả rate limiters
export const reportRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Log request info for debugging
  

    // Áp dụng lần lượt các rate limiters
    await new Promise((resolve) => ipRateLimiter(req, res, resolve));
    await new Promise((resolve) => productRateLimiter(req, res, resolve));
    await new Promise((resolve) => fingerprintRateLimiter(req, res, resolve));
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next(error);
  }
};
