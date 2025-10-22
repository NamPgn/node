import axios from "axios";
import PushToken from "../module/push.token";
import Notification, { INotificationModel } from "../module/notification";
import Category from "../module/category";

/**
 * Expo Push Notification Service URL
 * 
 * Đây là URL CHÍNH THỨC và MIỄN PHÍ của Expo
 * - Không cần setup Firebase/APNs
 * - Tự động route đến FCM (Android) và APNs (iOS)
 * - Rate limit: 600 notifications/phút, 100k/ngày
 * - Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 * 
 * KHÔNG CẦN THAY ĐỔI URL này!
 */
const EXPO_PUSH_URL = process.env.EXPO_PUSH_URL || "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: any;
  sound?: "default" | null;
  badge?: number;
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type?: "new_episode" | "new_category" | "announcement";
    categorySlug?: string;
    productSlug?: string;
    [key: string]: any;
  };
  sound?: "default" | null;
  badge?: number;
}

/**
 * Gửi push notification đến 1 hoặc nhiều thiết bị
 */
export const sendPushNotification = async (
  tokens: string | string[],
  payload: NotificationPayload
): Promise<any> => {
  try {
    const tokensArray = Array.isArray(tokens) ? tokens : [tokens];

    // Filter valid Expo push tokens
    const validTokens = tokensArray.filter((token) =>
      token.startsWith("ExponentPushToken[")
    );

    if (validTokens.length === 0) {
      console.warn("No valid Expo push tokens found");
      return { success: false, message: "No valid tokens" };
    }

    // **CHIA THÀNH BATCHES 100 TOKENS**
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < validTokens.length; i += BATCH_SIZE) {
      batches.push(validTokens.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Sending ${validTokens.length} notifications in ${batches.length} batches`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // **GỬI TỪNG BATCH**
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      const messages: PushMessage[] = batch.map((token) => ({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || "default",
        badge: payload.badge,
        priority: "high",
        channelId: "default",
      }));

      try {
        const response = await axios.post(EXPO_PUSH_URL, messages, {
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
        });

        console.log(`✅ Batch ${i + 1}/${batches.length} sent successfully`);
        
        // Đếm success/failure từ response
        const batchResults = response.data.data || [];
        batchResults.forEach((result: any) => {
          if (result.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
          }
        });

        results.push(response.data);

        // **DELAY GIỮA CÁC BATCH để tránh rate limit**
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error: any) {
        console.error(`❌ Batch ${i + 1}/${batches.length} failed:`, error.response?.data || error.message);
        failureCount += batch.length;
        results.push({ error: error.message, batch: i + 1 });
      }
    }

    return { 
      success: successCount > 0, 
      successCount,
      failureCount,
      totalBatches: batches.length,
      data: results 
    };

  } catch (error: any) {
    console.error("❌ Error sending push notification:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi notification đến tất cả active devices
 * @param payload - Notification content
 * @param saveToDb - Có lưu vào DB không (default: true)
 * @param notificationData - Metadata để lưu DB (categoryId, productId, episodeNumber, sentBy)
 */
export const sendNotificationToAll = async (
  payload: NotificationPayload,
  saveToDb: boolean = true,
  notificationData?: {
    categoryId?: string;
    categorySlug?: string;
    productId?: string;
    productSlug?: string;
    episodeNumber?: number;
    sentBy?: string;
  }
): Promise<any> => {
  try {
    const activeTokens = await PushToken.find({ isActive: true }).select("token");

    // **LẤY MẢNG TOKEN, KHÔNG CẦN MAP THÀNH OBJECT**
    const tokens = activeTokens.map(t => t.token);

    if (tokens.length === 0) {
      return { success: false, message: "No active tokens" };
    }

    console.log(`📨 Sending notification to ${tokens.length} devices...`);

    // Gửi push notification (đã có batch processing bên trong)
    const result = await sendPushNotification(tokens, payload);

    // Lưu vào DB nếu được yêu cầu
    if (saveToDb && notificationData) {
      const notificationRecord = new Notification({
        title: payload.title,
        body: payload.body,
        categoryId: notificationData.categoryId,
        categorySlug: notificationData.categorySlug || payload.data?.categorySlug,
        productId: notificationData.productId,
        productSlug: notificationData.productSlug,
        episodeNumber: notificationData.episodeNumber,
        sentBy: notificationData.sentBy,
        totalRecipients: tokens.length,
        successCount: result.successCount || 0,
        failureCount: result.failureCount || 0,
        data: payload.data,
        platform: "expo",
        status: result.success ? "sent" : "failed",
        errorMessage: result.success ? undefined : result.error,
      });

      await notificationRecord.save();
      console.log(`💾 Notification saved to DB: ${notificationRecord._id}`);
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
/**
 * Gửi notification đến specific user
 */
export const sendNotificationToUser = async (
  userId: string,
  payload: NotificationPayload
): Promise<any> => {
  try {
    const userTokens = await PushToken.find({ 
      userId, 
      isActive: true 
    }).select("token");

    if (userTokens.length === 0) {
      console.warn(`No active tokens for user ${userId}`);
      return { success: false, message: "No tokens for user" };
    }

    const tokens = userTokens.map((doc) => doc.token);
    return await sendPushNotification(tokens, payload);
  } catch (error: any) {
    console.error("❌ Error sending notification to user:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi notification khi có episode mới
 * @param categoryName - Tên phim/series
 * @param episode - Số tập
 * @param categorySlug - Slug để navigate
 * @param productId - ID của product (episode)
 * @param sentBy - User ID của admin gửi
 */
export const notifyNewEpisode = async (
  categoryName: string, 
  episode: number, 
  categorySlug: string,
  productId?: string,
  productSlug?: string,
  sentBy?: string
) => {
  try {
    // Kiểm tra đã gửi notification cho episode này chưa
    const hasNotified = await (Notification as INotificationModel).hasNotifiedEpisode(categorySlug, episode);
    if (hasNotified) {
      console.log(`⚠️ Notification for ${categorySlug} episode ${episode} already sent. Skipping...`);
      return { success: false, message: "Already notified for this episode" };
    }

    // Lấy category ID từ slug
    const category = await Category.findOne({ slug: categorySlug }).select("_id name");
    if (!category) {
      console.error(`❌ Category not found for slug: ${categorySlug}`);
      return { success: false, message: "Category not found" };
    }

    return await sendNotificationToAll(
      {
        title: `Tập ${episode} mới đã ra! 🎬`,
        body: `${categoryName} - Tập ${episode} vừa được cập nhật`,
        data: {
          type: "new_episode",
          categorySlug,
          episode: episode.toString(),
          productId,
          productSlug,
        },
        sound: "default",
      },
      true, // Save to DB
      {
        categoryId: category._id.toString(),
        categorySlug,
        productId,
        productSlug,
        episodeNumber: episode,
        sentBy,
      }
    );
  } catch (error: any) {
    console.error("❌ Error in notifyNewEpisode:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi notification khi có phim mới
 * @param categoryName - Tên phim/series
 * @param categorySlug - Slug để navigate
 * @param categoryId - ID của category
 * @param sentBy - User ID của admin gửi
 */
export const notifyNewCategory = async (
  categoryName: string, 
  categorySlug: string,
  categoryId?: string,
  sentBy?: string
) => {
  try {
    // Nếu không có categoryId, tìm từ slug
    if (!categoryId) {
      const category = await Category.findOne({ slug: categorySlug }).select("_id");
      categoryId = category?._id.toString();
    }

    return await sendNotificationToAll(
      {
        title: "Phim mới đã ra mắt! 🎉",
        body: `${categoryName} đã được thêm vào thư viện`,
        data: {
          type: "new_category",
          categorySlug,
        },
        sound: "default",
      },
      true, // Save to DB
      {
        categoryId,
        categorySlug,
        episodeNumber: 1, // Phim mới = episode 1
        sentBy,
      }
    );
  } catch (error: any) {
    console.error("❌ Error in notifyNewCategory:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Cleanup invalid tokens
 */
export const cleanupInvalidTokens = async (invalidTokens: string[]) => {
  try {
    await PushToken.updateMany(
      { token: { $in: invalidTokens } },
      { $set: { isActive: false } }
    );
    console.log(`🧹 Cleaned up ${invalidTokens.length} invalid tokens`);
  } catch (error: any) {
    console.error("❌ Error cleaning up tokens:", error.message);
  }
};

