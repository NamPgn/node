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
import { cacheData, getDataFromCache } from "../redis";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
interface MulterRequest extends Request {
  file: any;
}
export const getAll = async (req: any, res: Response) => {
  try {
    const default_limit = 20;
    const data = await getAllCategory();
    const page = parseInt(req.query.page) || 0;
    await Category.createIndexes();
    const resdisData = await getDataFromCache('categorys');;
    const skip = (page - 1) * default_limit; //số lượng bỏ qua
    let category:any;
    if (resdisData) {
      // await redisClient.set("categorys", JSON.stringify(data), "EX", 3600);
      const i = page
        ? resdisData.slice(skip, skip + default_limit)
        : resdisData;
      category = i;
    } else {
      cacheData('categorys',data, "EX", 3600);
      // await redisClient.set("categorys", JSON.stringify(data), "EX", 3600);
      category = data;
    }
    return res.status(200).json({
      data: category,
      length: data.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await getCategory(id);
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
    const { name, sumSeri, des, type, week, up, year, time, isActive } = req.body;
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
    const { name, sumSeri, des, type, week, up, time, year, isActive } =
      req.body;
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
          findById.linkImg = result.url
          findById.year = year;
          findById.isActive = isActive;
          findById.save();
          await WeekCategory.findByIdAndUpdate(findById.week, {
            $pull: { category: findById._id },
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
      await WeekCategory.findByIdAndUpdate(findById.week, {
        $pull: { category: findById._id },
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
    const data = await Category.find({ _id: { $ne: id } });
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
    var regex = new RegExp(searchValue, "i");
    const data = await Category.find({
      $or: [{ name: regex }],
    });
    return res.json(data);
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
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
};
