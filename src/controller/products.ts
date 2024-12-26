import { getAll, addProduct_, deleteProduct } from "../services/products";
import Products from "../module/products";
import Category from "../module/category";
import Categorymain from "../module/categorymain";
import Types from "../module/types";
import mongoose from "mongoose";
import WeekCategory from "../module/week.category";
import redisClient, { cacheData, getDataFromCache, redisDel } from "../redis";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import XLSX from "xlsx";
import CryptoJS from "crypto-js";
import { slugify } from "../utills/slugify";
import weekCategory from "../module/week.category";
import Call from "../module/Call";
import { Queue, Worker } from "bullmq";
const productsQueue = new Queue("productQueue", {
  connection: redisClient,
  streams: {
    events: {
      maxLen: 1000
    }
  }
});
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const limit = 40;
    const page = parseInt(req.query.page as string) || 1; // Mặc định trang là 1
    let key: string;
    const redisData: any = await getDataFromCache(key);

    if (page === 0) {
      key = `products_all`;
    } else {
      key = `products_page_${page}`;
    }

    let products: any;
    let totalCount: number;
    if (redisData) {
      ({ products, totalCount } = redisData);
    } else {
      if (page === 0) {
        products = await getAll(0, 0); // Lấy toàn bộ sản phẩm
        totalCount = products.length;
      } else {
        products = await getAll(page, limit); // Lấy sản phẩm theo trang
        totalCount = await Products.countDocuments();
      }

      cacheData(key, { products, totalCount }, "EX", 3600);

      Products.watch().on("change", async (change) => {
        if (["insert", "delete", "update"].includes(change.operationType)) {
          redisDel(key);
          let updatedProducts;
          if (page === 0) {
            updatedProducts = await getAll(0, 0);
            totalCount = updatedProducts.length;
          } else {
            updatedProducts = await getAll(page, limit);
            totalCount = await Products.countDocuments();
          }
          cacheData(key, { products: updatedProducts, totalCount }, "EX", 3600);
        }
      });
    }

    return res.status(200).json({
      data: products,
      totalCount,
      totalPages: page === 0 ? 1 : Math.ceil(totalCount / limit),
      pageSizeOptions: [],
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
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
    // Kiểm tra quyền hạn của người dùng
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
            // _id: mongoose.Types.ObjectId(),
            name: name,
            slug: `${slugify(name)}-episode-${seri}`,
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
            dailyMotionServer:
              dailyMotionServer !== ""
                ? CryptoJS.AES.encrypt(
                    dailyMotionServer,
                    process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
                  ).toString()
                : "",
            trailer: trailer,
          };
          // const data = await Approve.create({ products: dataAdd });
          const data: any = await Products.create(dataAdd);
          if (data.category) {
            await Category.findOneAndUpdate(
              { _id: data.category },
              { latestProductUploadDate: new Date() },
              { new: true }
            );
            await Category.findOneAndUpdate(
              { _id: data.category }, // Điều kiện tìm kiếm
              {
                $addToSet: { products: data.products }, // Sử dụng $addToSet để thêm data.products vào mảng products
              }
            );
          }

          if (data.categorymain) {
            await Categorymain.findByIdAndUpdate(data.categorymain, {
              $addToSet: { products: data.products },
            });
          }

          if (data.typeId) {
            await Types.findByIdAndUpdate(data.typeId, {
              $addToSet: { products: data.products },
            });
          }
          return res.status(200).json({
            success: true,
            message: "Added product successfully",
            data: data,
          });
        }
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
    } else {
      const dataAdd = {
        name: name,
        slug: `${slugify(name)}-episode-${seri}`,
        category: category || undefined,
        seri: seri || undefined,
        options: options,
        descriptions: descriptions,
        link: video2,
        uploadDate: new Date(),
        view: view,
        copyright: copyright,
        LinkCopyright: LinkCopyright,
        year: year,
        country: country,
        dailyMotionServer:
          dailyMotionServer !== ""
            ? CryptoJS.AES.encrypt(
                dailyMotionServer,
                process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
              ).toString()
            : "",
        video2: video2,
        trailer: trailer,
      };
      const data: any = await addProduct_(dataAdd);
      if (data.category) {
        await Category.findOneAndUpdate(
          { _id: data.category },
          { latestProductUploadDate: data.uploadDate },
          { new: true }
        );
        await Category.findByIdAndUpdate(data.category, {
          $addToSet: { products: data.products },
        });
      }

      if (data.categorymain) {
        await Categorymain.findByIdAndUpdate(data.categorymain, {
          $addToSet: { products: data.products },
        });
      }

      if (data.typeId) {
        await Types.findByIdAndUpdate(data.typeId, {
          $addToSet: { products: data.products },
        });
      }
      return res.status(200).json({
        success: true,
        message: "Added product successfully",
        data: data,
      });
    }
    // Xử lý sự kiện khi stream ghi dữ liệu thành công
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading video",
      error: error.message,
    });
  }
};

