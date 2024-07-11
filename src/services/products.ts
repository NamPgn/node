import Products from "../module/products";

export const getAll = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return await Products.find().skip(skip).limit(limit).exec();
};

export const get = async (id) => {
  return await Products.findOne({ _id: id });
};

export const addProduct_ = async (data) => {
  return new Products(data).save();
};

export const deleteProduct = async (id) => {
  return await Products.findOneAndDelete({ _id: id });
};

export const editProductSevices = async (id, data) => {
  return await Products.findOneAndUpdate({ _id: id }, data);
};
