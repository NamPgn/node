// socket-server.ts
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { config as redisConfig } from "./redis.config";
import { ALLOWED_ORIGINS } from "../constants/constant";

const PORT:any = process.env.PORT || "8080"

export const createSocketServer = async () => {
  console.log("🔧 Initializing Socket.IO server...");

  // Redis Clients
  const pubClient = new Redis(redisConfig);
  const subClient = pubClient.duplicate();

  pubClient.on("connect", () => console.log("📤 Redis pubClient connected"));
  pubClient.on("error", (err) => console.error("❌ Redis pubClient error:", err));
  subClient.on("connect", () => console.log("📥 Redis subClient connected"));
  subClient.on("error", (err) => console.error("❌ Redis subClient error:", err));

  // CORS
  const corsOrigins =
    process.env.NODE_ENV === "production"
      ? ALLOWED_ORIGINS // Ex: https://yourdomain.com
      : "*";

  const io = new Server({
    adapter: createAdapter(pubClient, subClient),
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    allowEIO3: true
  });

  io.listen(PORT);
  console.log(`✅ Socket.IO server listening on port ${PORT} (${process.env.NODE_ENV})`);

  io.on("connection", (socket) => {
    console.log(`🔗 Client connected: ${socket.id}`);
    socket.emit("connection_success", { message: "connect success" });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    socket.on("error", (err) => {
      console.error("⚠️ Socket error:", err);
    });
  });
};
