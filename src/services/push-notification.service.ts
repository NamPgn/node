import axios from "axios";
import PushToken from "../module/push.token";

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

    const messages: PushMessage[] = validTokens.map((token) => ({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      sound: payload.sound || "default",
      badge: payload.badge,
      priority: "high",
      channelId: "default",
    }));

    // Gửi qua Expo Push Notification API
    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Push notification sent:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Error sending push notification:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi notification đến tất cả active devices
 */
export const sendNotificationToAll = async (
  payload: NotificationPayload
): Promise<any> => {
  try {
    console.log("\n🔍 [sendNotificationToAll] Starting...");
    console.log(`   Payload: ${JSON.stringify(payload, null, 2)}`);
    
    const activeTokens = await PushToken.find({ isActive: true }).select("token");
    const tokens = activeTokens.map((doc) => doc.token);

    console.log(`   Found ${tokens.length} active device(s) in database`);

    if (tokens.length === 0) {
      console.warn("❌ No active push tokens found!");
      console.warn("💡 Cần register push token từ mobile app trước");
      console.warn("   Run: npx ts-node src/scripts/check-push-tokens.ts");
      return { success: false, message: "No active tokens" };
    }

    console.log(`📤 Sending notification to ${tokens.length} device(s)...`);
    const result = await sendPushNotification(tokens, payload);
    console.log(`✅ Notification sent result:`, result);
    return result;
  } catch (error: any) {
    console.error("❌ Error sending notification to all:", error.message);
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
 */
export const notifyNewEpisode = async (categoryName: string, episode: number, categorySlug: string) => {
  console.log("\n🎬 [notifyNewEpisode] Triggered!");
  console.log(`   Category: ${categoryName}`);
  console.log(`   Episode: ${episode}`);
  console.log(`   Slug: ${categorySlug}`);
  
  return await sendNotificationToAll({
    title: `Tập ${episode} mới đã ra! 🎬`,
    body: `${categoryName} - Tập ${episode} vừa được cập nhật`,
    data: {
      type: "new_episode",
      categorySlug,
      episode: episode.toString(),
    },
    sound: "default",
  });
};

/**
 * Gửi notification khi có phim mới
 */
export const notifyNewCategory = async (categoryName: string, categorySlug: string) => {
  return await sendNotificationToAll({
    title: "Phim mới đã ra mắt! 🎉",
    body: `${categoryName} đã được thêm vào thư viện`,
    data: {
      type: "new_category",
      categorySlug,
    },
    sound: "default",
  });
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

