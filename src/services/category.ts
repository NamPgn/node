import Category from "../module/category";

export const getAllCategory = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const categories = await Category.find()
    .select("name linkImg seri time type year sumSeri up week slug isActive")
    .lean()
    .sort({ up: -1 })
    .populate("products", "seri")
    .skip(skip)
    .limit(limit)
    .exec();
  return categories;
};

export const getCategory = async (id) => {
  const category = await Category.findOne({ slug: id }).populate({
    path: "products",
    select: "seri isApproved category slug",
  });
  category.products.sort(
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
