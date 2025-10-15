import { Router } from "express";
import {
  getAllNotifications,
  getNotificationById,
  getNotificationsByCategory,
  getNotificationsByCategorySlug,
  getNotificationStats,
  deleteNotification,
  deleteMultipleNotifications,
  checkNotificationExists,
  getLatestNotifications,
  resendNotification,
  getNotificationsByDevice,
  getUnreadNotificationsCount,
  getNotificationsByDeviceRead,
} from "../controller/notification";
import { isAdmin, requiredSignin } from "../middlewares/checkAuth";

const router = Router();

/**
 * Mobile/Device routes (không cần admin auth)
 */
// Lấy notifications history cho device (mobile app)
router.get("/notifications/device/history", getNotificationsByDevice);

// Lấy unread count cho device (mobile app)
router.get("/notifications/device/unread-count", getUnreadNotificationsCount);

// Mark notification as read cho device (mobile app) - ĐẶT TRƯỚC route /:id
router.put("/notifications/:id/read", getNotificationsByDeviceRead);

/**
 * Admin routes
 */
// Lấy danh sách notifications (admin only)
router.get("/notifications", requiredSignin, isAdmin, getAllNotifications);

// Lấy latest notifications (dashboard)
router.get("/notifications/latest", requiredSignin, isAdmin, getLatestNotifications);

// Lấy thống kê (admin only)
router.get("/notifications/stats", requiredSignin, isAdmin, getNotificationStats);

// Kiểm tra đã gửi notification chưa (admin only)
router.get("/notifications/check/:categorySlug/:episodeNumber", requiredSignin, isAdmin, checkNotificationExists);

// Lấy notifications by category (admin only)
router.get("/notifications/category/:categoryId", requiredSignin, isAdmin, getNotificationsByCategory);

// Lấy notifications by category slug (có thể public nếu cần)
router.get("/notifications/category-slug/:slug", getNotificationsByCategorySlug);

// Lấy notification by ID
router.get("/notifications/:id", requiredSignin, isAdmin, getNotificationById);

/**
 * Admin routes
 */
// Xóa notification
router.delete("/notifications/:id", requiredSignin, isAdmin, deleteNotification);

// Xóa nhiều notifications
router.delete("/notifications/bulk/delete", requiredSignin, isAdmin, deleteMultipleNotifications);

// Resend notification
router.post("/notifications/:id/resend", requiredSignin, isAdmin, resendNotification);

export default router;

