import { Request, Response } from "express";
import Series from "../module/season";
import Category from "../module/category";
import slugify from "slugify";
import { cacheData } from "../redis";
import { getDataFromCache } from "../redis";

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
      partNumber,
      categories,
      releaseYear,
      totalEpisodes,
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

    // Lấy top 5 category (nếu không có seriesId hoặc cần fallback)
    const getTop5Categories = async (excludeCategoryId?: any) => {
      const matchQuery = excludeCategoryId
        ? { _id: { $ne: excludeCategoryId } }
        : {};
      return await Category.aggregate([
        { $match: matchQuery },
        { $sort: { up: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "products",
            foreignField: "_id",
            as: "products",
            pipeline: [
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              { $project: { seri: 1, slug: 1, _id: 0 } },
            ],
          },
        },
        {
          $project: {
            name: 1,
            anotherName: 1,
            slug: 1,
            linkImg: 1,
            sumSeri: 1,
            lang: 1,
            quality: 1,
            products: 1,
          },
        },
      ]);
    };

    // Nếu không có seriesId thì return top 5
    if (!seriesId || seriesId === "undefined") {
      const topCategories = await getTop5Categories(categoryId);
      return res.status(200).json({ data: topCategories, success: true });
    }

    // Lấy series
    const series = await Series.findById(seriesId).lean();
    if (!series) {
      const topCategories = await getTop5Categories(categoryId);
      return res.status(200).json({ data: topCategories, success: true });
    }

    // Truy vấn categories từ aggregate
    let categories = await Category.aggregate([
      { $match: { _id: { $in: series.categories } } },
      { $sort: { up: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "products",
          foreignField: "_id",
          as: "products",
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { seri: 1, slug: 1, _id: 0 } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          anotherName: 1,
          slug: 1,
          linkImg: 1,
          sumSeri: 1,
          lang: 1,
          quality: 1,
          products: 1,
        },
      },
    ]);

    // Nếu có categoryId cần loại bỏ thì filter
    if (categoryId) {
      categories = categories.filter(
        (category: any) => category._id.toString() !== categoryId
      );

      // Nếu filter xong mà hết thì fallback
      if (categories.length === 0) {
        const topCategories = await getTop5Categories(categoryId);
        return res.status(200).json({ data: topCategories, success: true });
      }
    }

    return res.status(200).json({ data: categories, success: true });
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
