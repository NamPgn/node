import express from "express";
import "dotenv/config";
import { connectDatabase } from "./src/config/database";
import { initializeFirebase } from "./src/config/firebase";
import { configureExpress } from "./src/config/express";
import { configureRoutes } from "./src/config/routes";

const port = process.env.PORT || 8080;
const app = express();

// Configure Express
configureExpress(app);

// Configure Routes
configureRoutes(app);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Firebase
    initializeFirebase();

    // Start listening
    app.listen(port, () => {
      console.log(`
        🚀 Server is running!
        🔉 Listening on port ${port}
        📝 Keep track of the logs for any issues
      `);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
