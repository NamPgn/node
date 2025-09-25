import { getAll, addProduct_, deleteProduct, getProductCount, getOneEpisode, addVoiceOverBySlug, getVoiceOverBySlug } from "../services/products";
import Products from "../module/products";
import Category from "../module/category";
import Categorymain from "../module/categorymain";
import Types from "../module/types";
import mongoose from "mongoose";
import WeekCategory from "../module/week.category";
import { cacheData, clearRelatedCache, getDataFromCache, redisDel } from "../redis";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import XLSX from "xlsx";
import { slugify } from "../utills/slugify";
import weekCategory from "../module/week.category";
import Series from "../module/season";
import { invalidateSeasonCacheByProduct } from "../utills/invalidateSeasonCache";
import redisClient from "../config/redis.config";
// import { RealtimeService } from "../services/realtime.service";

// Helper function để tính toán nextEpisode và prevEpisode
const calculateEpisodeNavigation = (dataID: any, slug: string) => {
  if (!dataID.category?.products) {
    return { nextEpisode: null, prevEpisode: null };
  }

  // Sort products by seri number in descending order
  const sortedProducts = dataID.category.products.sort(
    (a: any, b: any) => parseInt(b.seri) - parseInt(a.seri)
  );

  // Find current episode index
  const currentIndex = sortedProducts.findIndex((p: any) => p.slug === slug);

  // Get next episode if exists
  const nextEpisode = currentIndex > 0 ? sortedProducts[currentIndex - 1] : null;

  // Get current episode
  const prevEpisode = sortedProducts[currentIndex + 1];

  return {
    nextEpisode: nextEpisode?.slug || null,
    prevEpisode: prevEpisode?.slug || null,
  };
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const limit = 20;
    const page = parseInt(req.query.page as string) || 1;
    const categoryId = req.query.categoryId as string;
    const seri = req.query.seri as string; // Đổi từ episode thành seri

    // Tạo key cache dựa trên các tham số filter
    let key: string;
    if (page === 0) {
      key = `products_all_${categoryId || 'no-cat'}_${seri || 'no-seri'}`;
    } else {
      key = `products_page_${page}_${categoryId || 'no-cat'}_${seri || 'no-seri'}`;
    }

    const redisData: any = await getDataFromCache(key);
    let products: any;
    let totalCount: number;

    if (redisData) {
      ({ products, totalCount } = redisData);
    } else {
      if (page === 0) {
        products = await getAll(0, 0, categoryId, seri);
        totalCount = products.length;
      } else {
        products = await getAll(page, limit, categoryId, seri);
        totalCount = await getProductCount(categoryId, seri);
      }

      cacheData(key, { products, totalCount }, "EX", 3600);

      Products.watch().on("change", async (change) => {
        if (["insert", "delete", "update"].includes(change.operationType)) {
          await clearRelatedCache(categoryId, seri);

          let updatedProducts;
          if (page === 0) {
            updatedProducts = await getAll(0, 0, categoryId, seri);
            totalCount = updatedProducts.length;
          } else {
            updatedProducts = await getAll(page, limit, categoryId, seri);
            totalCount = await getProductCount(categoryId, seri);
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
      voiceOverLink,
      voiceOverLink2,
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
            dailyMotionServer: dailyMotionServer,
            trailer: trailer,
            voiceOverLink: voiceOverLink,
            voiceOverLink2: voiceOverLink2,
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

            // Xóa cache category khi có product mới
            const categoryData = await Category.findById(data.category).select('slug');
            if (categoryData?.slug) {
              await redisDel(`category_${categoryData.slug}`);
            }
            await redisDel("LASTESTCATEGORY");
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
          // await RealtimeService.notifyProductCreate(data._id.toString());
          return res.status(200).json({
            success: true,
            message: "Added product successfully",
          });
        }
      );
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
        dailyMotionServer: dailyMotionServer,
        video2: video2,
        trailer: trailer,
        voiceOverLink: voiceOverLink,
        voiceOverLink2: voiceOverLink2,
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

        // Xóa cache category khi có product mới
        const categoryData = await Category.findById(data.category).select('slug');
        if (categoryData?.slug) {
          await redisDel(`category_${categoryData.slug}`);
        }
        await redisDel("LASTESTCATEGORY");
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
      // await RealtimeService.notifyProductCreate(data._id.toString());
      return res.status(200).json({
        success: true,
        message: "Added product successfully",
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

      // Xóa cache category khi product bị xóa
      const categoryData = await Category.findById(deletedProduct.category).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
      await redisDel("LASTESTCATEGORY");

      const category_id = await Category.findOne({
        _id: deletedProduct.category,
      });

      if (category_id?.relatedSeasons) {
        const relatedSeasons = await Series.findOne({
          _id: category_id.relatedSeasons,
        });

        if (relatedSeasons?.slug) {
          await invalidateSeasonCacheByProduct(relatedSeasons.slug);
        }
      }

    }

    // Destroy product image if stored as Cloudinary public_id (fallback if URL)
    try {
      const destroyIfUrl = (url?: string) => {
        if (!url) return;
        // If url seems like a Cloudinary URL, derive public_id (with folder)
        // Example: https://res.cloudinary.com/<cloud>/image/upload/v1699999/folder/name.webp
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
        const publicId = match ? match[1] : undefined;
        cloudinary.uploader.destroy(publicId || url);
      };
      destroyIfUrl(deletedProduct.thumnail);
      destroyIfUrl(deletedProduct.image);
    } catch (e) {
      // ignore cloudinary cleanup errors
    }
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
    const findById = await Products.findById(id);
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
          findById.dailyMotionServer = dailyMotionServer;
          const data = await findById.save();
          const category_id = await Category.findOne({
            _id: data.category,
          });
          const relatedSeasons = await Series.findOne({
            _id: category_id?.relatedSeasons,
          });

          if (relatedSeasons?.slug) {
            await invalidateSeasonCacheByProduct(relatedSeasons.slug);
          }
          
          // Xóa cache cũ trước
          redisDel(findById.slug);
          
          // Xóa cache category khi product được cập nhật
          if (data.category) {
            const categoryData = await Category.findById(data.category).select('slug');
            if (categoryData?.slug) {
              await redisDel(`category_${categoryData.slug}`);
            }
            await redisDel("LASTESTCATEGORY");
          }
          
          // Lấy data mới với category để tính toán navigation
          const updatedData = await getOneEpisode(findById.slug);
          const navigation = calculateEpisodeNavigation(updatedData, findById.slug);
          
          // Cache lại data mới
          const response = {
            ...updatedData.toObject(),
            nextEpisode: navigation.nextEpisode,
            prevEpisode: navigation.prevEpisode,
          };
          await cacheData(findById.slug, response, "EX", 3600);
          
          // await RealtimeService.notifyProductUpdate(findById._id.toString());
          return res.status(200).json({
            success: true,
            message: "Dữ liệu sản phẩm đã được cập nhật.",
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

        const category_id: any = await Category.findOne({
          _id: findById.category,
        });

        if (category_id?.relatedSeasons) {
          const relatedSeasons = await Series.findOne({
            _id: category_id.relatedSeasons,
          });

          if (relatedSeasons?.slug) {
            await invalidateSeasonCacheByProduct(relatedSeasons.slug);
          }
        }

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
      findById.dailyMotionServer = dailyMotionServer;
      
      // Xóa cache cũ trước
      redisDel(findById.slug);
      
      // Xóa cache category khi product được cập nhật
      if (findById.category) {
        const categoryData = await Category.findById(findById.category).select('slug');
        if (categoryData?.slug) {
          await redisDel(`category_${categoryData.slug}`);
        }
        await redisDel("LASTESTCATEGORY");
      }
      
      const data = await findById.save();
      
      // Lấy data mới với category để tính toán navigation
      const updatedData = await getOneEpisode(findById.slug);
      const navigation = calculateEpisodeNavigation(updatedData, findById.slug);
      
      // Cache lại data mới
      const response = {
        ...updatedData.toObject(),
        nextEpisode: navigation.nextEpisode,
        prevEpisode: navigation.prevEpisode,
      };
      await cacheData(findById.slug, response, "EX", 3600);
      
      return res.status(200).json({
        success: true,
        message: "Dữ liệu sản phẩm đã được cập nhật.",
      });
    }

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
    
    // Lấy danh sách category của các product sẽ bị xóa để xóa cache
    const productsToDelete = await Products.find({ _id: { $in: id } }).select('category');
    const categoryIds = [...new Set(productsToDelete.map(p => p.category).filter(Boolean))];
    
    const data = await Products.remove({
      _id: {
        $in: id,
      },
    });
    
    // Xóa cache category cho tất cả category bị ảnh hưởng
    for (const categoryId of categoryIds) {
      const categoryData = await Category.findById(categoryId).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
    }
    await redisDel("LASTESTCATEGORY");
    
    return res.status(200).json({
      success: true,
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
    return res.json(newData);
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


export const getOne = async (req: Request, res: Response) => {
  try {
    const slug = req.params.id.toString(); // Đây là slug

    // Check cache trước
    const redisGetdata = await getDataFromCache(slug);
    if (redisGetdata) {
      console.log(`Cache hit for slug: ${slug}`);
      return res.status(200).json(redisGetdata);
    }

    // Nếu không có cache, xử lý trực tiếp
    const dataID: any = await getOneEpisode(slug);

    if (!dataID) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tính toán navigation episodes
    const navigation = calculateEpisodeNavigation(dataID, slug);
    
    // Add nextEpisode and currentEpisode to response
    const response = {
      ...dataID.toObject(),
      nextEpisode: navigation.nextEpisode,
      prevEpisode: navigation.prevEpisode,
    };

    dataID.view += 1;
    await dataID.save();

    // Sử dụng cache thường
    await cacheData(slug, response, "EX", 3600);

    return res.status(200).json(response);
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
    // Validate request data
    const { selectedSheets } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file Excel"
      });
    }

    if (!selectedSheets || isNaN(Number(selectedSheets))) {
      return res.status(400).json({
        success: false,
        message: "Index sheet không hợp lệ"
      });
    }

    // Read Excel file
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    // Validate sheet index
    const sheetIndex = Number(selectedSheets);
    if (sheetIndex < 0 || sheetIndex >= sheetNames.length) {
      return res.status(400).json({
        success: false,
        message: `Index sheet ${sheetIndex} không tồn tại. Chỉ có ${sheetNames.length} sheet(s)`
      });
    }

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetNames[sheetIndex]],
      { 
        header: 1, // Use first row as header
        defval: "" // Default value for empty cells
      }
    );

    if (!jsonData || jsonData.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu trong sheet được chọn"
      });
    }

    // Process data - skip header row
    const headers:any = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // Validate required headers
    const requiredFields = ['name', 'seri', 'category'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`
      });
    }

    // Transform data
    const productsToInsert = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed
      
      try {
        // Create row object from headers and data
        const rowData:any = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });

        // Validate required fields
        if (!rowData.name || !rowData.seri || !rowData.category) {
          errors.push(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc (name, seri, category)`);
          continue;
        }

        // Validate category ID format
        if (!mongoose.Types.ObjectId.isValid(rowData.category)) {
          errors.push(`Dòng ${rowNumber}: Category ID không hợp lệ`);
          continue;
        }

        // Check if category exists
        const categoryExists = await Category.findById(rowData.category);
        if (!categoryExists) {
          errors.push(`Dòng ${rowNumber}: Category không tồn tại`);
          continue;
        }

        // Generate slug
        const slug = `${slugify(rowData.name)}-episode-${rowData.seri}`;
        
        // Check for duplicate slug
        const existingProduct = await Products.findOne({ slug });
        if (existingProduct) {
          errors.push(`Dòng ${rowNumber}: Sản phẩm với slug '${slug}' đã tồn tại`);
          continue;
        }

        // Prepare product data
        const productData = {
          name: rowData.name.trim(),
          seri: rowData.seri.toString().trim(),
          category: mongoose.Types.ObjectId.createFromHexString(rowData.category),
          slug: slug,
          // Optional fields with defaults
          description: rowData.description || '',
          image: rowData.image || '',
          videoUrl: rowData.videoUrl || '',
          dailymotionServer: rowData.dailymotionServer || '',
          isApproved: rowData.isApproved === 'true' || rowData.isApproved === true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        productsToInsert.push(productData);
      } catch (rowError) {
        errors.push(`Dòng ${rowNumber}: ${rowError.message}`);
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Có lỗi trong dữ liệu Excel",
        errors: errors
      });
    }

    // If no valid products to insert
    if (productsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm hợp lệ để thêm"
      });
    }

    // Insert products
    const insertedProducts = await Products.insertMany(productsToInsert, {
      ordered: false // Continue inserting even if some fail
    });

    // Update categories
    const categoryUpdates = new Map();
    
    for (const product of insertedProducts) {
      if (!categoryUpdates.has(product.category.toString())) {
        categoryUpdates.set(product.category.toString(), []);
      }
      categoryUpdates.get(product.category.toString()).push(product._id);
    }

    // Batch update categories
    for (const [categoryId, productIds] of categoryUpdates) {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          $addToSet: { products: { $each: productIds } },
          latestProductUploadDate: new Date()
        },
        { new: true }
      );
    }

    // Clean up uploaded file
    try {
      const fs = require('fs');
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn('Không thể xóa file tạm:', cleanupError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Thêm thành công ${insertedProducts.length} sản phẩm từ Excel`,
      data: {
        inserted: insertedProducts.length,
        totalRows: dataRows.length,
        skipped: dataRows.length - insertedProducts.length
      }
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Không thể xóa file tạm sau lỗi:', cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý file Excel",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const clearCacheProducts = async (req, res) => {
  try {
    const key = "products_page_1_no-cat_no-seri";
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
    
    // Lấy danh sách category của các product sẽ được cập nhật để xóa cache
    const productsToUpdate = await Products.find({ _id: { $in: arrId } }).select('category');
    const categoryIds = [...new Set(productsToUpdate.map(p => p.category).filter(Boolean))];
    
    for (const id of arrId) {
      const product = await Products.findById(id).select("dailyMotionServer");
      if (product) {
        await Products.findByIdAndUpdate(id, { dailyMotionServer: product.dailyMotionServer });
      }
    }
    
    // Xóa cache category cho tất cả category bị ảnh hưởng
    for (const categoryId of categoryIds) {
      const categoryData = await Category.findById(categoryId).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
    }
    await redisDel("LASTESTCATEGORY");
    
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
    
    // Lấy danh sách category của các product sẽ được approve để xóa cache
    const productsToApprove = await Products.find({ _id: { $in: id } }).select('category');
    const categoryIds = [...new Set(productsToApprove.map(p => p.category).filter(Boolean))];
    
    const data = await Products.updateMany(
      { _id: { $in: id } },
      { $set: { isApproved: true } }
    );
    
    // Xóa cache category cho tất cả category bị ảnh hưởng
    for (const categoryId of categoryIds) {
      const categoryData = await Category.findById(categoryId).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
    }
    await redisDel("LASTESTCATEGORY");
    
    return res.status(200).json({
      success: true,
      id: id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadProductThumbnail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    cloudinary.uploader.upload(
      file.path,
      {
        folder: "episode-thumbnails",
        public_id: file.originalname,
        overwrite: true,
        crop: "fill",
        format: "webp",
      },
      async (error: any, result: any) => {
        if (error) {
          return res.status(500).json(error);
        }

        const updated = await Products.findByIdAndUpdate(
          id,
          { $set: { thumnail: result.secure_url || result.url } },
          { new: true }
        ).exec();

        // Xóa cache category khi thumbnail được cập nhật
        if (updated?.category) {
          const categoryData = await Category.findById(updated.category).select('slug');
          if (categoryData?.slug) {
            await redisDel(`category_${categoryData.slug}`);
          }
          await redisDel("LASTESTCATEGORY");
        }

        return res.status(200).json({ success: true });
      }
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductThumbnail = uploadProductThumbnail;

export const autoAddProduct = async (req, res) => {
  try {
    const weeks = await weekCategory.find().select("name").sort({ name: 1 });
    const daysOfWeek = await Promise.all(weeks.map((items) => items.name));
    const now = new Date();

    const dayIndex = now.getDay();

    const day = daysOfWeek[dayIndex];

    const weekData: any = await weekCategory.findOne({ name: day }).populate({
      path: "category",
      select: "name slug relatedSeasons",
      populate: {
        path: "products",
        model: "Products",
        select: "seri isApproved slug",
      },
    });

    const relatedSeasons = await Series.find({
      _id: { $in: weekData.category?.relatedSeasons },
    });

    const seasonSlugs = relatedSeasons.map(season => season.slug);
    // Xóa cache cho tất cả các season liên quan
    await invalidateSeasonCacheByProduct(seasonSlugs);
    // await RealtimeService.notifyProductUpdate(null);
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
          seri: episode.toString(),
          dailyMotionServer: "",
        };
      })
    );
    const newMovie = await Products.insertMany(newData);

    const categoryIds = new Set();
    await Promise.all(
      newMovie.map(async (movie) => {
        categoryIds.add(movie.category);
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

    // Xóa cache category cho tất cả category bị ảnh hưởng
    for (const categoryId of categoryIds) {
      const categoryData = await Category.findById(categoryId).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
    }
    await redisDel("LASTESTCATEGORY");

    return res.status(200).json({
      success: true,
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

export const clearCacheRedisAndQueue = async (req: Request, res: Response) => {
  try {
    const keys = await redisClient.keys("*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return res.json({
      success: true,
      message: "Cache & Queue cleared successfully!",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



export const addMultipleEpisodes = async (req, res) => {
  const {
    name,
    category,
    video2,
    view,
    country,
    trailer,
    dailyMotionServer,
    fromEpisode, // số tập bắt đầu
    toEpisode,   // số tập kết thúc
  } = req.body;

  try {
    const addedMovies = [];

    for (let seri = fromEpisode; seri <= toEpisode; seri++) {
      const slug = `${slugify(name)}-episode-${seri}`;

      const dataAdd = {
        name,
        slug,
        category: category || undefined,
        seri,
        link: video2,
        uploadDate: new Date(),
        view,
        country,
        trailer,
        dailyMotionServer:dailyMotionServer,
      };

      const data: any = await Products.create(dataAdd);

      // Cập nhật Category, Categorymain, Type
      if (data.category) {
        await Category.findByIdAndUpdate(data.category, {
          $addToSet: { products: data.products },
          latestProductUploadDate: data.uploadDate,
        });
      }
      addedMovies.push(data);
    }

    // Xóa cache category sau khi thêm nhiều episode
    if (category) {
      const categoryData = await Category.findById(category).select('slug');
      if (categoryData?.slug) {
        await redisDel(`category_${categoryData.slug}`);
      }
      await redisDel("LASTESTCATEGORY");
    }

    return res.status(200).json({
      success: true,
      message: `Added ${addedMovies.length} episodes successfully`,
      data: addedMovies,
    });
  } catch (error) {
    console.error("Error adding multiple episodes:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const editVoiceOverBySlugController = async (req, res) => {
  try {
    const { voiceOverLink, voiceOverLink2 } = req.body;
    const data: any = await addVoiceOverBySlug(req.params.slug, voiceOverLink, voiceOverLink2);
    redisDel(`${data.slug}`);
    redisDel(`category${data.category._id}`);
    return res.status(200).json({ success: true, message: "Voice over added successfully", data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getVoiceOverBySlugController = async (req, res) => {
  try {
    const data = await getVoiceOverBySlug(req.params.slug);
    return res.status(200).json({ success: true, message: "Voice over fetched successfully", data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};