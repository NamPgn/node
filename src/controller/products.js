import {
  getAll,
  get,
  addPost,
  deleteProduct,
  editProductSevices,
} from "../services/products";
import Products from "../module/products";
import admin from "firebase-admin";
import Category from "../module/category";
import Categorymain from "../module/categorymain";
import Types from "../module/types";
import mongoose from "mongoose";
import WeekCategory from "../module/week.category";
import { DEFAULT_LIMIT } from "../constans/constan";
import redisClient from "../redis";
const bucketName = process.env.BUCKET_NAME;
const cloudinary = require("cloudinary").v2;
// Thiết lập Cloudinary
cloudinary.config({
  cloud_name: "daz3lejjo",
  api_key: "688737596312288",
  api_secret: "8jT_u3ngBLdt9a0cnaghNp8f7Wg",
});
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const skip = (page - 1) * DEFAULT_LIMIT; // số lượng bỏ qua
    let All = await getAll();
    const redisGetdata = JSON.parse(await redisClient.get("products"));
    let data;
    if (redisGetdata) {
      // Nếu có dữ liệu trong Redis, lấy dữ liệu từ Redis để hiển thị theo từng trang
      await redisClient.set("products", JSON.stringify(All), "EX", 3600); //cappj nhật trong redis server || client
      const i = page
        ? redisGetdata.slice(skip, skip + DEFAULT_LIMIT)
        : redisGetdata;
      data = i;
    } else {
      // Nếu không có dữ liệu trong Redis, lấy toàn bộ dữ liệu từ database và lưu vào Redis
      await redisClient.set(`products`, JSON.stringify(All), "EX", 3600);
      data = All;
    }
    res.status(200).json({
      data: data,
      length: redisGetdata ? redisGetdata.length : All.length,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const _id = req.params.id.toString();
    const dataID = await Products.findById(_id)
      .populate("comments.user", "username image")
      .populate("category");
    // Lấy dữ liệu từ Redis
    const redisGetdata = JSON.parse(await redisClient.get(`${_id}`));
    let data;
    if (redisGetdata) {
      data = dataID;
    } else {
      await redisClient.set(_id, JSON.stringify(dataID), "EX", 3600);
      data = dataID;
    }
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Không ìm thấy phim",
    });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      trailer,
      seri,
      options,
      copyright,
      LinkCopyright,
      descriptions,
      categorymain,
      year,
      country,
      typeId,
      view,
      dailyMotionServer,
      video2,
    } = req.body;
    // const folderName = "image";
    const file = req.file;
    if (file) {
      // const video = req.files["file"][0];
      // const filename = req.files["image"][0];
      //ảnh
      // if (!filename) {
      //   res.status(201).json({ message: "không có hình ảnh" });
      // }

      cloudinary.uploader.upload(
        file.path,
        {
          folder: "products",
          public_id: req.file.originalname,
          overwrite: true,
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json(error);
          }
          const dataAdd = {
            name: name,
            category: category || undefined,
            categorymain: categorymain || undefined,
            seri: seri || undefined,
            options: options,
            descriptions: descriptions,
            link: video2,
            image: result.url,
            uploadDate: new Date(),
            view: view,
            copyright: copyright,
            LinkCopyright: LinkCopyright,
            typeId: typeId || undefined,
            year: year,
            country: country,
            dailyMotionServer: dailyMotionServer,
            trailer: trailer,
          };
          const data = await addPost(dataAdd);
          if (data.category) {
            await Category.findByIdAndUpdate(data.category, {
              $addToSet: { products: data._id },
            });
          }

          if (data.categorymain) {
            await Categorymain.findByIdAndUpdate(data.categorymain, {
              $addToSet: { products: data._id },
            });
          }

          if (data.typeId) {
            await Types.findByIdAndUpdate(data.typeId, {
              $addToSet: { products: data._id },
            });
          }
          return res.status(200).json({
            success: true,
            message: "Added product successfully",
            data: data,
          });
        },
      );
      // if (!video) {
      //   res.status(201).send({ message: "No video uploaded." });
      // }
      // const metadataImage = {
      //   contentType: filename.mimetype,
      // };
      // const fileNameimage = `${folderName}/${Date.now()}-${filename.originalname}`;
      // // Tạo đường dẫn đến file trên Firebase Storage
      // const file = admin.storage().bucket(bucketName).file(fileNameimage);
      // // Tạo stream để ghi dữ liệu video vào Firebase Storage
      // const stream = file.createWriteStream({
      //   metadataImage,
      //   resumable: false,
      // });

      //video
      // const metadatavideo = {
      //   contentType: video.mimetype,
      // };
      // Tạo tên file mới cho video
      // const fileNamevideo = `${Date.now()}-${video.originalname ? video.originalname : ""}`;
      // Tạo đường dẫn đến file trên Firebase Storage
      // const filevideo = admin.storage().bucket(bucketName).file(fileNamevideo);
      // Tạo stream để ghi dữ liệu video vào Firebase Storage
      // const streamvideo = filevideo.createWriteStream({
      //   metadatavideo,
      //   resumable: false,
      // });
      // const encodedFileName = encodeURIComponent(fileNameimage);
      // streamvideo &&
      // stream.on("finish", async () => {
      //   // const urlvideo = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${fileNamevideo}?alt=media`;
      //   // const urlimage = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;

      // });
      // stream.on("error", (err) => {
      //   console.error(err);
      //   res.status(500).send({ message: "Failed to upload video." });
      // });

      // Ghi dữ liệu video vào stream
      // stream.end(filename.buffer);
      // Xử lý sự kiện khi stream ghi dữ liệu bị lỗi
      // streamvideo.on("error", (err) => {
      //   console.error(err);
      //   res.status(500).send({ message: "Failed to upload video." });
      // });

      // Ghi dữ liệu video vào stream
      // streamvideo.end(video.buffer);
    }
    // else {
    //   const dataAdd = {
    //     name: name,
    //     category: category || undefined,
    //     seri: seri || undefined,
    //     options: options,
    //     descriptions: descriptions,
    //     link: video2,
    //     image: imageLink,
    //     uploadDate: new Date(),
    //     view: view,
    //     copyright: copyright,
    //     LinkCopyright: LinkCopyright,
    //     year: year,
    //     country: country,
    //     dailyMotionServer: dailyMotionServer,
    //     video2: video2,
    //     imageLink: imageLink,
    //     trailer: trailer
    //   };
    //   const data = await addPost(dataAdd);
    //   return res.status(200).json(data);
    // }
    // Xử lý sự kiện khi stream ghi dữ liệu thành công
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading video",
      error: error.message,
    });
  }
};

