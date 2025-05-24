import { Worker } from 'bullmq';

import { getCategory } from '../../services/category';
import { resizeImageUrl } from '../../utills/resizeImage';
import redisClient from '../redis.config';
export const categoryWorker = new Worker(
  'categoryQueue',
  async (job) => {
    const { id } = job.data;
    const category = await getCategory(id);

    if (!category) throw new Error("Danh mục không tồn tại " + id);

    return {
      ...category.toObject(),
      linkImg: resizeImageUrl(category.linkImg, 300, 450),
    };
  },
  {
    connection: redisClient,
    concurrency: 2,
    lockDuration: 60000,
  }
);

categoryWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

categoryWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed`, err.message);
});
