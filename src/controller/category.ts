import {
  addCategory,
  getAllCategory,
  getCategory,
  deleteCategory,
} from "../services/category";
import Products from "../module/products";
import Category from "../module/category";
import WeekCategory from "../module/week.category";
import weekCategory from "../module/week.category";
import { cacheData, getDataFromCache, redisDel } from "../redis";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
interface MulterRequest extends Request {
  file: any;
}
export const getAll = async (req: any, res: Response) => {
  try {
    const default_limit = 24;
    const page = parseInt(req.query.page) || 1; // Mặc định trang là 1

    await Category.createIndexes();

    const key = `categorys_page_${page}`; // Thêm thông tin trang vào key
    const redisData = await getDataFromCache(key);

    let category: any;

    if (redisData) {
      // Nếu có dữ liệu cache, sử dụng dữ liệu đó
      category = redisData;
    } else {
      // Nếu không có dữ liệu cache, lấy dữ liệu từ cơ sở dữ liệu
      category = await getAllCategory(page, default_limit);
      
      // Cache dữ liệu của trang hiện tại
      cacheData(key, category, "EX", 3600);
      
      // Theo dõi sự thay đổi trong bộ sưu tập
      Category.watch().on("change", async (change) => {
        if (["insert", "delete", "update"].includes(change.operationType)) {
          redisDel(key); // Xóa cache khi có thay đổi
          const updatedCategory = await getAllCategory(page, default_limit);
          cacheData(key, updatedCategory, "EX", 3600); // Cache lại dữ liệu
        }
      });
    }
    
    return res.status(200).json({
      data: category,
      length: category.length,
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
    let sumRating = 0;
    const category = await getCategory(id);
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
    const data = {
    ...category.toObject(),
      averageRating:averageRating,
      percentages:percentages,
      totalRatings:totalRatings,
    };
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
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
      isActive,
      anotherName,
      hour
    } = req.body;
    const file = req.file;
    if (file) {
      cloudinary.uploader.upload(
        file.path,
        {
          folder: folderName,
          public_id: req.file.originalname,
          overwrite: true,
        },
        async (error, result: any) => {
          if (error) {
            return res.status(500).json(error);
          }
          const newDt = {
            anotherName: anotherName,
            name: name,
            linkImg: result.url,
            des: des,
            sumSeri: sumSeri,
            type: type,
            week: week,
            up: up,
            year: year,
            time: time,
            isActive: isActive,
            hour: hour,
          };
          const cate = await addCategory(newDt);
          await WeekCategory.findByIdAndUpdate(cate.week, {
            $addToSet: { category: cate._id },
          });
          return res.status(200).json({
            success: true,
            message: "Added product successfully",
            data: cate,
          });
        }
      );
    } else {
      const cate = await addCategory(req.body);
      return res.status(200).json({
        success: true,
        message: "Added product successfully",
        data: cate,
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
      isActive,
      anotherName,
      hour,
    } = req.body;
    const { id } = req.params;
    const file = req.file;
    const findById = await Category.findById(id);

    if (!findById) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (file) {
      cloudinary.uploader.upload(
        file.path,
        {
          folder: folderName,
          public_id: req.file.originalname,
          overwrite: true,
        },
        async (error, result: any) => {
          if (error) {
            return res.status(500).json(error);
          }
          findById.name = name;
          findById.des = des;
          findById.week = week;
          findById.sumSeri = sumSeri;
          findById.up = up;
          findById.type = type;
          findById.time = time;
          findById.linkImg = result.url;
          findById.year = year;
          findById.isActive = isActive;
          findById.hour = hour;
          (findById.anotherName = anotherName), findById.save();
          await WeekCategory.findByIdAndUpdate(findById.week, {
            $set: { category: findById._id },
          });
          return res.status(200).json({
            success: true,
            message: "Edited product successfully",
          });
        }
      );
    } else {
      findById.name = name;
      findById.des = des;
      findById.week = week;
      findById.sumSeri = sumSeri;
      findById.up = up;
      findById.type = type;
      findById.time = time;
      findById.year = year;
      findById.isActive = isActive;
      findById.hour = hour;
      (findById.anotherName = anotherName),
        await WeekCategory.findByIdAndUpdate(findById.week, {
          $addToSet: { category: findById._id },
        });
      await findById.save();
      return res.status(200).json({
        success: true,
        message: "Dữ liệu sản phẩm đã được cập nhật.",
        data: findById,
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
    const data = await deleteCategory(id);
    await WeekCategory.findByIdAndUpdate(data.week, {
      $pull: { category: data._id },
    });
    cloudinary.uploader.destroy(data.linkImg);
    return res.json({
      data: data,
      success: true,
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
    const id = req.params.id;
    const data = await Category.find({ _id: { $ne: id } })
      .populate("products", "seri")
      .sort({ up: -1 })
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
    var searchValue: any = req.query.value;
    if (searchValue == "") {
      return res.status(200).json([]);
    }
    var regex = new RegExp(searchValue, "i");
    const data = await Category.find({
      $or: [{ name: regex }],
    });
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
    const data = await Category.find().sort({ up: -1 }).limit(10);
    return res.json({
      data: data,
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
    const data = await Category.find()
      .sort({ latestProductUploadDate: -1 })
      .limit(8)
      .populate("products");
    return res.json({
      data: data,
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
    return res.json({
      data: data,
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
