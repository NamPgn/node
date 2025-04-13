import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Rate limiter cho IP
export const ipRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // Giới hạn 5 request/IP/24h
  message: {
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 24h",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho Product
export const productRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // Giới hạn 50 report/product/24h
  keyGenerator: (req: Request) => req.body.productId || "unknown",
  message: {
    message: "Phim này đã nhận quá nhiều báo cáo trong 24h qua",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho fingerprint
export const fingerprintRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Giới hạn 3 request/fingerprint/24h
  keyGenerator: (req: Request) => {
    const ipAddress = req.ip;
    const forwardedFor = req.headers["x-forwarded-for"];
    const realIP = req.headers["x-real-ip"];
    const userAgent = req.headers["user-agent"];
    return `${ipAddress}-${forwardedFor}-${realIP}-${userAgent}`;
  },
  message: {
    message: "Đánh giá của bạn đã được gửi, vui lòng thử lại sau",
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware kết hợp tất cả rate limiters
export const reportRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Áp dụng lần lượt các rate limiters
    await new Promise((resolve) => ipRateLimiter(req, res, resolve));
    await new Promise((resolve) => productRateLimiter(req, res, resolve));
    await new Promise((resolve) => fingerprintRateLimiter(req, res, resolve));
    next();
  } catch (error) {
    next(error);
  }
};
