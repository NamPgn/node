import redisClient from "../config/redis.config";
import { productsQueue } from "../controller/products";
import Products from "../module/products";


// const redisClient = new Redis({
//   port: 18098,
//   host: process.env.REDIS_HOST,
//   password: process.env.REDIS_PASSWORD,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   reconnectOnError: (err) => {
//     const targetError = "READONLY";
//     if (err.message.includes(targetError)) {
//       // Only reconnect when the error contains "READONLY"
//       return true; // or `return 1;`
//     }
//   },
//   retryStrategy: (times) => {
//     // Xác định thời gian giữa các lần thử kết nối lại
//     return Math.min(times * 50, 2000);
//   },
// });

// const redisClient = new Redis({
//   port: 6379,
//   host: "127.0.0.1",
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   reconnectOnError: (err) => {
//     const targetError = "READONLY";
//     if (err.message.includes(targetError)) {
//       //Only reconnect when the error contains "READONLY"
//       return true; // or `return 1;`
//     }
//   },
//   retryStrategy: (times) => {
//     //Xác định thời gian giữa các lần thử kết nối lại
//     return Math.min(times * 50, 2000);
//   },
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
};

export const redisDel = async (key) => {
  await redisClient.del(key);
};


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
};


export const getCategoryVersion = async (categoryId: string) => {
  const version = await redisClient.get(`category:${categoryId}:version`);
  return version || '1';
};

const invalidateAllCacheForCategory = async (categoryId: string) => {
  try {
    // Lấy tất cả products thuộc category này
    const products = await Products.find({ category: categoryId }).select('slug');

    for (const product of products) {
      // Xóa tất cả version cache của product này
      const oldKeys = await redisClient.keys(`${product.slug}:v*`);
      if (oldKeys.length > 0) {
        await redisClient.del(oldKeys);
        console.log(`Deleted cache for product ${product.slug}: ${oldKeys.join(', ')}`);
      }

      // Xóa current mapping
      await redisClient.del(`${product.slug}:current`);
    }

    console.log(`Invalidated all cache for category ${categoryId}`);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

export const incrementCategoryVersion = async (categoryId: any) => {
  const categoryIdStr = categoryId.toString();
  const newVersion = await redisClient.incr(`category:${categoryIdStr}:version`);

  // Xóa cache cũ
  await invalidateAllCacheForCategory(categoryIdStr);

  // ✅ XÓA JOBS trong Bull Queue
  await clearBullQueueJobs(categoryId);

  console.log(`Category ${categoryIdStr} version incremented to ${newVersion}`);
  return newVersion;
};

const clearBullQueueJobs = async (categoryId: string) => {
  try {
    console.log('=== CLEARING BULL QUEUE JOBS ===');

    // Lấy tất cả products thuộc category
    const products = await Products.find({ category: categoryId }).select('slug');
    const slugsToRemove = products.map(p => p.slug);

    console.log(`Products to clear: ${slugsToRemove.join(', ')}`);

    // Lấy tất cả jobs hiện tại
    const allStates = ['waiting', 'active', 'delayed', 'completed', 'failed'];

    for (const state of allStates) {
      const jobs = await productsQueue.getJobs([state]);
      console.log(`Checking ${jobs.length} jobs in state: ${state}`);

      for (const job of jobs) {
        // Kiểm tra jobId hoặc data.id
        const shouldRemove = slugsToRemove.includes(job.id) ||
          (job.data && slugsToRemove.includes(job.data.id));

        if (shouldRemove) {
          try {
            await job.remove();
            console.log(`✅ Removed job ${job.id} (${state}) for product ${job.data?.id || job.id}`);
          } catch (removeError) {
            console.log(`❌ Failed to remove job ${job.id}:`, removeError.message);
          }
        }
      }
    }

    console.log('=== FINISHED CLEARING JOBS ===');

  } catch (error) {
    console.error('Error clearing Bull Queue jobs:', error);
  }
};


export const cacheDataWithVersion = async (key: string, data: any, expiry: number, categoryId: any) => {
  const categoryIdStr = categoryId.toString();
  const version = await getCategoryVersion(categoryIdStr);

  // ✅ Cache theo category version thay vì product version
  const versionedKey = `${key}:category${categoryIdStr}:v${version}`;

  await redisClient.setex(versionedKey, expiry, JSON.stringify(data));
  console.log(`Cached ${versionedKey}`);
};

export const getDataWithVersion = async (key: string, categoryId: any) => {
  const categoryIdStr = categoryId.toString();
  const version = await getCategoryVersion(categoryIdStr);
  const versionedKey = `${key}:category${categoryIdStr}:v${version}`;

  console.log(`Looking for cache: ${versionedKey}`);

  const data = await redisClient.get(versionedKey);
  return data ? JSON.parse(data) : null;
};



// redisClient.on("connect", () => {
//   console.log("Connected to Redis");
// });

// redisClient.on("error", (error) => {
//   console.error("Failed to connect to Redis", error);
// });

// export default redisClient;