export const delete_ = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedProduct = await Products.findById(id);
    if (!deletedProduct) {
      // Sản phẩm không tồn tại
      return res.status(404).json({ message: "Product not found." });
    }

    // Xóa tệp video từ Firebase Storage
    // const videoFileName = deletedProduct.link
    //   .split("/")
    //   .pop()
    //   .split("?alt=media")[0]; // Lấy tên tệp video từ URL
    // const videoFile = admin.storage().bucket(bucketName).file(videoFileName);
    // if (videoFile) {
    //   await videoFile.delete();
    // }

    // // Xóa tệp hình ảnh từ Firebase Storage
    // const imageFileName = deletedProduct.image
    //   .split(`/`)
    //   .pop()
    //   .split("?alt=media")[0]; // Lấy tên tệp hình ảnh từ URL
    // const decodedImage = decodeURIComponent(imageFileName).split("/")[1]; //
    // const imageFile = admin
    //   .storage()
    //   .bucket(bucketName)
    //   .file(`${folderName}/${decodedImage}`); //còn thằng này không có folder mà là lấy chay nên phải lấy ra thằng cuối cùng .
    // if (decodedImage) {
    //   await imageFile.delete();
    // }

    if (deletedProduct.typeId) {
      await Types.findByIdAndUpdate(deletedProduct.typeId, {
        //tìm thằng type
        $pull: { products: { $in: [id] } },
      });
    }

    if (deletedProduct.categorymain) {
      await Categorymain.findByIdAndUpdate(deletedProduct.categorymain, {
        //tìm thằng categorymain
        $pull: { products: { $in: [id] } },
      });
    }

    if (deletedProduct.category) {
      await Categorymain.findByIdAndUpdate(deletedProduct.category, {
        //tìm thằng category
        $pull: { products: { $in: [id] } }, // tìm tất ca thằng product trong list category có id trùng vs thằng id product
      });
    }

    cloudinary.uploader.destroy(deletedProduct.image);
    const data = await deleteProduct(id);

    return res.json({
      message: "Product deleted successfully.",
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const editProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const folderName = "products";
    const file = req.file
    const {
      name,
      category,
      categorymain,
      year,
      country,
      typeId,
      seri,
      options,
      copyright,
      LinkCopyright,
      descriptions,
      trailer,
      dailyMotionServer,
      link,
      view
    } = req.body;
    // const data = await editProductSevices(_id, dataEdit);
    const findById = await Products.findById(id);
    // Kiểm tra sản phẩm có tồn tại trong CSDL hay không
    if (!findById) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (file) {
      cloudinary.uploader.upload(file.path, {
        folder: folderName,
        public_id: req.file.originalname,
        overwrite: true,
      }, async (error, result) => {
        if (error) {
          return res.status(500).json(error);
        }
        findById.name = name;
        findById.seri = seri;
        findById.view = view;
        findById.descriptions = descriptions;
        findById.image = result.url;
        findById.link = link;
        findById.seri = seri;
        findById.options = options;
        findById.copyright = copyright;
        findById.LinkCopyright = LinkCopyright;
        findById.trailer = trailer;
        findById.country = country;
        findById.year = year;
        findById.dailyMotionServer = dailyMotionServer;
        findById.categorymain = categorymain;
        findById.category = category;
        findById.typeId = typeId;
        findById.trailer = trailer;
        const data = await findById.save();
        return res.status(200).json({
          success: true,
          message: "Dữ liệu sản phẩm đã được cập nhật.",
          data: data,
        });
      })
    } else {
      if (findById.category) {
        await Category.findByIdAndUpdate(findById.category, {
          $pull: { products: findById._id },
        });

        await Category.findByIdAndUpdate(findById.category, {
          $push: { products: findById._id },
        });
      }

      if (findById.categorymain) {
        await Categorymain.findByIdAndUpdate(findById.categorymain, {
          $pull: { products: findById._id },
        });

        await Categorymain.findByIdAndUpdate(findById.categorymain, {
          $push: { products: findById._id },
        });
      }

      if (findById.typeId) {
        await Types.findByIdAndUpdate(findById.typeId, {
          $pull: { products: findById._id },
        });

        await Types.findByIdAndUpdate(findById.typeId, {
          $push: { products: findById._id },
        });
      }
      findById.name = name;
      findById.seri = seri;
      findById.descriptions = descriptions;
      findById.view = view;
      findById.options = options;
      findById.copyright = copyright;
      findById.LinkCopyright = LinkCopyright;
      findById.trailer = trailer;
      findById.country = country;
      findById.year = year;
      findById.dailyMotionServer = dailyMotionServer;
      findById.categorymain = categorymain;
      findById.category = category;
      findById.typeId = typeId;
      findById.trailer = trailer;
      findById.link = link;
      const data = await findById.save();
      return res.status(200).json({
        success: true,
        message: "Dữ liệu sản phẩm đã được cập nhật.",
        data: data,
      });
    }
    // if (req.files || req.files.file || req.files.image) {
    //   // const newVideoFile = req.files["file"] && req.files["file"][0];
    //   // const newImageFile = req.files["image"] && req.files["image"][0];
    //   // const metadataImage = {
    //   //   contentType: newImageFile.mimetype,
    //   // };
    //   // const metadataVideo = {
    //   //   contentType: newVideoFile.mimetype,
    //   // };

    //   // const fileNameImage = `${folderName}/${Date.now()}-${newImageFile.originalname
    //   //   }`;
    //   // const fileNameVideo = `${Date.now()}-${newVideoFile.originalname}`;

    //   // const fileImage = admin.storage().bucket(bucketName).file(fileNameImage);
    //   // const fileVideo = admin.storage().bucket(bucketName).file(fileNameVideo);

    //   // const streamImage = fileImage.createWriteStream({
    //   //   metadata: metadataImage,
    //   //   resumable: false,
    //   // });

    //   // const streamVideo = fileVideo.createWriteStream({
    //   //   metadata: metadataVideo,
    //   //   resumable: false,
    //   // });

    //   //encode url
    //   // const encodedFileName = encodeURIComponent(fileNameImage);
    //   streamImage ||
    //     streamVideo.on("finish", async () => {
    //       // const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;
    //       // const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${fileNameVideo}?alt=media`;

    //       //cập nhật
    //       findById.seri = seri;
    //       findById.options = options;
    //       findById.copyright = copyright;
    //       findById.LinkCopyright = LinkCopyright;
    //       findById.trailer = trailer;
    //       findById.country = country;
    //       findById.year = year;
    //       findById.image = image;
    //       findById.link = link;
    //       findById.dailyMotionServer = dailyMotionServer;
    //       findById.typeId = typeId || undefined;
    //       findById.category = category || undefined;
    //       findById.categorymain = categorymain || undefined;
    //       // lưu vào database
    //       const data = await findById.save();

    //       return res.status(200).json({
    //         success: true,
    //         message: "Dữ liệu sản phẩm đã được cập nhật.",
    //         data: data,
    //       });
    //     });
    // } else {
    //   // Không có tệp hình ảnh mới, chỉ cập nhật các thông tin khác của sản phẩm
    //   findById.options = options;
    //   findById.copyright = copyright;
    //   findById.LinkCopyright = LinkCopyright;
    //   findById.trailer = trailer;
    //   findById.country = country;
    //   findById.year = year;
    //   findById.dailyMotionServer = dailyMotionServer;
    //   findById.seri = seri;
    //   findById.categorymain = categorymain;
    //   findById.typeId = typeId;
    //   findById.category = category;
    //   findById.link = link;
    //   findById.image = imageLink;
    //   findById.video2 = link;
    //   findById.imageLink = imageLink;
    //   await findById.save();
    //   return res.status(200).json({
    //     success: true,
    //     message: "Dữ liệu sản phẩm đã được cập nhật.",
    //     data: findById,
    //   });
    // }
    // add
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteMultipleProduct = async (req, res) => {
  try {
    const id = req.body;
    const data = await Products.remove({
      _id: {
        $in: id,
      },
    });
    return res.status(200).json({
      success: true,
      data: data,
      id: id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

////12324tw7rt87wery8q7weyr78qwer

export const getAllProductsByCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryId = mongoose.Types.ObjectId(id);
    // const data = await Products.aggregate([
    //   {
    //     $lookup: {
    //       from: "categories",
    //       localField: "category",
    //       foreignField: "_id",
    //       as: "category"
    //     }
    //   },
    //   {
    //     $match: {
    //       "category._id": mongoose.Types.ObjectId(categoryId)
    //     }
    //   }
    // ]);
    const data = await Products.find({ category: categoryId });
    data.sort((a, b) => parseInt(b.seri) - parseInt(a.seri));
    res.status(200).json(data);
    //Trong đó:
    // $lookup là phương thức kết hợp (join) dữ liệu từ hai bảng Products và categories.
    // from là tên bảng categories.
    // localField là trường category trong bảng Products.
    // foreignField là trường _id trong bảng categories.
    // as là tên mới cho trường category sau khi thực hiện join.
    // $match là phương thức lọc dữ liệu, chỉ lấy các sản phẩm có trường category._id bằng với categoryId.
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const findCommentByIdProduct = async (req, res) => {
  try {
    const _id = { _id: req.params.id };
    const data = await Products.findById(_id).populate(
      "comments.user",
      "username image",
    );
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const pushtoTypes = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const data = await Products.findById(id);
    const newData = await Types.findByIdAndUpdate(body.typeId, {
      $addToSet: { products: data },
    });
    res.json(newData);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const pushToWeek = async (req, res) => {
  try {
    const productId = req.params.id;
    const body = req.body;
    const data = await Products.findById(productId);
    const newData = await WeekCategory.findByIdAndUpdate(body.weekId, {
      $addToSet: { products: data },
    });
    res.json(newData);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
