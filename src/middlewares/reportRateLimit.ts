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
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next, options) => {
    console.log(`IP Rate Limit Exceeded - IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Rate limiter cho Product
export const productRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // Giới hạn 30 report/product/24h
  keyGenerator: (req: Request) => {
    const productId = req.body.productId || "unknown";
    console.log(`Product Rate Limit Check - Product ID: ${productId}`);
    return productId;
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
    console.log(`Product Rate Limit Exceeded - Product ID: ${req.body.productId}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Rate limiter cho fingerprint
export const fingerprintRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giới hạn 2 request/fingerprint/24h
  keyGenerator: (req: Request) => {
    // Lấy real IP từ proxy
    const realIP = req.ip || 
                  (typeof req.headers['x-forwarded-for'] === 'string' 
                    ? req.headers['x-forwarded-for'].split(',')[0] 
                    : null) || 
                  req.headers['x-real-ip'] ||
                  'unknown';
                  
    const userAgent = req.headers["user-agent"] || 'unknown';
    const fingerprint = `${realIP}-${userAgent}`;
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
    const fingerprint = `${req.ip}-${req.headers["user-agent"]}`;
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
    console.log('Report Request Info:', {
      ip: req.ip,
      forwardedFor: req.headers['x-forwarded-for'],
      realIP: req.headers['x-real-ip'],
      userAgent: req.headers['user-agent'],
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });

    // Áp dụng lần lượt các rate limiters
    // Nếu một limiter thất bại, dừng ngay và trả về lỗi
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
    console.error('Rate limit error:', {
      error,
      ip: req.ip,
      productId: req.body.productId,
      timestamp: new Date().toISOString()
    });
    
    // Nếu đã có response được gửi, không gửi thêm
    if (!res.headersSent) {
      res.status(429).json({
        message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
        success: false
      });
    }
  }
};
