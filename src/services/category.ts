import Category from "../module/category";
import { resizeCloudinaryImage, resizeImagesUrl, resizeImageUrl } from "../utills/resizeImage";

export const getAllCategory = async (page: number, limit: number, search?: string, version?: string) => {
  let query: any = {};

  // Filter by version if provided
  if (version && version.trim()) {
    // Handle cases where vs field might be null or undefined
    if (version.trim() === '3d') {
      query.$or = [
        { vs: '3d' },
        { vs: { $exists: false } }, // Include categories without vs field (default to 3d)
        { vs: null }
      ];
    } else if (version.trim() === '2d') {
      query.vs = '2d';
    }
  }

  // Filter by search if provided
  if (search && search.trim()) {
    const searchQuery = {
      $or: [
        { name: { $regex: search.trim(), $options: "i" } },
        { slug: { $regex: search.trim(), $options: "i" } },
        { des: { $regex: search.trim(), $options: "i" } },
        { vs: { $regex: search.trim(), $options: "i" } }
      ]
    };
    
    // If we already have a version filter, combine with AND
    if (query.$or || query.vs) {
      query = {
        $and: [
          query,
          searchQuery
        ]
      };
    } else {
      query = searchQuery;
    }
  }
  // Chỉ select những field cần thiết
  const selectFields = {
    _id: 1, 
    name: 1,
    slug: 1,
    linkImg: 1,
    createdAt: 1,
    time: 1,
    status: 1,
    year: 1,
    up: 1,
    week: 1,
    isActive: 1,
    vs: 1,
  };
  if (page === 0 && limit === 0) {
    return await Category.find(query)
      .select(selectFields)
      .sort({ up: -1 })
      .populate({
        path: "week",
        model: "Week",
        select: "name -_id",
      })
  } else {
    const skip = (page - 1) * limit;
    return await Category.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "week",
        model: "Week",
        select: "name -_id",
      })
 
  }
};

export const getCategoriesSitemap = async () => {
  const categories = await Category.find()
    .select("slug -_id")
    .lean()
    .sort({ up: -1 })
    .populate({
      path: "products",
      select: "seri slug -_id"
    })
    .exec();

  const categoryWithImage = resizeImagesUrl(categories, "linkImg", 300, 400);
  return categoryWithImage;
};


export const getCategory = async (id) => {
  const category = await Category.findOne({ slug: id })
    .select(
      "name linkImg sumSeri year time lang quality slug country des up isMovie hour anotherName relatedSeasons newMovie status thuyetMinh vs"
    )
    .populate({
      path: "products",
      model: "Products",
      select: "seri slug thumnail",
    })
    .populate({
      path: "week",
      model: "Week",
      select: "name",
    })
    .populate({
      path: "tags",
      model: "Tags",
      select: "name slug _id",
    })
    .populate({
      path: "posters",
      model: "Poster",
      select: "imageUrl _id aspect coverPoster",
    })
    .populate({
      path: "combiningEpisodes",
      model: "combiningEpisodes",
      select: "name slug episodesName link1 link2 link3 -_id",
    }).lean();

  category?.products?.sort(
    (a: any, b: any) => parseInt(b.seri) - parseInt(a.seri)
  );

  category?.combiningEpisodes?.sort((a, b) => {
    const getStartEp = (ep) => parseInt(ep.episodesName?.split("-")[0]);
    return getStartEp(b) - getStartEp(a);
  });

  return category;
};


export const addCategory = async (data) => {
  return await new Category(data).save();
};

export const deleteCategory = async (id) => {
  return await Category.findOneAndDelete({ _id: id });
};

export const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data);
};
