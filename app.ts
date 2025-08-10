import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./src/config/database";
import { initializeFirebase } from "./src/config/firebase";
import { configureExpress } from "./src/config/express";
import { configureRoutes } from "./src/config/routes";

const port = process.env.PORT_LOCAL || 8080;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 150, // tối đa 100 requests per 15 phút
  message: {
    error: "Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Initialize Express
    const app = express();

    // Apply rate limiting
    app.use(limiter);

    // Configure Express (middleware, CORS, etc.)
    await configureExpress(app);

    // Configure Routes
    configureRoutes(app);

    // Initialize Firebase
    initializeFirebase();

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