export const delProduct = async (req, res, next) => {
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
    const file = req.file;
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
      view,
      slug,
      server2,
    } = req.body;
    // const data = await editProductSevices(_id, dataEdit);
    const findById = await Products.findById(id);
    const decode = CryptoJS.AES.decrypt(
      findById.dailyMotionServer,
      process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
    ).toString(CryptoJS.enc.Utf8);
    // Kiểm tra sản phẩm có tồn tại trong CSDL hay không
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
        async (error, result) => {
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
          findById.categorymain = categorymain;
          findById.category = category;
          findById.typeId = typeId;
          findById.trailer = trailer;
          findById.slug = slug;
          if (dailyMotionServer === "") {
            findById.dailyMotionServer = dailyMotionServer; // Gán giá trị trực tiếp
          } else {
            findById.dailyMotionServer = CryptoJS.AES.encrypt(
              dailyMotionServer,
              process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
            ).toString();
          }
          const data = await findById.save();
          redisDel(findById.slug);
          await productsQueue.remove(findById.slug);
          return res.status(200).json({
            success: true,
            message: "Dữ liệu sản phẩm đã được cập nhật.",
            data: data,
          });
        }
      );
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
      findById.categorymain = categorymain;
      findById.category = category;
      findById.typeId = typeId;
      findById.trailer = trailer;
      findById.link = link;
      findById.slug = slug;
      findById.server2 = server2;

      if (dailyMotionServer === "") {
        findById.dailyMotionServer = dailyMotionServer; // Gán giá trị trực tiếp
      } else {
        findById.dailyMotionServer = CryptoJS.AES.encrypt(
          dailyMotionServer,
          process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
        ).toString();
      }
      // await Category.findOneAndUpdate(
      //   { _id: findById.category },
      //   { latestProductUploadDate: new Date() },
      //   { new: true }
      // );
      await productsQueue.remove(findById.slug);
      redisDel(findById.slug);

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
    console.log(error);
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
    const categoryId = new mongoose.Types.ObjectId(id);
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
    return res.status(200).json(data);
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
      "username image"
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

