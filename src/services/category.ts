import Category from "../module/category";
import { resizeImagesUrl } from "../utills/resizeImage";

export const getAllCategory = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const categories = await Category.find()
    .select("name linkImg seri time type year sumSeri up week slug isActive")
    .lean()
    .sort({ up: -1 })
    .populate("products", "seri slug")
    .skip(skip)
    .limit(limit)
    .exec();
  const categoryWithImage = resizeImagesUrl(categories, "linkImg", 250, 300);
  return categoryWithImage;
};

export const getCategory = async (id) => {
  const category = await Category.findOne({ slug: id })
    .select(
      "name linkImg sumSeri type year time lang quality slug country averageRating percentages totalRatings rating des up isMovie"
    )
    .populate({
      path: "products",
      model: "Products",
      select: "seri isApproved category slug comment",
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
