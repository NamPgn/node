import Category from "../module/category";
import { resizeImagesUrl } from "../utills/resizeImage";

export const getAllCategory = async (page: number, limit: number) => {
  // Nếu page = 0, lấy tất cả category không phân trang
  if (page === 0) {
    const categories = await Category.aggregate([
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
            { $project: { seri: 1 } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          linkImg: 1,
          seri: 1,
          time: 1,
          year: 1,
          week: 1,
          slug: 1,
          isActive: 1,
          products: 1,
        },
      },
    ]);
    return resizeImagesUrl(categories, "linkImg", 250, 300);
  }

  // Nếu page > 0, lấy theo phân trang
  const skip = (page - 1) * limit;
  const categories = await Category.aggregate([
    { $sort: { up: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "products",
        foreignField: "_id",
        as: "products",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { seri: 1 } },
        ],
      },
    },
    {
      $project: {
        name: 1,
        linkImg: 1,
        seri: 1,
        time: 1,
        year: 1,
        week: 1,
        slug: 1,
        isActive: 1,
        products: 1,
      },
    },
  ]);
  return resizeImagesUrl(categories, "linkImg", 250, 300);
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

  const categoryWithImage = resizeImagesUrl(categories, "linkImg", 250, 300);
  return categoryWithImage;
};


export const getCategory = async (id) => {
  const category = await Category.findOne({ slug: id })
    .select(
      "name linkImg sumSeri type year time lang quality slug country des up isMovie hour anotherName relatedSeasons"
    )
    .populate({
      path: "products",
      model: "Products",
      select: "seri isApproved category slug",
    })
    .populate({
      path: "week",
      model: "Week",
      select: "name",
    });

  category?.products?.sort(
    (a: any, b: any) => parseInt(b.seri) - parseInt(a.seri)
  );
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
