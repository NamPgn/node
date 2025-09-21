import { Request, Response } from "express";
import Poster from "../module/poster";
import Category from "../module/category";
import { deleteImageFromCloudinary, uploadImageToCloudinaryWithInfo } from "../common";
import { Types } from "mongoose";

// Type definitions
interface CreatePosterRequest {
  category: string;
  title?: string;
  alt?: string;
  aspect?: "1:1" | "16:9" | "4:3" | "3:2" | "21:9" | "9:16" | "2:3";
  coverPoster?: "cover" | "poster";
}

interface UpdatePosterRequest {
  category?: string;
  title?: string;
  alt?: string;
  isActive?: boolean;
  aspect?: "1:1" | "16:9" | "4:3" | "3:2" | "21:9" | "9:16" | "2:3";
  coverPoster?: "cover" | "poster";
}

// Validation helpers
const validateObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

const validateCategory = async (categoryId: string): Promise<boolean> => {
  const category = await Category.findById(categoryId);
  return !!category;
};

export const createPoster = async (req: any, res: any) => {
  try {
    const { category, title, alt, aspect, coverPoster } = req.body as CreatePosterRequest;

    // Validation
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một ảnh!" });
    }
    if (!category) {
      return res.status(400).json({ message: "Thiếu category" });
    }
    if (!validateObjectId(category)) {
      return res.status(400).json({ message: "Category ID không hợp lệ" });
    }

    // Check if category exists
    const categoryExists = await validateCategory(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    // Upload image with optimized settings for posters
    const dims = getDimensionsByAspect(aspect);
    const { url: imageUrl, publicId } = await uploadImageToCloudinaryWithInfo(
      req.file as any,
      "posters",
      dims
    );

    // Use transaction for data consistency
    const session = await Poster.startSession();
    let poster;
    
    try {
      await session.withTransaction(async () => {
        // If this poster should be the cover, demote other posters in the same category first
        if (coverPoster === "cover") {
          await Poster.updateMany(
            { category },
            { $set: { coverPoster: "poster" } },
            { session }
          );
        }

        poster = await Poster.create([
          { category, title, alt, imageUrl, publicId, aspect: aspect || "16:9", coverPoster: coverPoster || "poster" }
        ], { session });
        await Category.findByIdAndUpdate(
          category, 
          { $push: { posters: poster[0]._id } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({ 
      data: poster[0], 
      message: "Tạo poster thành công" 
    });
  } catch (error: any) {
    console.error("Create poster error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// map aspect ratio to recommended width/height for transformation
function getDimensionsByAspect(aspect?: "1:1" | "16:9" | "4:3" | "3:2" | "21:9" | "9:16" | "2:3") {
  switch (aspect) {
    case "1:1":
      return { width: 1200, height: 1200, quality: "auto:good" };
    case "4:3":
      return { width: 1600, height: 1200, quality: "auto:good" };
    case "3:2":
      return { width: 1800, height: 1200, quality: "auto:good" };
    case "21:9":
      return { width: 2520, height: 1080, quality: "auto:good" };
    case "9:16":
      return { width: 1080, height: 1920, quality: "auto:good" };
    case "2:3":
      return { width: 1200, height: 1800, quality: "auto:good" };
    case "16:9":
    default:
      return { width: 1920, height: 1080, quality: "auto:good" };
  }
}

export const getPosters = async (req: Request, res: Response) => {
  try {
    // Add pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const [posters, total] = await Promise.all([
      Poster.find(filter)
        .populate("category", "name slug") // Only get needed fields
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // Latest first
        .lean(), // Better performance
      Poster.countDocuments(filter)
    ]);

    return res.status(200).json({ 
      data: posters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get posters error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const getPostersByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    if (!validateObjectId(categoryId)) {
      return res.status(400).json({ message: "Category ID không hợp lệ" });
    }

    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [posters, total] = await Promise.all([
      Poster.find({ category: categoryId, isActive: true }) // Only active posters
        .populate("category", "name slug")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Poster.countDocuments({ category: categoryId, isActive: true })
    ]);

    return res.status(200).json({ 
      data: posters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Get posters by category error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const getPosterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Poster ID không hợp lệ" });
    }

    const poster = await Poster.findById(id)
      .populate("category", "name slug")
      .lean();
      
    if (!poster) {
      return res.status(404).json({ message: "Không tìm thấy poster" });
    }
    
    return res.status(200).json({ data: poster });
  } catch (error: any) {
    console.error("Get poster by ID error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const updatePoster = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { category, title, alt, isActive, aspect, coverPoster } = req.body as UpdatePosterRequest;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Poster ID không hợp lệ" });
    }

    if (category && !validateObjectId(category)) {
      return res.status(400).json({ message: "Category ID không hợp lệ" });
    }

    const poster = await Poster.findById(id);
    if (!poster) {
      return res.status(404).json({ message: "Không tìm thấy poster" });
    }

    // Check if new category exists
    if (category && category !== String(poster.category)) {
      const categoryExists = await validateCategory(category);
      if (!categoryExists) {
        return res.status(404).json({ message: "Category mới không tồn tại" });
      }
    }

    const session = await Poster.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Upload new image if provided
    if (req.file) {
      // delete old image then upload new
      if (poster.publicId) {
        try { await deleteImageFromCloudinary(poster.publicId); } catch {}
      }
      const dims = getDimensionsByAspect(aspect || poster.aspect as any);
      const { url: newUrl, publicId: newPublicId } = await uploadImageToCloudinaryWithInfo(
        req.file as any,
        "posters",
        dims
      );
      poster.imageUrl = newUrl;
      poster.publicId = newPublicId;
    }

        // Update category relationship
        if (category && String(poster.category) !== category) {
          await Promise.all([
            Category.findByIdAndUpdate(
              poster.category, 
              { $pull: { posters: poster._id } },
              { session }
            ),
            Category.findByIdAndUpdate(
              category, 
              { $push: { posters: poster._id } },
              { session }
            )
          ]);
          poster.category = category as any;
        }

        // Update other fields
        if (typeof title !== "undefined") poster.title = title;
        if (typeof alt !== "undefined") poster.alt = alt;
    if (typeof isActive !== "undefined") poster.isActive = isActive;
    if (typeof aspect !== "undefined") poster.aspect = aspect as any;

        // Handle coverPoster change ensuring only one cover per category
        if (typeof coverPoster !== "undefined") {
          if (coverPoster === "cover") {
            await Poster.updateMany(
              { category: poster.category, _id: { $ne: poster._id } },
              { $set: { coverPoster: "poster" } },
              { session }
            );
          }
          poster.coverPoster = coverPoster as any;
        }

        await poster.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({ 
      data: poster, 
      message: "Cập nhật poster thành công" 
    });
  } catch (error: any) {
    console.error("Update poster error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const deletePoster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Poster ID không hợp lệ" });
    }

    const session = await Poster.startSession();
    let deleted;
    
    try {
      await session.withTransaction(async () => {
        deleted = await Poster.findByIdAndDelete(id, { session });
        if (!deleted) {
          throw new Error("Poster not found");
        }
        
        await Category.findByIdAndUpdate(
          deleted.category, 
          { $pull: { posters: deleted._id } },
          { session }
        );
      });
      // destroy asset after doc delete within tx
      if (deleted?.publicId) {
        try { await deleteImageFromCloudinary(deleted.publicId); } catch {}
      }
    } catch (error: any) {
      if (error.message === "Poster not found") {
        return res.status(404).json({ message: "Không tìm thấy poster" });
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return res.status(200).json({ message: "Xóa poster thành công" });
  } catch (error: any) {
    console.error("Delete poster error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Bulk upload multiple posters
export const bulkCreatePosters = async (req: any, res: any) => {
  try {
    const { category, aspect, coverPoster } = req.body;
    const files = req.files;

    // Validation
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất một ảnh!" });
    }
    if (!category) {
      return res.status(400).json({ message: "Thiếu category" });
    }
    if (!validateObjectId(category)) {
      return res.status(400).json({ message: "Category ID không hợp lệ" });
    }

    // Check if category exists
    const categoryExists = await validateCategory(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    // Limit number of files
    if (files.length > 10) {
      return res.status(400).json({ message: "Chỉ được tải lên tối đa 10 ảnh cùng lúc" });
    }

    const dims = getDimensionsByAspect(aspect);
    const results = [];
    const errors = [];

    // Use transaction for data consistency
    const session = await Poster.startSession();
    
    try {
      await session.withTransaction(async () => {
        // If this should be cover, demote other posters in the same category first
        if (coverPoster === "cover") {
          await Poster.updateMany(
            { category },
            { $set: { coverPoster: "poster" } },
            { session }
          );
        }

        // Process each file
        for (let i = 0; i < files.length; i++) {
          try {
            const file = files[i];
            
            // Upload image with optimized settings for posters
            const { url: imageUrl, publicId } = await uploadImageToCloudinaryWithInfo(
              file,
              "posters",
              dims
            );

            // Create poster
            const poster = await Poster.create([{
              category,
              title: `Poster ${i + 1}`,
              alt: `Poster ${i + 1}`,
              imageUrl,
              publicId,
              aspect: aspect || "16:9",
              coverPoster: i === 0 && coverPoster === "cover" ? "cover" : "poster"
            }], { session });

            // Update category
            await Category.findByIdAndUpdate(
              category, 
              { $push: { posters: poster[0]._id } },
              { session }
            );

            results.push(poster[0]);
          } catch (fileError: any) {
            console.error(`Error processing file ${i + 1}:`, fileError);
            errors.push({
              fileIndex: i + 1,
              fileName: files[i].originalname,
              error: fileError.message
            });
          }
        }
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({ 
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Tạo thành công ${results.length} poster${errors.length > 0 ? `, ${errors.length} lỗi` : ''}`,
      successCount: results.length,
      errorCount: errors.length
    });
  } catch (error: any) {
    console.error("Bulk create posters error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Bulk operations for admin
export const bulkUpdatePosters = async (req: Request, res: Response) => {
  try {
    const { posterIds, updateData } = req.body as {
      posterIds: string[];
      updateData: Partial<UpdatePosterRequest>;
    };

    if (!posterIds || !Array.isArray(posterIds) || posterIds.length === 0) {
      return res.status(400).json({ message: "Danh sách poster ID không hợp lệ" });
    }

    const validIds = posterIds.filter(id => validateObjectId(id));
    if (validIds.length !== posterIds.length) {
      return res.status(400).json({ message: "Một số poster ID không hợp lệ" });
    }

    const result = await Poster.updateMany(
      { _id: { $in: validIds } },
      updateData,
      { runValidators: true }
    );

    return res.status(200).json({ 
      message: `Cập nhật thành công ${result.modifiedCount} poster`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    console.error("Bulk update error:", error);
    return res.status(500).json({ 
      message: "Lỗi server", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};