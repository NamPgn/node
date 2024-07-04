import Category from "../module/category";

export const getAllCategory = async () => {
  return await Category.find()
    .sort({ up: -1 })
    .populate("products", "seri")
    .exec();
};

export const getCategory = async (id) => {
  const category = await Category.findOne({ _id: id }).populate("products");
  category.products.sort((a:any, b:any) => parseInt(b.seri) - parseInt(a.seri));
  return category
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
