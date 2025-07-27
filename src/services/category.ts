import Category from "../module/category";
import { resizeImagesUrl } from "../utills/resizeImage";

export const getAllCategory = async (page: number, limit: number, search?: string) => {
  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { des: { $regex: search, $options: "i" } }
      ]
    };
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
   
  };

  if (page === 0 && limit === 0) {
    return await Category.find(query)
      .select(selectFields)
      .sort({ up: -1 });
  } else {
    const skip = (page - 1) * limit;
    return await Category.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
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
      "name linkImg sumSeri type year time lang quality slug country des up isMovie hour anotherName relatedSeasons newMovie status thuyetMinh"
    )
    .populate({
      path: "products",
      model: "Products",
      select: "seri isApproved category slug ",
    })
    .populate({
      path: "week",
      model: "Week",
      select: "name",
    })
    .populate({
      path: "tags",
      model: "Tags",
      select: "name slug -_id",
    })
    .populate({
      path: "combiningEpisodes",
      model: "combiningEpisodes",
      select: "name slug episodesName link1 link2 link3 -_id",
    });

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
