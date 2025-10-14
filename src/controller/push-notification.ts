import { Request, Response } from "express";
import PushToken from "../module/push.token";
import { 
  sendPushNotification, 
  sendNotificationToAll,
  sendNotificationToUser,
  notifyNewEpisode,
  notifyNewCategory
} from "../services/push-notification.service";

/**
 * Register một push token mới
 */
export const registerPushToken = async (req: Request, res: Response) => {
  try {
    console.log("\n📱 [registerPushToken] Received request");
    console.log("   Body:", JSON.stringify(req.body, null, 2));
    
    const { token, platform, deviceName, appVersion, userId } = req.body;

    if (!token) {
      console.log("❌ Token missing in request");
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    // Validate Expo push token format
    if (!token.startsWith("ExponentPushToken[")) {
      console.log("❌ Invalid token format:", token);
      return res.status(400).json({
        success: false,
        message: "Invalid Expo push token format",
      });
    }
    
    console.log("✅ Token format valid:", token.substring(0, 30) + "...");

    // Check if token already exists
    let existingToken = await PushToken.findOne({ token });

    if (existingToken) {
      console.log("ℹ️ Token already exists, updating...");
      // Update existing token
      existingToken.isActive = true;
      existingToken.lastUsed = new Date();
      existingToken.userId = userId || existingToken.userId;
      existingToken.deviceInfo = {
        platform,
        deviceName,
        appVersion,
      };
      await existingToken.save();

      console.log("✅ Token updated successfully!");
      console.log(`   Platform: ${platform}`);
      console.log(`   Device: ${deviceName}`);
      console.log(`   Total active tokens: ${await PushToken.countDocuments({ isActive: true })}`);

      return res.status(200).json({
        success: true,
        message: "Push token updated successfully",
        data: existingToken,
      });
    }

    // Create new token
    console.log("📝 Creating new token...");
    const newToken = await PushToken.create({
      token,
      userId: userId || undefined,
      deviceInfo: {
        platform,
        deviceName,
        appVersion,
      },
      isActive: true,
      lastUsed: new Date(),
    });

    console.log("✅ New token registered successfully!");
    console.log(`   ID: ${newToken._id}`);
    console.log(`   Platform: ${platform}`);
    console.log(`   Device: ${deviceName}`);
    console.log(`   Total active tokens: ${await PushToken.countDocuments({ isActive: true })}`);

    return res.status(201).json({
      success: true,
      message: "Push token registered successfully",
      data: newToken,
    });
  } catch (error: any) {
    console.error("❌ Error registering push token:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Unregister push token (khi user logout hoặc xóa app)
 */
export const unregisterPushToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    const result = await PushToken.findOneAndUpdate(
      { token },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Push token unregistered successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Gửi notification KHÔNG CẦN ĐĂNG NHẬP - chỉ cần SECRET_KEY
 * Endpoint này cho phép gửi notification từ bất kỳ đâu mà không cần JWT
 */
export const sendNotificationWithSecret = async (req: Request, res: Response) => {
  try {
    const { secretKey, title, body, token, data, type, categoryName, categorySlug, episode } = req.body;

    // Verify secret key
    const NOTIFICATION_SECRET = process.env.NOTIFICATION_SECRET_KEY || "your-secret-key-here";
    
    if (!secretKey || secretKey !== NOTIFICATION_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    let result;

    // Option 1: Gửi notification với type cụ thể
    if (type === "new_episode" && categoryName && episode && categorySlug) {
      result = await notifyNewEpisode(categoryName, parseInt(episode), categorySlug);
    } else if (type === "new_category" && categoryName && categorySlug) {
      result = await notifyNewCategory(categoryName, categorySlug);
    } 
    // Option 2: Gửi custom notification
    else if (token) {
      // Gửi đến specific token
      result = await sendPushNotification(token, { title, body, data });
    } else {
      // Gửi đến tất cả devices
      result = await sendNotificationToAll({ title, body, data });
    }

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Gửi test notification (cho admin test)
 */
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, token, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    let result;

    if (token) {
      // Gửi đến specific token
      result = await sendPushNotification(token, { title, body, data });
    } else {
      // Gửi đến tất cả devices
      result = await sendNotificationToAll({ title, body, data });
    }

    return res.status(200).json({
      success: true,
      message: "Test notification sent",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy danh sách active tokens (cho admin)
 */
export const getActiveTokens = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const tokens = await PushToken.find({ isActive: true })
      .select("token userId deviceInfo createdAt lastUsed")
      .populate("userId", "username email")
      .sort({ lastUsed: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await PushToken.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      data: tokens,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xóa inactive tokens (cleanup)
 */
export const cleanupInactiveTokens = async (req: Request, res: Response) => {
  try {
    const daysAgo = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const result = await PushToken.deleteMany({
      isActive: false,
      lastUsed: { $lt: cutoffDate },
    });

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} inactive tokens`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
