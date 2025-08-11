import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./src/config/database";
import { initializeFirebase } from "./src/config/firebase";
import { configureExpress } from "./src/config/express";
import { configureRoutes } from "./src/config/routes";

const port = process.env.PORT_LOCAL || 8080;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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