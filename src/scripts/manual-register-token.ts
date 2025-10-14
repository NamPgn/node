/**
 * Script để manual register push token (cho testing)
 * 
 * Chạy: npx ts-node src/scripts/manual-register-token.ts
 */

import { connectDatabase } from "../config/database";
import PushToken from "../module/push.token";
import "dotenv/config";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function registerToken() {
  try {
    await connectDatabase();

    console.log("📱 Manual Register Push Token\n");
    console.log("💡 Lấy token từ mobile app:");
    console.log("   - Mở Expo app");
    console.log("   - Check console logs");
    console.log("   - Copy ExponentPushToken[...]\n");

    rl.question("Nhập push token: ", async (token) => {
      if (!token || !token.startsWith("ExponentPushToken[")) {
        console.log("❌ Invalid token format!");
        console.log("   Token phải có format: ExponentPushToken[xxxxxx]");
        process.exit(1);
      }

      try {
        // Check if exists
        const existing = await PushToken.findOne({ token });
        if (existing) {
          console.log("⚠️ Token already exists, updating...");
          existing.isActive = true;
          existing.lastUsed = new Date();
          await existing.save();
          console.log("✅ Token updated!");
        } else {
          // Create new
          const newToken = await PushToken.create({
            token,
            deviceInfo: {
              platform: "android",
              deviceName: "Test Device",
              appVersion: "1.0.0",
            },
            isActive: true,
            lastUsed: new Date(),
          });
          console.log("✅ Token registered successfully!");
          console.log(`   ID: ${newToken._id}`);
        }

        console.log(`\n📊 Total active tokens: ${await PushToken.countDocuments({ isActive: true })}`);
        
        process.exit(0);
      } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
  }
}

registerToken();

