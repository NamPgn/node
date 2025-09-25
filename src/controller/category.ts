import {
  addCategory,
  getAllCategory,
  getCategory,
  getCategoriesSitemap,
} from "../services/category";
import Products from "../module/products";
import Category from "../module/category";
import WeekCategory from "../module/week.category";
import weekCategory from "../module/week.category";
import { cacheData, getDataFromCache, redisDel } from "../redis";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { slugify } from "../utills/slugify";
import { resizeImagesUrl, resizeImageUrl } from "../utills/resizeImage";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import RecycleBin from "../module/recycle.bin";
import Tags from "../module/tags.module";
// import { RealtimeService } from "../services/realtime.service"; 


interface MulterRequest extends Request {
  file: any;
}

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

export const getAll = async (req: any, res: Response) => {
  try {
    const limit = 24;
    const page = parseInt(req.query.page) || 0;
    const search = req.query.search || "";

    await Category.createIndexes();

    let key: string;
    let category: any;
    let totalCount: number;

    // Tạo cache key khác nhau cho search và không search
    if (search) {
      // Nếu có search thì không cache hoặc cache ngắn hạn
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
          ]
        });
      }
    } else {
      // Logic cache cũ cho trường hợp không search
      if (page === 0) {
        key = `categorys_all`;
      } else {
        key = `categorys_page_${page}`;
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
          totalCount = await Category.countDocuments();
        }

        cacheData(key, { category, totalCount }, "EX", 3600);

        Category.watch().on("change", async (change) => {
          if (["insert", "delete", "update"].includes(change.operationType)) {
            redisDel(key);
            if (page === 0) {
              const updatedCategory = await getAllCategory(0, 0);
              totalCount = updatedCategory.length;
            } else {
              const updatedCategory = await getAllCategory(page, limit);
              totalCount = await Category.countDocuments();
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
      data: category,
      totalCount,
      totalPages: page === 0 ? 1 : Math.ceil(totalCount / limit),
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    
    // Check cache trước
    const redisGetdata = await getDataFromCache(`category_${id}`);
    if (redisGetdata) {
      console.log(`Cache hit for category: ${id}`);
      return res.status(200).json(redisGetdata);
    }

    const category = await getCategory(id);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại " + id });
    }

    const result = {
      ...category,
      linkImg: resizeImageUrl(category.linkImg, 300, 450),
    };

    // Cache lại data mới
    await cacheData(`category_${id}`, result, "EX", 3600);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const readProductByCategory = async (req: Request, res: Response) => {
  try {
    const data = await Products.find().populate("category", "name");
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const addCt = async (req: MulterRequest, res: Response) => {
  const folderName = "category";
  try {
    const {
      name,
      sumSeri,
      des,
      type,
      week,
      up,
      year,
      time,
      status,
      anotherName,
      hour,
      season,
      upcomingReleases,
      releaseDate,
      newMovie,
      tags,
    } = req.body;
    const file = req.file;
    if (file) {
      cloudinary.uploader.upload(
        file.path,
        {
          folder: folderName,
          public_id: req.file.originalname,
          overwrite: true,
          crop: "fill",
          format: "webp",
        },
        async (error, result: any) => {
          if (error) {
            return res.status(500).json(error);
          }
          const secureUrl = result.url.replace("http://", "https://");
          const newDt = {
            anotherName: anotherName,
            name: name,
            linkImg: secureUrl,
            des: des,
            sumSeri: sumSeri,
            type: type,
            week: week,
            up: up,
            year: year,
            time: time,
            status: status,
            hour: hour,
            slug: slugify(name),
            season: season,
            upcomingReleases: upcomingReleases,
            releaseDate: releaseDate,
            newMovie: newMovie,
            tags: tags,
          };
          const cate = await addCategory(newDt);
          // week now can be an array of week ids
          const weekIds = Array.isArray(cate.week) ? cate.week : (cate.week ? [cate.week] : []);
          if (weekIds.length > 0) {
            await WeekCategory.updateMany(
              { _id: { $in: weekIds } },
              { $addToSet: { category: cate._id } }
            );
          }
          if (tags && tags.length > 0) {
            await Tags.updateMany(
              { _id: { $in: tags } },
              { $addToSet: { categories: cate._id } }
            );
          }

          // Xóa cache categories list khi thêm mới
          await redisDel("categorys_all");
          await redisDel("categorys_page_1");

          return res.status(200).json({
            success: true,
            message: "Added product successfully",
          });
        }
      );
    } else {
      const cate = await addCategory({ ...req.body, slug: slugify(name) });
      const weekIds = Array.isArray(cate.week) ? cate.week : (cate.week ? [cate.week] : []);
      if (weekIds.length > 0) {
        await WeekCategory.updateMany(
          { _id: { $in: weekIds } },
          { $addToSet: { category: cate._id } }
        );
      }

      // Xóa cache categories list khi thêm mới
      await redisDel("categorys_all");
      await redisDel("categorys_page_1");

      return res.status(200).json({
        success: true,
        message: "Added product successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const updateCate = async (req: MulterRequest, res: Response) => {
  try {
    const folderName = "category";
    const {
      name,
      sumSeri,
      des,
      type,
      week,
      up,
      time,
      year,
      status,
      anotherName,
      hour,
      season,
      lang,
      quality,
      slug,
      upcomingReleases,
      releaseDate,
      isMovie,
      thuyetMinh,
      newMovie,
      tags,
    } = req.body;
    const { id } = req.params;
    const file = req.file;
    const findById = await Category.findById(id);
    if (!findById) {
      return res.status(404).json({ message: "Product not found." });
    }

    const syncTags = async () => {
      const prevTagIds = Array.isArray(findById.tags)
        ? findById.tags
        : findById.tags
          ? [findById.tags]
          : [];
      const newTagIds = Array.isArray(tags) ? tags : tags ? [tags] : [];

      // Remove category from old tags that are no longer selected
      const tagsToRemove = prevTagIds.filter(
        (tagId: any) => !newTagIds.some((n: any) => String(n) === String(tagId))
      );
      // Add category to new tags
      const tagsToAdd = newTagIds.filter(
        (tagId: any) => !prevTagIds.some((o: any) => String(o) === String(tagId))
      );

      if (tagsToRemove.length > 0) {
        await Tags.updateMany(
          { _id: { $in: tagsToRemove } },
          { $pull: { categories: findById._id } }
        );
      }
      if (tagsToAdd.length > 0) {
        await Tags.updateMany(
          { _id: { $in: tagsToAdd } },
          { $addToSet: { categories: findById._id } }
        );
      }
    };

    if (file) {
      cloudinary.uploader.upload(
        file.path,
        {
          folder: folderName,
          public_id: req.file.originalname,
          overwrite: true,
          crop: "fill",
          format: "webp",
        },
        async (error, result: any) => {
          if (error) {
            return res.status(500).json(error);
          }
          const secureUrl = result.url.replace("http://", "https://");
          const prevWeekIds = Array.isArray(findById.week)
            ? findById.week
            : findById.week
              ? [findById.week]
              : [];
          findById.name = name;
          findById.des = des;
          findById.week = week;
          findById.sumSeri = sumSeri;
          findById.up = up;
          findById.type = type;
          findById.time = time;
          findById.linkImg = secureUrl;
          findById.year = year;
          findById.status = status;
          findById.hour = hour;
          findById.upcomingReleases = upcomingReleases;
          findById.releaseDate = releaseDate;
          findById.isMovie = isMovie;
          findById.anotherName = anotherName;
          findById.season = season;
          findById.lang = lang;
          findById.quality = quality;
          findById.slug = slug;
          findById.thuyetMinh = thuyetMinh;
          findById.newMovie = newMovie;
          findById.tags = tags;
          // Lưu category trước
          await findById.save();

          // Sync week categories when weeks change (arrays)
          const newWeekIds = Array.isArray(week) ? week : week ? [week] : [];
          const toRemove = prevWeekIds.filter(
            (wId: any) => !newWeekIds.some((n: any) => String(n) === String(wId))
          );
          const toAdd = newWeekIds.filter(
            (wId: any) => !prevWeekIds.some((o: any) => String(o) === String(wId))
          );
          if (toRemove.length > 0) {
            await WeekCategory.updateMany(
              { _id: { $in: toRemove } },
              { $pull: { category: findById._id } }
            );
          }
          await syncTags();


          if (tags && tags.length > 0) {
            await Tags.updateMany(
              { _id: { $in: tags } },
              { $pull: { categories: findById._id } }
            );
          }

          // Xóa cache cũ
          await redisDel(`category_${id}`);
          await redisDel("categorys_all");
          await redisDel("categorys_page_1");

          // Cache lại data mới
          const updatedCategory = await getCategory(id);
          if (updatedCategory) {
            const result = {
              ...updatedCategory,
              linkImg: resizeImageUrl(updatedCategory.linkImg, 300, 450),
            };
            await cacheData(`category_${id}`, result, "EX", 3600);
          }

          return res.status(200).json({
            success: true,
            message: "Dữ liệu sản phẩm đã được cập nhật.",
          });
        }
      );
    } else {
      const prevWeekIds2 = Array.isArray(findById.week)
        ? findById.week
        : findById.week
          ? [findById.week]
          : [];
      findById.name = name;
      findById.des = des;
      findById.week = week;
      findById.sumSeri = sumSeri;
      findById.up = up;
      findById.type = type;
      findById.time = time;
      findById.year = year;
      findById.status = status;
      findById.hour = hour;
      findById.season = season;
      findById.lang = lang;
      findById.quality = quality;
      findById.slug = slug;
      findById.releaseDate = releaseDate;
      findById.isMovie = isMovie;
      findById.anotherName = anotherName;
      findById.upcomingReleases = upcomingReleases;
      findById.thuyetMinh = thuyetMinh;
      findById.newMovie = newMovie;
      findById.tags = tags;
      await findById.save();

      await syncTags();

      // Sync week categories when weeks change (arrays)
      const newWeekIds2 = Array.isArray(week) ? week : week ? [week] : [];
      const toRemove2 = prevWeekIds2.filter(
        (wId: any) => !newWeekIds2.some((n: any) => String(n) === String(wId))
      );
      const toAdd2 = newWeekIds2.filter(
        (wId: any) => !prevWeekIds2.some((o: any) => String(o) === String(wId))
      );
      if (toRemove2.length > 0) {
        await WeekCategory.updateMany(
          { _id: { $in: toRemove2 } },
          { $pull: { category: findById._id } }
        );
      }
      if (toAdd2.length > 0) {
        await WeekCategory.updateMany(
          { _id: { $in: toAdd2 } },
          { $addToSet: { category: findById._id } }
        );
      }

      // Xóa cache cũ
      await redisDel(`category_${id}`);
      await redisDel("categorys_all");
      await redisDel("categorys_page_1");

      // Cache lại data mới
      const updatedCategory = await getCategory(id);
      if (updatedCategory) {
        const result = {
          ...updatedCategory,
          linkImg: resizeImageUrl(updatedCategory.linkImg, 300, 450),
        };
        await cacheData(`category_${id}`, result, "EX", 3600);
      }

      return res.status(200).json({
        success: true,
        message: "Dữ liệu sản phẩm đã được cập nhật.",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.params.userId;

    // Find the category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Move to recycle bin
    await RecycleBin.create({
      category: category._id,
      deletedBy: userId,
    });

    // Soft delete the category
    category.isDeleted = true;
    await category.save();

    // Xóa cache khi xóa category
    await redisDel(`category_${id}`);
    await redisDel("categorys_all");
    await redisDel("categorys_page_1");

    return res.json({
      success: true,
      message: "Category moved to recycle bin"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCategoryNotReq = async (req: Request, res: Response) => {
  try {
    const slug = req.params.id;
    const data = await Category.find({ slug: { $ne: slug } })
      .populate("products", "seri")
      .sort({ up: -1 })
      .limit(8)
      .exec();
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const searchCategory = async (req: Request, res: Response) => {
  try {
    const searchValue: any = req.query.value;

    if (!searchValue) {
      return res.status(200).json([]);
    }

    const regex = new RegExp(searchValue, "i");

    let query: any = {
      name: regex,
    };

    // // Nếu có truyền categories (dạng slug hoặc tên tag)
    // if (categories) {
    //   const categorySlugs = categories.split(',');

    //   // Tìm các tag tương ứng trong collection Tags
    //   const tags = await Tags.find({ slug: { $in: categorySlugs } }).select("_id");

    //   // Lấy danh sách ObjectId
    //   const tagIds = tags.map(tag => tag._id);

    //   // Truy vấn category theo các ObjectId này
    //   query.tags = { $in: tagIds };
    // }

    const data = await Category.find(query)
      .select("name linkImg lang quality slug year time anotherName isActive")
      .sort({ up: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const push = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const body = req.body;
    const data = await Category.findById(categoryId);
    const newData = await weekCategory.findByIdAndUpdate(body.weekId, {
      $addToSet: { category: data },
    });
    res.json(newData);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const filterCategoryTrending = async (req, res) => {
  try {
    const { width = 300, height = 400 } = req.query;
    
    const data = await Category.find().sort({ up: -1 }).limit(10).select("name linkImg slug sumSeri isMovie hour quality time anotherName isActive");

    // Resize images với kích thước từ client
    const resizedData = data.map((category: any) => ({
      ...category.toObject(),
      linkImg: resizeImageUrl(category.linkImg, parseInt(width as string), parseInt(height as string))
    }));

    return res.json({
      data: resizedData,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getCategoryLatesupdate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalItems = await Category.countDocuments()

    const data = await Category.find()
      .sort({ latestProductUploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id name linkImg slug')
    // .populate({
    //   path: 'products',
    //   model: 'Products',
    //   select: 'seri slug',
    //   options: { limit: 8, sort: { seri: -1 } },
    // })

    return res.json({
      success: true,
      data,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    })
  }
}


export const getCategoryLatesupdateFromNextjs = async (req, res) => {
  try {
    let KEY = "LASTESTCATEGORY";

    let getDataFromCaches = await getDataFromCache(KEY);

    if (!getDataFromCaches) {
      // Nếu chưa có cache thì query từ DB
      const data = await Category.aggregate([
        { $sort: { latestProductUploadDate: -1 } },
        { $limit: 16 },
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
      await cacheData(KEY, updatedData);
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

export const changeCategoryLatest = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Category.findOneAndUpdate(
      { _id: id },
      { latestProductUploadDate: new Date() },
      { new: true }
    );
    // await RealtimeService.notifyProductUpdate(null);
    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const ratingCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { rating } = req.body;

    const category: any = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    category.ratingCount += 1;
    category.rating.push(rating);
    category.save();
    return res.json({ message: "Đánh giá đã được lưu thành công" });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const ratingCategoryStats = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let sumRating = 0;
    // Tìm sản phẩm theo productId trong cơ sở dữ liệu
    const category: any = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tính toán số lượng đánh giá và trung bình đánh giá của sản phẩm
    const totalRatings = category.rating.length;
    const ratingsCount = [0, 0, 0, 0, 0]; // Mảng để lưu số lượng đánh giá cho mỗi mức đánh giá
    category.rating.forEach((rate) => {
      if (rate >= 1 && rate <= 5) {
        ratingsCount[rate - 1]++;
      }
      sumRating += rate;
    });
    const percentages = ratingsCount.map(
      (count) => (count / totalRatings) * 100
    );
    const averageRating = sumRating / totalRatings;
    return res.json({
      totalRatings,
      percentages,
      averageRating,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const ratingCategorysStatsAll = async (req, res) => {
  try {
    let totalRatings = 0;
    let totalRatingPoints = 0;
    const data: any = await Category.find();
    data.forEach((data: any) => {
      totalRatings += data.rating.length;
      totalRatingPoints += data.rating.reduce((a, b) => a + b, 0);
    });

    // Tính toán trung bình đánh giá của tất cả sản phẩm
    const averageRating =
      totalRatings > 0 ? totalRatingPoints / totalRatings : 0;

    return res.json({
      totalRatings,
      averageRating,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getUpcomingReleases = async (req, res) => {
  try {
    const data = await Category.find({ upcomingReleases: "comming" })
      .select("name linkImg sumSeri week year slug time releaseDate")
      .populate({
        path: "products",
        model: "Products",
        select: "seri slug",
      });
    return res.status(200).json({
      message: "done",
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


export const getCategorySitemap = async (req: any, res: Response) => {
  try {
    await Category.createIndexes();
    const key = `categorys_sitemap`;

    let category: any;

    const redisData = await getDataFromCache(key);
    if (redisData) {
      category = redisData.category;
    } else {
      category = await getCategoriesSitemap();
      cacheData(key, { category }, "EX", 3600);

      Category.watch().on("change", async (change) => {
        if (["insert", "delete", "update"].includes(change.operationType)) {
          redisDel(key);
        }
      });
    }

    return res.status(200).json({
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const backupCategories = async (req: Request, res: Response) => {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    await mkdirAsync(backupDir, { recursive: true });

    // Get all categories
    const categories = await Category.find({});

    // Create backup data with metadata
    const backupData = {
      timestamp: new Date().toISOString(),
      totalCategories: categories.length,
      data: categories
    };

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `category-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Write backup to file
    await writeFileAsync(filepath, JSON.stringify(backupData, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      backupFile: filename,
      totalCategories: categories.length,
      timestamp: backupData.timestamp
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecycleBin = async (req: Request, res: Response) => {
  try {
    const recycleBinItems = await RecycleBin.find({ isRestored: false })
      .populate({
        path: 'category',
        select: 'name linkImg slug sumSeri isMovie hour quality time anotherName'
      })
      .populate('deletedBy', 'name email')
      .sort({ deletedAt: -1 });

    return res.json({
      success: true,
      data: recycleBinItems
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the recycle bin item
    const recycleBinItem = await RecycleBin.findById(id);
    if (!recycleBinItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in recycle bin"
      });
    }

    // Restore the category
    await Category.findByIdAndUpdate(recycleBinItem.category, {
      isDeleted: false
    });

    // Mark as restored in recycle bin
    recycleBinItem.isRestored = true;
    await recycleBinItem.save();

    return res.json({
      success: true,
      message: "Category restored successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const permanentlyDeleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the recycle bin item
    const recycleBinItem = await RecycleBin.findById(id);
    if (!recycleBinItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in recycle bin"
      });
    }

    // Get the category data before deleting
    const category = await Category.findById(recycleBinItem.category);

    // Delete from recycle bin
    await RecycleBin.findByIdAndDelete(id);

    // Permanently delete the category
    await Category.findByIdAndDelete(recycleBinItem.category);

    // Delete associated image from cloudinary if exists
    if (category?.linkImg) {
      await cloudinary.uploader.destroy(category.linkImg);
    }

    return res.json({
      success: true,
      message: "Category permanently deleted"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const changeIsActiveCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { isActive } = req.body;
    const data = await Category.findOneAndUpdate({ slug }, { isActive });
    if (data) {
      await redisDel(`categorys_all`);
    }
    return res.status(200).json({
      success: true,
      message: "Category isActive changed successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