export const sendingApprove = async (req, res) => {
  try {
    const role = req.profile.role;
    const id = req.params.id;
    if (role !== 2) {
      return res.json({ message: "Bạn k có quyền" });
    }
    const data = await Products.updateOne(
      { _id: id },
      {
        $set: {
          isApproved: true,
        },
      }
    );
    return res.json({
      message: "Done",
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const cancelSendingApprove = async (req, res) => {
  try {
    const role = req.profile.role;
    const id = req.params.id;
    if (role !== 2) {
      return res.json({ message: "Bạn k có quyền" });
    }
    const data = await Products.updateOne(
      { _id: id },
      {
        $set: {
          isApproved: false,
        },
      }
    );
    return res.json({
      message: "Done",
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const filterCategoryByProducts = async (req: Request, res: Response) => {
  try {
    const { c } = req.query;
    const redisGetdata: any = await getDataFromCache("products");
    if (c == "") {
      return res.status(200).json(redisGetdata);
    }
    const data = await Products.find({ category: c });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const productWorker: any = new Worker(
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

    await cacheData(id, dataID, "EX", 3600, "NX");

    return dataID;
  },
  {
    connection: redisClient,
    concurrency: 2,
    removeOnComplete: { age: 3600, count: 200 },
    removeOnFail: { age: 86400 },
  }
);

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id.toString();
    await Call.find();
    const redisGetdata = await getDataFromCache(id);
    if (redisGetdata) {
      return res.status(200).json(redisGetdata);
    }
    const job = await productsQueue.add(
      "getProduct",
      { id },
      {
        jobId: id,
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
          age: 24 * 3600, // keep up to 24 hours
        },
      }
    );
    console.log("Đợi:", job.id);
    const result = await new Promise((resolve, reject) => {
      productWorker.on("completed", (job, result) => {
        resolve(result);
      });

      productWorker.on("failed", (job, err) => {
        reject(new Error(err.message));
      });
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { name }: any = req.query;
    var regex = new RegExp(name, "i");
    const redisGetdata: any = await getDataFromCache("products");
    if (name == "") {
      return res.status(200).json(redisGetdata);
    }
    const data = await Products.find({
      $or: [{ name: regex }],
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const uploadXlxsProducts = async (req, res, next) => {
  try {
    const { selectedSheets } = req.body;
    let path = req.file.path;
    var workBok = XLSX.readFile(path);
    var sheet_name_list = workBok.SheetNames; //lấy ra cái tên
    let jsonData: any = XLSX.utils.sheet_to_json(
      //về dạng json
      workBok.Sheets[sheet_name_list[Number(selectedSheets)]] //lấy cái bảng đầu tiên
    );
    if (jsonData.length == 0) {
      //kiểm tra neus không có gì thì cút
      return res.json({
        message: "Not data",
      });
    }

    jsonData.map(async (item) => {
      if (typeof item.category === "string") {
        return [
          ...jsonData,
          (item.category = mongoose.Types.ObjectId.createFromHexString(
            item.category
          )),
          (item.slug = `${slugify(item.name)}-episode-${item.seri}`),
        ];
      }
    });
    const data = await Products.insertMany(jsonData);
    for (const movies of data) {
      const categoryById = await Category.findById(movies.category);
      if (categoryById) {
        await Category.findOneAndUpdate(
          { _id: categoryById._id },
          { latestProductUploadDate: new Date() },
          { new: true }
        );
        await Category.findByIdAndUpdate(categoryById._id, {
          $addToSet: { products: movies._id },
        });
      }
    }
    return res.json({
      message: "Add Movies Success",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const clearCacheProducts = async (req, res) => {
  try {
    const key = "products";
    redisDel(key);
    return res.json({
      suscess: true,
      message: "Clear Success",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const mostWatchesEposides = async (req, res) => {
  try {
    const data = await Products.find().sort({ view: -1 }).limit(10);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const editMultipleMovies = async (req, res) => {
  try {
    const arrId = req.body;
    for (const id of arrId) {
      const product = await Products.findById(id).select("dailyMotionServer");
      if (product) {
        const encode = CryptoJS.AES.encrypt(
          product.dailyMotionServer,
          process.env.SECERT_CRYPTO_KEY_PRODUCTS_DAILYMOTION_SERVER
        ).toString();
        await Products.findByIdAndUpdate(id, { dailyMotionServer: encode });
      }
    }
    return res.status(200).json({
      success: true,
      message: "Dữ liệu sản phẩm đã được cập nhật.",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const approveMultipleMovies = async (req, res) => {
  try {
    const id = req.body;
    const data = await Products.updateMany(
      { _id: { $in: id } },
      { $set: { isApproved: true } }
    );
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

export const autoAddProduct = async (req, res) => {
  try {
    const weeks = await weekCategory.find().select("name").sort({ name: 1 });
    const daysOfWeek = await Promise.all(weeks.map((items) => items.name));
    const now = new Date();

    const dayIndex = now.getDay();

    const day = daysOfWeek[dayIndex];

    const weekData: any = await weekCategory.findOne({ name: day }).populate({
      path: "category",
      select: "name slug",
      populate: {
        path: "products",
        model: "Products",
        select: "seri isApproved slug",
      },
    });
    const newData = await Promise.all(
      weekData.category?.map(async (item) => {
        let episode = 1;
        if (item.products && item.products.length > 0) {
          const lastProduct = item.products[item.products.length - 1];
          episode = parseInt(lastProduct.seri) + 1;
        }
        return {
          name: item.name,
          slug: item.slug + `-episode-${episode}`,
          isApproved: true,
          category: item._id,
          copyright: "hh3d",
          seri: episode.toString(),
          dailyMotionServer: "",
        };
      })
    );
    const newMovie = await Products.insertMany(newData);
    await Promise.all(
      newMovie.map(async (movie) => {
        await Category.findOneAndUpdate(
          { _id: movie._id },
          {
            $addToSet: { products: movie._id },
          }
        );
        await Category.findOneAndUpdate(
          { _id: movie.category },
          { latestProductUploadDate: new Date() },
          { new: true }
        );
      })
    );
    return res.status(200).json({
      success: true,
      data: newMovie,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const exportDataToExcel = async (req, res) => {
  try {
    // Fetch data from your DB (you can adjust this according to your needs)
    const data = await Products.find().lean();
    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data empty",
      });
    }

    // Define headers dynamically from the keys of the first object in the data
    const headers = Object.keys(data[0]);

    // Convert the data to a worksheet (with headers)
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Generate the Excel file as an array
    const fileBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array", // Ensure the file is an array (not buffer)
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

    // Send the Excel file as response
    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
