import Redis from 'ioredis';

// Production config
export const productionConfig = {
  port: 18098,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Development config
export const developmentConfig = {
  port: 6379,
  host: "127.0.0.1",
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

// Common config options
const commonConfig = {
  reconnectOnError: (err: Error) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

// Create Redis client based on environment
const config = process.env.NODE_ENV === 'production' 
  ? { ...productionConfig, ...commonConfig }
  : { ...developmentConfig, ...commonConfig };

const redisClient = new Redis(config);

// Event handlers
redisClient.on("connect", () => {
  process.env.NODE_ENV === 'production' ? console.log('✅ Redis connected production successfully') : console.log('✅ Redis connected development successfully');
//   console.log("✅ Redis connected successfully");
});

redisClient.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export default redisClient; 