import { Request, Response } from "express";
import Series from "../module/season";
import Category from "../module/category";
import slugify from "slugify";
import { cacheData } from "../redis";
import { getDataFromCache } from "../redis";
import { resizeImageUrl } from "../utills/resizeImage";

// Get all seasons with their linked categories
export const getAllSeasons = async (req: Request, res: Response) => {
  try {
    const seasons = await Series.find().populate(
      "categories",
      "name description _id"
    );
    res.status(200).json(seasons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seasons", error });
  }
};

export const getAllSeasonsByActive = async (req: Request, res: Response) => {
  try {
    const seasons = await Series.find({ isActive: true })
      .populate("categories", "name -_id up linkImg anotherName slug")
      .select("name slug -_id categories");

    const categoryTopRate: any = await Category
      .find()
      .sort({ up: -1 })
      .limit(3)
      .select("name anotherName up -_id year linkImg slug");

    res.status(200).json({
      seasons,
      categoryTopRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seasons", error });
  }
};

export const getAllSeasonsHeader = async (req: Request, res: Response) => {
  try {
    const seasons = await Series.find()
      .where("isActive")
      .equals(true)
      .select("name slug");
    res.status(200).json(seasons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seasons", error });
  }
};

// Get a single season by ID with linked categories
export const getSeasonById = async (req: Request, res: Response) => {
  try {
    const redisKey = `season:${req.params.slug}`;
    const cachedData = await getDataFromCache(redisKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
      });
    }

    const season = await Series.findOne({ slug: req.params.slug })
      .select("name slug _id")
      .populate({
        path: "categories",
        select: "name sumSeri slug linkImg des _id",
      });

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    const categoryIds = season.categories
      ?.map((cat: any) => cat._id)
      .filter(Boolean);

    if (!categoryIds || categoryIds.length === 0) {
      const seasonData = {
        ...season.toObject(),
        categories: [],
      };
      await cacheData(redisKey, seasonData);
      return res.json({
        success: true,
        data: seasonData,
      });
    }

    const latestProducts = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await Category.findById(categoryId)
          .select("_id")
          .populate({
            path: "products",
            select: "slug seri _id",
            options: {
              sort: { createdAt: -1 },
              limit: 1,
            },
          });
        return {
          _id: category._id,
          products: category.products,
        };
      })
    );

    const categoriesWithProduct = season.categories.map((cat: any) => {
      const match = latestProducts.find(
        (c: any) => c._id.toString() === cat._id.toString()
      );
      const lastProduct = match?.products?.[0] || null;

      return {
        ...cat.toObject(),
        lastProduct,
      };
    });

    const seasonData = {
      ...season.toObject(),
      categories: categoriesWithProduct,
    };

    await cacheData(redisKey, seasonData);

    res.json({
      success: true,
      data: seasonData,
    });
  } catch (error) {
    console.error("Error in getSeasonById:", error);
    res.status(500).json({ message: "Error fetching season", error });
  }
};

// Create a new season
export const createSeason = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      partNumber,
      categories,
      releaseYear,
      totalEpisodes,
    } = req.body;

    // Generate slug from name
    let slug = slugify(name, {
      lower: true, // Convert to lower case
      strict: true, // Strip special characters
      locale: "vi", // Handle Vietnamese characters
      trim: true, // Trim spaces from beginning and end
    });

    // Check if slug exists
    const existingSlug = await Series.findOne({ slug });
    if (existingSlug) {
      // If slug exists, append a random string
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
    }

    const season = new Series({
      name,
      description,
      categories,
      releaseYear,
      isActive: true,
      slug,
    });

    const savedSeason = await season.save();

    // Update related categories with the new season
    if (categories && categories.length > 0) {
      await Category.updateMany(
        { _id: { $in: categories } },
        { $push: { relatedSeasons: savedSeason._id } }
      );
    }

    res.status(201).json(savedSeason);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating season", error });
  }
};

