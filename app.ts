import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./src/config/database";
// import { initializeFirebase } from "./src/config/firebase";
import { configureExpress } from "./src/config/express";
import { configureRoutes } from "./src/config/routes";
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

    // Initialize Firebase
    // initializeFirebase();

    // Start server
    app.listen(port, () => {
      console.log(`
        🚀 Server is running hhihihehe
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

// import CryptoJS from "crypto-js";
// const SECRET_KEY = process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER || "";

// async function migrate() {

//   const episodes = await products.find({}); // lấy tất cả document
//   console.log(`Found ${episodes.length} episodes`);

//   for (const ep of episodes) {
//     if (!ep.dailyMotionServer) continue;
//     try {
//       // Giải mã
//       const decoded = CryptoJS.AES.decrypt(ep.dailyMotionServer, SECRET_KEY)
//         .toString(CryptoJS.enc.Utf8);

//       // Nếu decode thành công (không rỗng) thì update thành plain text
//       if (decoded) {
//         ep.dailyMotionServer = decoded;
//         await ep.save();
//         console.log(`✅ Updated episode ${ep._id}`);
//       } else {
//         console.log(`⚠️ Could not decode episode ${ep._id}`);
//       }
//     } catch (err) {
//       console.error(`❌ Error decoding ${ep._id}:`, err);
//     }
//   }
//   console.log("Migration done ✅");
// }

// migrate();