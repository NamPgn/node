const Redis = require('ioredis');
const redisClient = new Redis({
  host: 'localhost',
  port: '127.0.0.1',
  password: null
});
export async function getDataFromCache(key) {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  } else {
    return null;
  }
}

export const cacheData = async (key, data) => {
  await redisClient.set(key, JSON.stringify(data));
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