import {
  getAllCategory,
  getCategory,
  getCategoriesSitemap,
} from "../../../services/category";
import Category from "../../../module/category";
import { getDataFromCache } from "../../../redis";
import { Request, Response } from "express";

// ============ USER CATEGORY VIEWING ============

/**
 * User: Lấy danh sách categories (chỉ những active và không bị xóa)
 */
export const getAllCategories = async (req: any, res: Response) => {
  try {
    const limit = 24;
    const page = parseInt(req.query.page) || 0;
    const search = req.query.search || "";

    await Category.createIndexes();

    let key: string;
    let category: any;
    let totalCount: number;

    // Tạo cache key cho user
    if (search) {
      // Nếu có search thì cache ngắn hạn
      if (page === 0) {
        category = await getAllCategory(0, 0, search);
        totalCount = category.length;
      } else {
        category = await getAllCategory(page, limit, search);
        totalCount = await Category.countDocuments({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
            { des: { $regex: search, $options: "i" } }
          ],
          isActive: true,
          isDeleted: false
        });
      }
    } else {
      // Cache cho user
      if (page === 0) {
        key = `user_categorys_all`;
      } else {
        key = `user_categorys_page_${page}`;
      }

      const redisData = await getDataFromCache(key);
      if (redisData) {
        ({ category, totalCount } = redisData);
      } else {
        if (page === 0) {
          category = await getAllCategory(0, 0);
          totalCount = category.length;
        } else {
          category = await getAllCategory(page, limit);
          totalCount = await Category.countDocuments({
            isActive: true,
            isDeleted: false
          });
        }

        // User chỉ xem được categories active và không bị xóa
        category = category.filter((cat: any) => cat.isActive !== false && cat.isDeleted !== true);

        // Cache lâu hơn cho user (1 hour)
        const { cacheData } = await import("../../../redis");
        cacheData(key, { category, totalCount }, "EX", 3600);

        Category.watch().on("change", async (change) => {
          if (["insert", "delete", "update"].includes(change.operationType)) {
            const { redisDel } = await import("../../../redis");
            redisDel(key);
            if (page === 0) {
              const updatedCategory = await getAllCategory(0, 0);
              totalCount = updatedCategory.length;
            } else {
              const updatedCategory = await getAllCategory(page, limit);
              totalCount = await Category.countDocuments({
                isActive: true,
                isDeleted: false
              });
              cacheData(
                key,
                { category: updatedCategory, totalCount },
                "EX",
                3600
              );
            }
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: category,
      totalCount,
      totalPages: page === 0 ? 1 : Math.ceil(totalCount / limit),
      userData: {
        onlyActive: true
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * User: Lấy chi tiết một category (chỉ nếu active)
 */
export const getCategoryDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await getCategory(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // User chỉ xem được categories active và không bị xóa
    if (category.isActive === false || category.isDeleted === true) {
      return res.status(403).json({
        success: false,
        message: "Category is not available"
      });
    }

    // Filter products chỉ những đã approve
    if (category.products) {
      category.products = category.products.filter((product: any) => product.isApproved === true);
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy categories mới nhất
 */
export const getLatestCategories = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    // Cache key
    const key = `user_latest_categories_${limit}_${page}`;
    const redisData = await getDataFromCache(key);

    let categories: any;
    let totalCount: number;

    if (redisData) {
      ({ categories, totalCount } = redisData);
    } else {
      categories = await Category.find({
        isActive: true,
        isDeleted: false
      })
        .select('name slug linkImg des year time country up createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "week",
          model: "Week",
          select: "name -_id",
        })
        .exec();

      totalCount = await Category.countDocuments({
        isActive: true,
        isDeleted: false
      });

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, { categories, totalCount }, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy categories trending (most up)
 */
export const getTrendingCategories = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Cache key
    const key = `user_trending_categories_${limit}`;
    const redisData = await getDataFromCache(key);

    let categories: any;

    if (redisData) {
      categories = redisData;
    } else {
      categories = await Category.find({
        isActive: true,
        isDeleted: false,
        up: { $gt: 0 }
      })
        .select('name slug linkImg des year time country up')
        .sort({ up: -1 })
        .limit(limit)
        .populate({
          path: "week",
          model: "Week",
          select: "name -_id",
        })
        .exec();

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, categories, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      limit
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Tìm kiếm categories
 */
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const skip = (page - 1) * limit;

    // Cache key
    const key = `user_search_categories_${q}_${page}`;
    const redisData = await getDataFromCache(key);

    let categories: any;
    let totalCount: number;

    if (redisData) {
      ({ categories, totalCount } = redisData);
    } else {
      // Search trong name, des, anotherName
      const searchQuery = {
        isActive: true,
        isDeleted: false,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { des: { $regex: q, $options: 'i' } },
          { anotherName: { $regex: q, $options: 'i' } }
        ]
      };

      categories = await Category.find(searchQuery)
        .select('name slug linkImg des year time country up anotherName')
        .skip(skip)
        .limit(limit)
        .sort({ up: -1 })
        .populate({
          path: "week",
          model: "Week",
          select: "name -_id",
        })
        .exec();

      totalCount = await Category.countDocuments(searchQuery);

      // Cache ngắn hơn cho search
      const { cacheData } = await import("../../../redis");
      cacheData(key, { categories, totalCount }, "EX", 1800);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      searchQuery: q
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy categories theo năm
 */
export const getCategoriesByYear = async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    // Cache key
    const key = `user_categories_year_${year}_${page}`;
    const redisData = await getDataFromCache(key);

    let categories: any;
    let totalCount: number;

    if (redisData) {
      ({ categories, totalCount } = redisData);
    } else {
      categories = await Category.find({
        year: year,
        isActive: true,
        isDeleted: false
      })
        .select('name slug linkImg des time country up')
        .skip(skip)
        .limit(limit)
        .sort({ up: -1 })
        .populate({
          path: "week",
          model: "Week",
          select: "name -_id",
        })
        .exec();

      totalCount = await Category.countDocuments({
        year: year,
        isActive: true,
        isDeleted: false
      });

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, { categories, totalCount }, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      year
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy categories theo country
 */
export const getCategoriesByCountry = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    // Cache key
    const key = `user_categories_country_${country}_${page}`;
    const redisData = await getDataFromCache(key);

    let categories: any;
    let totalCount: number;

    if (redisData) {
      ({ categories, totalCount } = redisData);
    } else {
      categories = await Category.find({
        country: { $regex: country, $options: 'i' },
        isActive: true,
        isDeleted: false
      })
        .select('name slug linkImg des year time country up')
        .skip(skip)
        .limit(limit)
        .sort({ up: -1 })
        .populate({
          path: "week",
          model: "Week",
          select: "name -_id",
        })
        .exec();

      totalCount = await Category.countDocuments({
        country: { $regex: country, $options: 'i' },
        isActive: true,
        isDeleted: false
      });

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, { categories, totalCount }, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      country
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy categories sitemap (cho SEO)
 */
export const getCategoriesSitemap = async (req: Request, res: Response) => {
  try {
    // Cache key
    const key = `user_categories_sitemap`;
    const redisData = await getDataFromCache(key);

    let categories: any;

    if (redisData) {
      categories = redisData;
    } else {
      categories = await getCategoriesSitemap();
      
      // Filter chỉ active categories
      categories = categories.filter((cat: any) => cat.isActive !== false && cat.isDeleted !== true);

      // Cache lâu cho sitemap
      const { cacheData } = await import("../../../redis");
      cacheData(key, categories, "EX", 7200); // 2 hours
    }

    return res.status(200).json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Lấy upcoming releases
 */
export const getUpcomingReleases = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Cache key
    const key = `user_upcoming_releases_${limit}`;
    const redisData = await getDataFromCache(key);

    let categories: any;

    if (redisData) {
      categories = redisData;
    } else {
      categories = await Category.find({
        upcomingReleases: { $ne: "comeout" },
        isActive: true,
        isDeleted: false
      })
        .select('name slug linkImg des releaseDate upcomingReleases')
        .sort({ releaseDate: 1 })
        .limit(limit)
        .exec();

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, categories, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: categories,
      limit
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

