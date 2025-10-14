/**
 * Script để test push notification
 * 
 * Chạy: ts-node src/scripts/test-notification.ts
 */

import { sendNotificationToAll, sendPushNotification } from "../services/push-notification.service";
import PushToken from "../module/push.token";
import { connectDatabase } from "../config/database";
import "dotenv/config";

async function testNotification() {
  try {
    // Connect to database
    await connectDatabase();

    console.log("🔍 Finding active push tokens...");
    const tokens = await PushToken.find({ isActive: true }).select("token");
    
    if (tokens.length === 0) {
      console.log("⚠️ No active push tokens found!");
      console.log("💡 Register a token first from mobile app");
      process.exit(0);
    }

    console.log(`📱 Found ${tokens.length} active device(s)`);

    // Test 1: Send to all
    console.log("\n📤 Sending test notification to all devices...");
    const result1 = await sendNotificationToAll({
      title: "Test Notification 🎬",
      body: "Đây là test notification từ backend!",
      data: {
        type: "announcement",
        testField: "test value",
      },
      sound: "default",
    });

    console.log("✅ Result:", result1);

    // Test 2: Send to first device only
    if (tokens.length > 0) {
      console.log("\n📤 Sending notification to first device...");
      const result2 = await sendPushNotification(tokens[0].token, {
        title: "Single Device Test 📱",
        body: "Notification gửi đến device đầu tiên",
        data: {
          type: "new_episode",
          categorySlug: "test-category",
          episode: "1",
        },
      });

      console.log("✅ Result:", result2);
    }

    console.log("\n✅ Test completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testNotification();

