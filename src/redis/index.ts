const Redis = require("ioredis");

const redisClient = new Redis({
  port: 18098,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

// const redisClient = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
// });


export async function getDataFromCache(key) {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  } else {
    return null;
  }
}

export const cacheData = async (key, data, ...rest) => {
  await redisClient.set(key, JSON.stringify(data), ...rest);
}

export async function getDataFromServer(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export const getData = async (url) => {
  const cachedData = await getDataFromCache(url);
  if (cachedData) {
    return cachedData;
  } else {
    const data = await getDataFromServer(url);
    await cacheData(url, data);
    return data;
  }
}


redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("Failed to connect to Redis", error);
});



export default redisClient;