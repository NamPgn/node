const Redis = require("ioredis");
const redisClient = new Redis({
  port: 18098,
  host: "redis-18098.c279.us-central1-1.gce.cloud.redislabs.com",
  password: "z4C50Hin79yFR2IIWqBeq4gUD26USHir",
});

// const redisClient = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
// });


redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("Failed to connect to Redis", error);
});

export default redisClient;