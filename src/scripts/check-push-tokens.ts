/**
 * Script kiểm tra push tokens trong database
 * 
 * Chạy: npx ts-node src/scripts/check-push-tokens.ts
 */

import { connectDatabase } from "../config/database";
import PushToken from "../module/push.token";
import "dotenv/config";

async function checkTokens() {
  try {
    await connectDatabase();

    console.log("🔍 Checking push tokens in database...\n");

    // Count tokens
    const totalTokens = await PushToken.countDocuments();
    const activeTokens = await PushToken.countDocuments({ isActive: true });
    const inactiveTokens = await PushToken.countDocuments({ isActive: false });

    console.log(`📊 Statistics:`);
    console.log(`   Total tokens: ${totalTokens}`);
    console.log(`   Active tokens: ${activeTokens}`);
    console.log(`   Inactive tokens: ${inactiveTokens}\n`);

    if (totalTokens === 0) {
      console.log("❌ KHÔNG CÓ THIẾT BỊ NÀO ĐĂNG KÝ!");
      console.log("\n💡 Cần làm:");
      console.log("   1. Mở mobile app (Expo)");
      console.log("   2. App sẽ tự động register push token");
      console.log("   3. Hoặc call API: POST /api/push-token/register");
      console.log("\n📖 Xem hướng dẫn: node/README_PUSH_NOTIFICATION.md\n");
      process.exit(0);
    }

    // Show active tokens
    if (activeTokens > 0) {
      console.log(`✅ Active tokens (${activeTokens}):`);
      const tokens = await PushToken.find({ isActive: true })
        .populate("userId", "username email")
        .select("token userId deviceInfo lastUsed createdAt")
        .limit(10);

      tokens.forEach((token :any, index) => {
        console.log(`\n   ${index + 1}. ${token.deviceInfo?.platform?.toUpperCase() || "N/A"} - ${token.deviceInfo?.deviceName || "Unknown"}`);
        console.log(`      Token: ${token.token.substring(0, 40)}...`);
        console.log(`      User: ${token.userId?.username || "Guest"}`);
        console.log(`      Last used: ${token.lastUsed}`);
      });
    }

    // Show platform breakdown
    const android = await PushToken.countDocuments({ 
      isActive: true, 
      "deviceInfo.platform": "android" 
    });
    const ios = await PushToken.countDocuments({ 
      isActive: true, 
      "deviceInfo.platform": "ios" 
    });
    const web = await PushToken.countDocuments({ 
      isActive: true, 
      "deviceInfo.platform": "web" 
    });

    console.log(`\n📱 Platform breakdown:`);
    console.log(`   Android: ${android}`);
    console.log(`   iOS: ${ios}`);
    console.log(`   Web: ${web}\n`);

    console.log("✅ Check completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkTokens();

