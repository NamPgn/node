import { Queue, Worker } from 'bullmq';
import { getCategory } from '../services/category';
import { resizeImageUrl } from '../utills/resizeImage';
import redisClient from './redis.config';
import Products from '../module/products';
import { cacheData } from '../redis';

// Category Queue Configuration
export const categoryQueue = new Queue("categoryQueue", {
  connection: redisClient,
  streams: {
    events: {
      maxLen: 1000,
    },
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600,
      count: 100,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  },
});

// Create worker instance
export const categoryWorker = new Worker(
  "categoryQueue",
  async (job) => {
    const { id } = job.data;
    try {
      const category = await getCategory(id);

      if (!category) {
        throw new Error("Danh mục không tồn tại " + id);
      }
      return {
        ...category.toObject(),
        linkImg: resizeImageUrl(category.linkImg, 300, 450),
      };
    } catch (error: any) {
      console.error(`Error in getCategory: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 2,
    lockDuration: 60000,
  }
);

// Products Queue Configuration
export const productsQueue = new Queue("productQueue", {
  connection: redisClient,
  streams: {
    events: {
      maxLen: 1000,
    },
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600,
      count: 200,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  },
});

export const productWorker = new Worker(
  "productQueue",
  async (job) => {
    const { id } = job.data;

    // Lấy dữ liệu từ MongoDB
    const dataID: any = await Products.findOne({ slug: id })
      .populate("comments.user", "username image")
      .populate({
        path: "category",
        populate: {
          path: "products",
          model: "Products",
          select: "seri isApproved slug",
        },
      });

    if (!dataID) {
      throw new Error("Sản phẩm không tồn tại");
    }

    dataID.category?.products.sort(
      (a: any, b: any) => parseInt(b.seri) - parseInt(a.seri)
    );
    dataID.view += 1;
    await dataID.save();

    // Cache the result immediately
    await cacheData(id, dataID, "EX", 3600, "NX");

    return dataID;
  },
  {
    connection: redisClient,
    concurrency: 2,
    removeOnComplete: { age: 3600, count: 200 },
    removeOnFail: { age: 86400 },
    lockDuration: 60000,
  }
);

// Set max listeners for workers
categoryWorker.setMaxListeners(20);
productWorker.setMaxListeners(20);

// Handle worker events
categoryWorker.on('completed', (job) => {
  console.log(`Category Job ${job.id} completed`);
});

categoryWorker.on('failed', (job, err) => {
  console.error(`Category Job ${job?.id} failed:`, err);
});

productWorker.on('completed', (job) => {
  console.log(`Product Job ${job.id} completed`);
});

productWorker.on('failed', (job, err) => {
  console.error(`Product Job ${job?.id} failed:`, err);
});

// Export function to initialize BullMQ
export const initializeBullMQ = async () => {
  try {
    // Clear any stuck jobs
    await Promise.all([
      categoryQueue.clean(0, 'failed' as any),
      categoryQueue.clean(0, 'completed' as any),
      productsQueue.clean(0, 'failed' as any),
      productsQueue.clean(0, 'completed' as any),
    ]);

    // Start workers
    await Promise.all([
      categoryWorker.run(),
      productWorker.run(),
    ]);

    console.log('✅ BullMQ initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize BullMQ:', error);
    throw error;
  }
}; 