// Update a season
export const updateSeason = async (req: Request, res: Response) => {
  try {
    const { name, ...otherData } = req.body;
    let updateData = { ...otherData };

    // Only update slug if name is changed
    if (name) {
      let slug = slugify(name, {
        lower: true,
        strict: true,
        locale: "vi",
        trim: true,
      });

      // Check if new slug exists and is different from current
      const existingSlug = await Series.findOne({
        slug,
        _id: { $ne: req.params.id },
      });

      if (existingSlug) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      }

      if (Array.isArray(updateData.categories) && updateData.categories.length > 0) {
        updateData.categories = updateData.categories.map(c => typeof c === 'object' && c.value ? c.value : c);
      }

      updateData = {
        ...updateData,
        name,
        slug,
      };
    }

    const season = await Series.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("categories", "name description _id");

    if (!season) {
      return res
        .status(404)
        .json({ success: false, message: "Season not found" });
    }

    res.json({ success: true, data: season });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a season
export const deleteSeason = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const season = await Series.findById(id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    // Remove season reference from all related categories
    await Category.updateMany(
      { relatedSeasons: id },
      { $pull: { relatedSeasons: id } }
    );

    await Series.findByIdAndDelete(id);
    res.status(200).json({ message: "Season deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting season", error });
  }
};

// Add categories to a series
export const addCategoriesToSeries = async (req: Request, res: Response) => {
  try {
    const { seriesId } = req.params;
    const { categoryIds } = req.body;

    // Convert single categoryId to array if needed
    const categoryIdsArray = Array.isArray(categoryIds)
      ? categoryIds
      : [categoryIds];

    // Validate if series exists
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Validate if all categories exist
    const categories = await Category.find({ _id: { $in: categoryIdsArray } });
    if (categories.length !== categoryIdsArray.length) {
      return res.status(400).json({ message: "Some categories do not exist" });
    }

    // Add categories to series
    const updatedSeries = await Series.findByIdAndUpdate(
      seriesId,
      {
        $addToSet: { categories: { $each: categoryIdsArray } },
      },
      { new: true }
    ).populate("categories", "name description -_id");

    // Update relatedSeasons in categories
    await Category.updateMany(
      { _id: { $in: categoryIdsArray } },
      { relatedSeasons: seriesId }
    );

    res.status(200).json(updatedSeries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding categories to series", error });
  }
};

export const getSeriesByCategories = async (req: Request, res: Response) => {
  try {
    const { seriesId } = req.params;
    const series = await Series.findById(seriesId).populate(
      "categories",
      "name description -_id"
    );
    res.status(200).json(series);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching series categories", error });
  }
};

// Get all categories of a series
export const getSeriesCategories = async (req: Request, res: Response) => {
  try {
    const { seriesId, categoryId } = req.query;

    // Nếu không có seriesId thì return empty
    if (!seriesId || seriesId === "undefined") {
      return res.status(200).json({
        data: [],
        success: true
      });
    }

    // Lấy series
    const series = await Series.findById(seriesId).lean();
    if (!series) {
      return res.status(200).json({
        data: [],
        success: true
      });
    }

    // Lấy categories liên quan từ series (chỉ name và slug)
    let relatedCategories = await Category.aggregate([
      { $match: { _id: { $in: series.categories } } },
      { $sort: { up: -1 } },
      {
        $project: {
          name: 1,
          slug: 1
        },
      },
    ]);

    // Nếu có categoryId cần loại bỏ thì filter
    if (categoryId) {
      relatedCategories = relatedCategories.filter(
        (category: any) => category._id.toString() !== categoryId
      );
    }

    return res.status(200).json({
      data: relatedCategories,
      success: true
    });
  } catch (error) {
    console.error("getSeriesCategories error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching series categories", error });
  }
};

// Remove categories from a series
export const removeCategoriesFromSeries = async (
  req: Request,
  res: Response
) => {
  try {
    const { seriesId } = req.params;
    const { categoryIds } = req.body;

    // Convert single categoryId to array if needed
    const categoryIdsArray = Array.isArray(categoryIds)
      ? categoryIds
      : [categoryIds];

    // Validate if series exists
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Remove categories from series
    const updatedSeries = await Series.findByIdAndUpdate(
      seriesId,
      {
        $pull: { categories: { $in: categoryIdsArray } },
      },
      { new: true }
    ).populate("categories", "name description -_id");

    // Remove series reference from categories
    await Category.updateMany(
      { _id: { $in: categoryIdsArray } },
      { $unset: { relatedSeasons: "" } }
    );

    res.status(200).json(updatedSeries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing categories from series", error });
  }
};
