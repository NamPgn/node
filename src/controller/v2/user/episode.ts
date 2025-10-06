import { Request, Response } from "express";
import Products from "../../../module/products";
import { cacheData, getDataFromCache } from "../../../redis";
import Category from "../../../module/category";
import { redisDel } from "../../../redis";
import { resizeImagesUrl } from "../../../utills/resizeImage";

/**
 * User: Lấy danh sách products (chỉ những đã approve)
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const categoryId = req.query.categoryId as string;

    const query: any = {
      isApproved: true
    };

    if (categoryId) {
      query.category = categoryId;
    }

    // Cache key
    const key = `user_products_${categoryId || 'all'}_${page}_${limit}`;
    const redisData = await getDataFromCache(key);

    let products: any;
    let totalCount: number;

    if (redisData) {
      ({ products, totalCount } = redisData);
    } else {
      products = await Products.find(query)
        .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail')
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .populate({
          path: "category",
          select: "lang quality name vs",
        })
        .exec();

      totalCount = await Products.countDocuments(query);

      // Cache
      const { cacheData } = await import("../../../redis");
      cacheData(key, { products, totalCount }, "EX", 3600);
    }

    return res.status(200).json({
      success: true,
      data: products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      userData: {
        onlyApproved: true
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
 * User: Lấy chi tiết một product
 */
export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Products.findOne({ slug: id, isApproved: true })
      .select('-LinkCopyright -trailer -rating -comments -updatedAt -__v -select')
      .populate({
        path: "category",
        select: "-__v -createdAt -comment -searchCount -week -rating -ratingCount -country -upcomingReleases -relatedSeasons -isDeleted -season -hour",
        populate: [
          {
            path: "products",
            model: "Products",
            select: "seri slug -_id thumnail",
          }
        ]
      });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not approved"
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * User: Tăng view count
 */
export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Products.findOneAndUpdate(
      { slug: id, isApproved: true },
      { $inc: { view: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not approved"
      });
    }

    return res.status(200).json({
      success: true,
      message: "View count updated",
      viewCount: product.view
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const getCategory2d = async (req, res) => {
  try {
    let KEY = "LASTESTCATEGORY2D";

    let getDataFromCaches = await getDataFromCache(KEY);

    if (!getDataFromCaches) {
      // Nếu chưa có cache thì query từ DB
      const data = await Category.aggregate([
        { $sort: { latestProductUploadDate: -1 } },
        { $limit: 16 },
        { $match: { vs: "2d" } },
        {
          $lookup: {
            from: "products",
            localField: "products",
            foreignField: "_id",
            as: "products",
            pipeline: [
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              { $project: { seri: 1 } }
              
            ]
          }
        },
        {
          $project: {
            name: 1,
            linkImg: 1,
            slug: 1,
            sumSeri: 1,
            isMovie: 1,
            products: 1,
            hour: 1,
            lang: 1,
            quality: 1,
            year: 1,
            time: 1,
            anotherName: 1,
            thuyetMinh: 1,
            newMovie: 1,
            isActive: 1,
          }
        }
      ]);

      // Gọi resizeImagesUrl để thay đổi ảnh
      const updatedData = resizeImagesUrl(data, 'linkImg', 300, 450);

      // Cập nhật lại dữ liệu đã thay đổi ảnh
      await cacheData(KEY, updatedData, "EX", 3600);
      getDataFromCaches = updatedData;
    }

    Products.watch().on("change", async (change) => {
      const operationTypes = ["insert", "delete", "update"];
      if (operationTypes.includes(change.operationType)) {
        await redisDel(KEY);  
      }
    }); 

    return res.json({
      data: getDataFromCaches,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};