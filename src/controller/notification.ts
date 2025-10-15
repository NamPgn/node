import { Request, Response } from "express";
import Notification from "../module/notification";
import Category from "../module/category";
import PushToken from "../module/push.token";

/**
 * Lấy tất cả notifications với phân trang và filters
 * GET /api/notifications?page=1&limit=20&status=sent&categoryId=xxx
 */
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      categoryId,
      categorySlug,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (categorySlug) filter.categorySlug = categorySlug;
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) filter.sentAt.$gte = new Date(startDate as string);
      if (endDate) filter.sentAt.$lte = new Date(endDate as string);
    }

    // Get notifications với populate
    const notifications = await Notification.find(filter)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("categoryId", "name slug")
      .populate("sentBy", "username email")
      .populate("productId", "name seri slug")
      .lean()
      .exec();

    const total = await Notification.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("❌ Error getting notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy notifications của một category
 * GET /api/notifications/category/:categoryId
 */
export const getNotificationsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { limit = 50 } = req.query;

    const notifications = await Notification.find({ categoryId })
      .sort({ sentAt: -1 })
      .limit(parseInt(limit as string))
      .populate("sentBy", "username email")
      .populate("productId", "name seri slug")
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error("❌ Error getting category notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy notifications của một category bằng slug
 * GET /api/notifications/category-slug/:slug
 */
export const getNotificationsByCategorySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { limit = 50 } = req.query;

    const notifications = await Notification.find({ categorySlug: slug })
      .sort({ sentAt: -1 })
      .limit(parseInt(limit as string))
      .populate("categoryId", "name slug")
      .populate("sentBy", "username email")
      .populate("productId", "name seri slug")
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error("❌ Error getting category notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy một notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id)
      .populate("categoryId", "name slug")
      .populate("sentBy", "username email")
      .populate("productId", "name seri slug")
      .lean()
      .exec();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error("❌ Error getting notification:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy thống kê notifications
 * GET /api/notifications/stats?startDate=xxx&endDate=xxx
 */
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate) start = new Date(startDate as string);
    if (endDate) end = new Date(endDate as string);

    const stats = await (Notification as any).getStats(start, end);

    // Tính tổng
    const totalStats = stats.reduce(
      (acc: any, curr: any) => {
        acc.totalNotifications += curr.count;
        acc.totalRecipients += curr.totalRecipients;
        acc.totalSuccess += curr.successCount;
        acc.totalFailures += curr.failureCount;
        return acc;
      },
      {
        totalNotifications: 0,
        totalRecipients: 0,
        totalSuccess: 0,
        totalFailures: 0,
      }
    );

    totalStats.successRate =
      totalStats.totalRecipients > 0
        ? ((totalStats.totalSuccess / totalStats.totalRecipients) * 100).toFixed(2)
        : "0.00";

    return res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        summary: totalStats,
      },
    });
  } catch (error: any) {
    console.error("❌ Error getting notification stats:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xóa notification (soft delete or hard delete)
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting notification:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xóa nhiều notifications
 * DELETE /api/notifications/bulk
 * Body: { ids: ["id1", "id2", ...] }
 */
export const deleteMultipleNotifications = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "ids array is required",
      });
    }

    const result = await Notification.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("❌ Error deleting notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Kiểm tra đã gửi notification cho episode chưa
 * GET /api/notifications/check/:categorySlug/:episodeNumber
 */
export const checkNotificationExists = async (req: Request, res: Response) => {
  try {
    const { categorySlug, episodeNumber } = req.params;
    const episode = parseInt(episodeNumber);

    const hasNotified = await (Notification as any).hasNotifiedEpisode(
      categorySlug,
      episode
    );

    return res.status(200).json({
      success: true,
      hasNotified,
      categorySlug,
      episodeNumber: episode,
    });
  } catch (error: any) {
    console.error("❌ Error checking notification:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy latest notifications (cho dashboard)
 * GET /api/notifications/latest?limit=10
 */
export const getLatestNotifications = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const notifications = await Notification.find()
      .sort({ sentAt: -1 })
      .limit(parseInt(limit as string))
      .populate("categoryId", "name slug")
      .populate("sentBy", "username")
      .select("title body sentAt status successCount totalRecipients categorySlug episodeNumber")
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error("❌ Error getting latest notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Resend notification (gửi lại notification đã thất bại)
 * POST /api/notifications/:id/resend
 */
export const resendNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Import service để gửi lại
    const { sendNotificationToAll } = require("../services/push-notification.service");

    const result = await sendNotificationToAll(
      {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: "default",
      },
      false // Không lưu vào DB (đã có record)
    );

    // Cập nhật record cũ
    if (result.success) {
      notification.status = "sent";
      notification.sentAt = new Date();
      await notification.save();
    }

    return res.status(200).json({
      success: result.success,
      message: result.success ? "Notification resent successfully" : "Failed to resend",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error resending notification:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy notifications history cho mobile device
 * GET /api/notifications/device/history
 * Headers: { "x-device-token": "ExponentPushToken[...]" }
 */
export const getNotificationsByDevice = async (req: Request, res: Response) => {
  try {
    const deviceToken = req.headers["x-device-token"] as string;
    const { page = 1, limit = 20 } = req.query;
    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token is required in headers (x-device-token)",
      });
    }

    // Verify device token exists
    const pushToken = await PushToken.findOne({ token: deviceToken, isActive: true });
    if (!pushToken) {
      return res.status(404).json({
        success: false,
        message: "Device token not found or inactive",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Lấy notifications (tất cả notifications đã gửi cho tất cả users)
    // Vì mobile app chỉ nhận notification của mình nên lấy tất cả
    const notifications = await Notification.find({ status: { $in: ["sent", "partial"] } })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("categoryId", "name slug linkImg")
      .select("title body categorySlug productSlug episodeNumber sentAt data isRead")
      .lean()
      .exec();

    const total = await Notification.countDocuments({ status: { $in: ["sent", "partial"] } });
    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("❌ Error getting device notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy unread notifications count cho device
 * GET /api/notifications/device/unread-count
 * Headers: { "x-device-token": "ExponentPushToken[...]" }
 */
export const getUnreadNotificationsCount = async (req: Request, res: Response) => {
  try {
    const deviceToken = req.headers["x-device-token"] as string;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token is required in headers (x-device-token)",
      });
    }

    // Verify device token
    const pushToken = await PushToken.findOne({ token: deviceToken, isActive: true });
    if (!pushToken) {
      return res.status(404).json({
        success: false,
        message: "Device token not found or inactive",
      });
    }

    // Count unread notifications (sent trong 30 ngày gần nhất)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const unreadCount = await Notification.countDocuments({
      status: { $in: ["sent", "partial"] },
      isRead: { $ne: true },
      sentAt: { $gte: thirtyDaysAgo },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error: any) {
    console.error("❌ Error getting unread count:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotificationsByDeviceRead = async (req: Request, res: Response) => {
  try {
    const deviceToken = req.headers["x-device-token"] as string;
    const { id } = req.params;
    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token is required in headers (x-device-token)",
      });
    }
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification id is required in params",
      });
    }

    // Verify device token
    const pushToken = await PushToken.findOne({ token: deviceToken, isActive: true });
    if (!pushToken) {
      return res.status(404).json({
        success: false,
        message: "Device token not found or inactive",
      });
    }

    const readNotification = await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({
      success: true,
      message: "Notification read successfully",
    });
  } catch (error: any) {
    console.error("❌ Error getting device notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};