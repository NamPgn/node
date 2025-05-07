import Redis from 'ioredis';

// Common config shared for all clients
const commonConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: (err: Error) => {
    return err.message.includes("READONLY");
  },
  retryStrategy: (times: number) => Math.min(times * 50, 2000)
};

// Environment-specific configs
const envConfig = process.env.NODE_ENV === 'production'
  ? {
      port: Number(process.env.REDIS_PORT) || 18098,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    }
  : {
      port: 6379,
      host: "127.0.0.1",
    };

// Merge configs 
export const config = {
  ...envConfig,
  ...commonConfig,
};
// Create main Redis client
const redisClient = new Redis(config);

// // Publisher
// export const publisher = new Redis(config);
// publisher.on("connect", () => console.log("📤 Redis Publisher connected"));
// publisher.on("error", (err) => console.error("❌ Redis Publisher error:", err));

// // Subscriber
// export const subscriber = new Redis(config);
// subscriber.on("connect", () => console.log("📥 Redis Subscriber connected"));
// subscriber.on("error", (err) => console.error("❌ Redis Subscriber error:", err));

// Main client (optional use)
redisClient.on("connect", () => {
  console.log(`✅ Redis connected in ${process.env.NODE_ENV} mode`);
});
redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redisClient;
