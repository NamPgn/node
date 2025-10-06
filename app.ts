import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./src/config/database";
import { configureExpress } from "./src/config/express";
import { configureRoutes, configureRoutesV2 } from "./src/config/routes";

const port = process.env.PORT_LOCAL || 8080;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    error: "Too many requests from this IP, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const startServer = async () => {
  try {
    await connectDatabase();

    const app = express();

    app.use(limiter);

    await configureExpress(app);

    // Configure Routes
    configureRoutes(app);
    configureRoutesV2(app);
    // Initialize Firebase
    // initializeFirebase();

    // Start server
    app.listen(port, () => {
      console.log(`
        🚀 Server is running!
        🔉 Listening on port ${port}
        🛡️  Rate limiting: 100 requests/15min
        📝 Keep track of the logs for any issues
      `);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};
startServer();


// Chạy migration để thêm tag vào tất cả categories
// fixVersionField(); // Uncomment để chạy migration

// async function fixVersionField() {
//   try {
//     console.log("🔄 Đang convert version từ array sang string...");


//     const result = await category.updateMany(
//       {}, // áp dụng cho tất cả document
//       { $set: { vs: "3d" } }
//     );

//     console.log(`Found ${result.modifiedCount} documents với version dạng array`);

//     console.log("🎉 Migration hoàn tất!");
//   } catch (err) {
//     console.error("❌ Lỗi migration:", err);
//   } finally {
//     mongoose.connection.close();
//   }
// }


