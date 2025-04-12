import { redisDel } from "../redis";

export const invalidateSeasonCacheByProduct = async (slugs: string | string[]) => {
  try {
    if (!slugs) return;
    
    // Chuyển đổi slug thành mảng nếu là string
    const slugArray = Array.isArray(slugs) ? slugs : [slugs];
    
    // Xóa cache cho tất cả các season liên quan
    await Promise.all(
      slugArray.map(async (slug) => {
        const key = `season:${slug}`;
        await redisDel(key);
        console.log(`✅ Cache invalidated for key: ${key}`);
      })
    );
  } catch (err) {
    console.error("❌ Error invalidating season cache:", err);
  }
};
