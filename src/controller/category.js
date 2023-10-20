import {
  addCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../services/category";
import Products from "../module/products";
import Category from "../module/category";
import WeekCategory from "../module/week.category";
import weekCategory from "../module/week.category";
import admin from "firebase-admin";
import redisClient from "../redis";
const bucketName = process.env.BUCKET_NAME;
export const getAll = async (req, res) => {
  try {
    const default_limit = 20;
    const data = await getAllCategory();
    const page = parseInt(req.query.page) || 0;
    await Category.createIndexes();
    const resdisData = JSON.parse(await redisClient.get("categorys"));
    const skip = (page - 1) * default_limit; //số lượng bỏ qua
    let category;
    if (resdisData) {
      await redisClient.set("categorys", JSON.stringify(data), "EX", 3600);
      const i = page
        ? resdisData.slice(skip, skip + default_limit)
        : resdisData;
      category = i;
    } else {
      await redisClient.set("categorys", JSON.stringify(data), "EX", 3600);
      category = data;
    }
    res.status(200).json({
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

export const getOne = async (req, res) => {
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

export const readProductByCategory = async (req, res) => {
  try {
    const data = await Products.find().populate("category", "name");

    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const folderName = "category";
export const addCt = async (req, res) => {
  try {
    const {
      name,
      linkImg,
      sumSeri,
      des,
      type,
      week,
      up,
      year,
      time,
      isActive,
    } = req.body;
    const file = req.file;
    const metadatavideo = {
      contentType: file.mimetype,
    };

    const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
    const files = admin.storage().bucket(bucketName).file(fileName);
    const streamvideo = files.createWriteStream({
      metadatavideo,
      resumable: false,
    });

    const encodedFileName = encodeURIComponent(fileName);
    streamvideo.on("finish", async () => {
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;
      const newDt = {
        name: name,
        linkImg: url,
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
      return res.json(cate);
    });
    // Ghi dữ liệu video vào stream
    streamvideo.end(file.buffer);
    // Xử lý sự kiện khi stream ghi dữ liệu bị lỗi
    streamvideo.on("error", (err) => {
      console.error(err);
      res.status(500).send({ message: "Failed to upload video." });
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const updateCate = async (req, res) => {
  try {
    const { name, sumSeri, des, type, week, up, time, year, isActive } =
      req.body;
    const { id } = req.params;
    const newfile = req.file;
    const findById = await Category.findById(id);

    // Xóa tệp hình ảnh cũ từ Firebase Storage
    // const oldImageFileName = findById.linkImg.split(`/`).pop().split('?alt=media')[0]; //lấy sau thằng image vì nó qua folder name là image
    // const decodedImage = decodeURIComponent(oldImageFileName).split('/')[1]; //
    // const oldImageFile = admin.storage().bucket(bucketName).file(`${folderName}/${decodedImage}`); //còn thằng này không có folder mà là lấy chay nên phải lấy ra thằng cuối cùng .
    // if (decodedImage) {
    //   await oldImageFile.delete();
    // }
    if (!findById) {
      return res.status(404).json({ message: "Product not found." });
    }
    findById.name = name;
    findById.des = des;
    findById.week = week;
    findById.sumSeri = sumSeri;
    findById.up = up;
    findById.type = type;
    findById.time = time;
    findById.year = year;
    findById.isActive = isActive;
    if (newfile) {
      const metadataImage = {
        contentType: newfile.mimetype,
      };
      const fileNameImage = `${folderName}/${Date.now()}-${
        newfile.originalname
      }`;
      const fileImage = admin.storage().bucket(bucketName).file(fileNameImage);

      const streamImage = fileImage.createWriteStream({
        metadata: metadataImage,
        resumable: false,
      });
      const oldImageFileName = findById.linkImg
        .split(`/`)
        .pop()
        .split("?alt=media")[0]; //lấy sau thằng image vì nó qua folder name là image
      const decodedImage = decodeURIComponent(oldImageFileName).split("/")[1]; //
      const oldImageFile = admin
        .storage()
        .bucket(bucketName)
        .file(`${folderName}/${decodedImage}`); //còn thằng này không có folder mà là lấy chay nên phải lấy ra thằng cuối cùng .
      if (decodedImage) {
        await oldImageFile.delete();
      }
      streamImage.on("error", (err) => {
        console.error(err);
        res.status(500).send({ message: "Failed to upload video." });
      });

      // Ghi dữ liệu video vào stream
      streamImage.end(newfile.buffer);
      // Xử lý sự kiện khi stream ghi dữ liệu bị lỗi
      streamImage.on("error", (err) => {
        console.error(err);
        res.status(500).send({ message: "Failed to upload video." });
      });
      //encode url
      const encodedFileName = encodeURIComponent(fileNameImage);
      streamImage.on("finish", async () => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;
        findById.name = name;
        findById.linkImg = imageUrl;
        findById.des = des;
        findById.week = week;
        findById.sumSeri = sumSeri;
        findById.up = up;
        findById.type = type;
        findById.time = time;
        findById.year = year;
        findById.isActive = isActive;
        // Cập nhật thông tin category tương ứng trong bảng week

        // await WeekCategory.findOneAndUpdate(
        //   { _id: findById.week },
        //   { $set: { "category.$[elem]": dataEdit } },
        //   { arrayFilters: [{ "elem._id": dataEdit._id }] }
        // );
        const data = await findById.save();

        return res.status(200).json({
          success: true,
          message: "Dữ liệu sản phẩm đã được cập nhật.",
          data: data,
        });
      });
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

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteCategory(id);
    await WeekCategory.findByIdAndUpdate(data.week, {
      $pull: { category: data._id },
    });
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
export const getAllCategoryNotReq = async (req, res) => {
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

export const searchCategory = async (req, res) => {
  try {
    var searchValue = req.query.value;
    var regex = new RegExp(searchValue, "i");
    const data = await Category.find({
      $or: [{ name: regex }],
    });
    res.json(data);
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
